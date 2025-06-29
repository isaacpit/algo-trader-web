import asyncio
import logging
import uuid
import traceback
import random
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import time

from database import get_database, DatabaseManager
from backtest_generator import BacktestGenerator
from models import BacktestJobStatus, BacktestJobPriority

logger = logging.getLogger(__name__)

class SlowdownConfig:
    """Configuration for artificial job processing slowdown"""
    def __init__(self, enabled: bool = False, min_seconds: int = 30, max_seconds: int = 120):
        self.enabled = enabled
        self.min_seconds = min_seconds
        self.max_seconds = max_seconds

class BacktestWorker:
    """Worker for processing backtest jobs asynchronously"""

    def __init__(self, db_manager: Optional[DatabaseManager] = None, slowdown_config: Optional[SlowdownConfig] = None):
        self.db_manager = db_manager or get_database()
        self.backtest_generator = BacktestGenerator()
        self.running = False
        self.poll_interval = 5  # seconds
        self.max_concurrent_jobs = 3
        self.active_jobs = set()
        self.slowdown_config = slowdown_config or SlowdownConfig()

        # Log slowdown configuration
        if self.slowdown_config.enabled:
            logger.warning("🐌 JOB PROCESSING SLOWDOWN IS ENABLED IN WORKER! 🐌")
            logger.warning(f"🐌 Jobs will be artificially delayed by {self.slowdown_config.min_seconds}-{self.slowdown_config.max_seconds} seconds")
        else:
            logger.info("✅ Job processing slowdown: DISABLED (normal performance)")

    async def start(self):
        """Start the backtest worker"""
        if self.running:
            logger.warning("Backtest worker is already running")
            return

        self.running = True
        logger.info("Starting backtest worker...")

        try:
            while self.running:
                await self._process_jobs()
                await asyncio.sleep(self.poll_interval)
        except Exception as e:
            logger.error(f"Error in backtest worker: {str(e)}")
            logger.error(f"Stack trace: {traceback.format_exc()}")
            self.running = False
        finally:
            logger.info("Backtest worker stopped")

    async def stop(self):
        """Stop the backtest worker"""
        self.running = False
        logger.info("Stopping backtest worker...")

    async def _process_jobs(self):
        """Process pending backtest jobs"""
        if not self.db_manager or not self.db_manager.is_connected():
            logger.warning("Database not connected, skipping job processing")
            return

        try:
            # Get pending jobs (limit based on available capacity)
            available_slots = self.max_concurrent_jobs - len(self.active_jobs)
            logger.info(f"Available slots: {available_slots}")
            if available_slots <= 0:
                return

            pending_jobs = await self.db_manager.get_pending_backtest_jobs(limit=available_slots)
            logger.info(f"Pending backtest jobs: {pending_jobs}")

            for job_data in pending_jobs:
                job_id = job_data['job_id']

                # Skip if already processing
                if job_id in self.active_jobs:
                    continue

                # Start processing job
                asyncio.create_task(self._process_job(job_data))

        except Exception as e:
            logger.error(f"Error processing jobs: {str(e)}")
            logger.error(f"Stack trace: {traceback.format_exc()}")

    async def _process_job(self, job_data: Dict[str, Any]):
        """Process a single backtest job"""
        job_id = job_data['job_id']
        self.active_jobs.add(job_id)

        try:
            logger.info(f"Starting to process backtest job: {job_id}")

            # Check if job was cancelled before we started
            if await self._is_job_cancelled(job_id):
                logger.info(f"Job {job_id} was cancelled before processing started")
                return

            # Update job status to running
            await self._update_job_status(job_id, BacktestJobStatus.RUNNING, {
                'started_at': datetime.utcnow().isoformat(),
                'progress': 10.0
            })

            # Apply artificial slowdown at initialization
            await self.apply_job_processing_slowdown(job_id, "initialization")

            # Check for cancellation after slowdown
            if await self._is_job_cancelled(job_id):
                logger.info(f"Job {job_id} was cancelled during initialization")
                return

            # Extract strategy definition
            strategy_definition = job_data['strategy_definition']

            # Prepare backtest request
            backtest_request = {
                'strategy_name': job_data['strategy_name'],
                'strategy_description': job_data['strategy_description'],
                'timeframe': job_data['timeframe'],
                'assets': job_data['assets'],
                'period': job_data['period'],
                'initial_capital': job_data['initial_capital'],
                'strategy_config': strategy_definition,
                'user_id': job_data['user_id']
            }

            # Update progress
            await self._update_job_status(job_id, BacktestJobStatus.RUNNING, {
                'progress': 30.0
            })

            # Apply artificial slowdown during processing
            await self.apply_job_processing_slowdown(job_id, "data_processing")

            # Check for cancellation after slowdown
            if await self._is_job_cancelled(job_id):
                logger.info(f"Job {job_id} was cancelled during data processing")
                return

            # Generate backtest
            logger.info(f"Generating backtest for job: {job_id}")
            backtest_result = await self.backtest_generator.generate_backtest(backtest_request)

            # Check for cancellation after generation
            if await self._is_job_cancelled(job_id):
                logger.info(f"Job {job_id} was cancelled after backtest generation")
                return

            # Update progress
            await self._update_job_status(job_id, BacktestJobStatus.RUNNING, {
                'progress': 70.0
            })

            # Apply artificial slowdown during storage
            await self.apply_job_processing_slowdown(job_id, "storage")

            # Check for cancellation after slowdown
            if await self._is_job_cancelled(job_id):
                logger.info(f"Job {job_id} was cancelled during storage phase")
                return

            # Store backtest result in database
            if self.db_manager and self.db_manager.is_connected():
                success = await self.db_manager.create_backtest(backtest_result)
                if not success:
                    raise Exception("Failed to store backtest result in database")

            # Update progress
            await self._update_job_status(job_id, BacktestJobStatus.RUNNING, {
                'progress': 90.0
            })

            # Add to feed table
            await self._add_to_feed(backtest_result, job_data['user_id'])

            # Apply final slowdown before completion
            await self.apply_job_processing_slowdown(job_id, "finalization")

            # Final cancellation check before marking complete
            if await self._is_job_cancelled(job_id):
                logger.info(f"Job {job_id} was cancelled during finalization")
                return

            # Mark job as completed
            completed_at = datetime.utcnow()
            actual_duration = int((completed_at - datetime.fromisoformat(job_data['created_at'])).total_seconds())

            await self._update_job_status(job_id, BacktestJobStatus.COMPLETED, {
                'completed_at': completed_at.isoformat(),
                'actual_duration': actual_duration,
                'progress': 100.0,
                'result_backtest_id': backtest_result['id']
            })

            logger.info(f"Successfully completed backtest job: {job_id}")

        except Exception as e:
            logger.error(f"Error processing backtest job {job_id}: {str(e)}")
            logger.error(f"Job data: {job_data}")
            logger.error(f"Stack trace: {traceback.format_exc()}")

            # Mark job as failed (unless it was cancelled)
            if not await self._is_job_cancelled(job_id):
                await self._update_job_status(job_id, BacktestJobStatus.FAILED, {
                    'error_message': str(e),
                    'completed_at': datetime.utcnow().isoformat()
                })

        finally:
            self.active_jobs.discard(job_id)

    async def _update_job_status(self, job_id: str, status: BacktestJobStatus, updates: Dict[str, Any]):
        """Update job status and other fields"""
        try:
            updates['status'] = status.value
            success = await self.db_manager.update_backtest_job(job_id, updates)
            if not success:
                logger.error(f"Failed to update job status for {job_id}")
        except Exception as e:
            logger.error(f"Error updating job status for {job_id}: {str(e)}")
            logger.error(f"Stack trace: {traceback.format_exc()}")

    async def _add_to_feed(self, backtest_data: Dict[str, Any], user_id: str):
        """Add completed backtest to the feed table"""
        try:
            # Get user data
            user_data = await self.db_manager.get_user(user_id)
            if not user_data:
                logger.warning(f"User {user_id} not found, skipping feed addition")
                return

            # Prepare feed item
            feed_item = {
                'item_id': backtest_data['id'],
                'item_type': 'backtest',
                'user_id': user_id,
                'backtest_id': backtest_data['id'],
                'name': backtest_data['name'],
                'description': backtest_data['description'],
                'timeframe': backtest_data['timeframe'],
                'assets': backtest_data['assets'],
                'period': backtest_data['period'],
                'initial_capital': backtest_data['initial_capital'],
                'final_capital': backtest_data['final_capital'],
                'status': backtest_data['status'],
                'performance': backtest_data['performance'],
                'chart_data': backtest_data['chart_data'],
                'strategy_config': backtest_data.get('strategy_config', {}),
                'created_at': backtest_data['created_at'],
                'updated_at': backtest_data['updated_at'],
                'likes': 0,
                'comments': 0,
                'shares': 0
            }

            # Add to feed table using the database manager's create_backtest method
            # This will handle the DynamoDB preparation internally
            success = await self.db_manager.create_backtest(backtest_data)
            if success:
                logger.info(f"Added backtest {backtest_data['id']} to feed")
            else:
                logger.error(f"Failed to add backtest {backtest_data['id']} to feed")

        except Exception as e:
            logger.error(f"Error adding backtest to feed: {str(e)}")

    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get the status of a specific job"""
        if not self.db_manager or not self.db_manager.is_connected():
            return None

        try:
            return await self.db_manager.get_backtest_job(job_id)
        except Exception as e:
            logger.error(f"Error getting job status for {job_id}: {str(e)}")
            return None

    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a pending or running job"""
        if not self.db_manager or not self.db_manager.is_connected():
            return False

        try:
            job_data = await self.db_manager.get_backtest_job(job_id)
            if not job_data:
                return False

            status = job_data['status']
            if status not in ['pending', 'running']:
                logger.warning(f"Cannot cancel job {job_id} with status {status}")
                return False

            # Update job status to cancelled
            success = await self.db_manager.update_backtest_job(job_id, {
                'status': BacktestJobStatus.CANCELLED.value,
                'completed_at': datetime.utcnow().isoformat()
            })

            if success:
                logger.info(f"Cancelled backtest job: {job_id}")
                self.active_jobs.discard(job_id)

            return success

        except Exception as e:
            logger.error(f"Error cancelling job {job_id}: {str(e)}")
            return False

    async def apply_job_processing_slowdown(self, job_id: str, step: str):
        """Apply artificial slowdown during job processing if enabled"""
        if self.slowdown_config.enabled:
            delay_seconds = random.randint(self.slowdown_config.min_seconds, self.slowdown_config.max_seconds)
            logger.warning(f"🐌 [{job_id}] Applying artificial slowdown at {step}: {delay_seconds}s")
            await asyncio.sleep(delay_seconds)

    async def _is_job_cancelled(self, job_id: str) -> bool:
        """Check if a job has been cancelled"""
        try:
            job_data = await self.db_manager.get_backtest_job(job_id)
            if job_data is None:
                return False
            return job_data.get('status') == 'cancelled'
        except Exception as e:
            logger.error(f"Error checking cancellation status for job {job_id}: {str(e)}")
            return False

# Global worker instance
backtest_worker = None

def get_backtest_worker(slowdown_config: Optional[SlowdownConfig] = None) -> BacktestWorker:
    """Get the global backtest worker instance"""
    global backtest_worker
    if backtest_worker is None:
        backtest_worker = BacktestWorker(slowdown_config=slowdown_config)
    return backtest_worker

async def start_backtest_worker(slowdown_config: Optional[SlowdownConfig] = None):
    """Start the global backtest worker"""
    worker = get_backtest_worker(slowdown_config)
    await worker.start()

async def stop_backtest_worker():
    """Stop the global backtest worker"""
    global backtest_worker
    if backtest_worker:
        await backtest_worker.stop()
        backtest_worker = None
