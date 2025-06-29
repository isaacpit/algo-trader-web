#!/usr/bin/env python3
"""
Test script for the backtest job system
"""

import asyncio
import logging
import sys
import os
from datetime import datetime

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import initialize_database, get_database
from backtest_worker import BacktestWorker
from models import BacktestJobStatus, BacktestJobPriority, StrategyDefinition, StrategyCondition, Condition, ConditionType, LogicOperator, Timeframe

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_backtest_job_system():
    """Test the complete backtest job system"""

    # Initialize database
    logger.info("Initializing database...")
    initialize_database(
        user_table_name="test_users",
        feed_table_name="test_feed",
        feed_table_name="test_backtest_jobs",
        region="us-east-1",
        use_localstack=True,
        localstack_endpoint="http://localhost:4566"
    )

    db = get_database()
    if not db or not db.is_connected():
        logger.error("Failed to connect to database")
        return False

    # Create a test user
    test_user_id = "test_user_123"
    user_data = {
        "id": test_user_id,
        "email": "test@example.com",
        "name": "Test User",
        "picture": None,
        "verified": True,
        "followers": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    success = await db.create_user(user_data)
    if not success:
        logger.error("Failed to create test user")
        return False

    logger.info("Created test user successfully")

    # Create a test strategy definition
    strategy_definition = StrategyDefinition(
        name="Test RSI Strategy",
        description="A simple RSI-based strategy for testing",
        timeframe=Timeframe.ONE_HOUR,
        assets=["BTC/USD"],
        template_id="momentum",
        custom_indicators=[],
        entry_conditions=StrategyCondition(
            conditions=[
                Condition(
                    type="indicator",
                    indicator="RSI",
                    condition=ConditionType.BELOW,
                    value=30,
                    operator=LogicOperator.AND
                )
            ],
            operator=LogicOperator.AND
        ),
        exit_conditions=StrategyCondition(
            conditions=[
                Condition(
                    type="indicator",
                    indicator="RSI",
                    condition=ConditionType.ABOVE,
                    value=70,
                    operator=LogicOperator.OR
                )
            ],
            operator=LogicOperator.OR
        ),
        risk_management={
            "stop_loss_pct": 2.0,
            "take_profit_pct": 6.0,
            "position_size_pct": 10.0
        }
    )

    # Create a backtest job
    job_data = {
        "job_id": f"test_job_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        "user_id": test_user_id,
        "status": BacktestJobStatus.PENDING.value,
        "priority": BacktestJobPriority.NORMAL.value,
        "strategy_name": "Test RSI Strategy",
        "strategy_description": "A simple RSI-based strategy for testing",
        "timeframe": "1h",
        "assets": ["BTC/USD"],
        "period": "6 months",
        "initial_capital": 10000.0,
        "strategy_definition": strategy_definition.model_dump(),
        "estimated_duration": 30
    }

    success = await db.create_backtest_job(job_data)
    if not success:
        logger.error("Failed to create backtest job")
        return False

    job_id = job_data["job_id"]
    logger.info(f"Created backtest job: {job_id}")

    # Create and start backtest worker
    logger.info("Starting backtest worker...")
    worker = BacktestWorker(db)

    # Start the worker in the background
    worker_task = asyncio.create_task(worker.start())

    # Wait a bit for the worker to process the job
    logger.info("Waiting for worker to process job...")
    await asyncio.sleep(10)

    # Check job status
    job_status = await db.get_backtest_job(job_id)
    if job_status:
        logger.info(f"Job status: {job_status['status']}")
        logger.info(f"Job progress: {job_status.get('progress', 0)}%")
        if job_status.get('error_message'):
            logger.error(f"Job error: {job_status['error_message']}")
    else:
        logger.error("Failed to get job status")

    # Stop the worker
    logger.info("Stopping backtest worker...")
    await worker.stop()
    worker_task.cancel()

    # Check final job status
    final_job_status = await db.get_backtest_job(job_id)
    if final_job_status:
        logger.info(f"Final job status: {final_job_status['status']}")
        if final_job_status['status'] == BacktestJobStatus.COMPLETED.value:
            logger.info("✅ Backtest job completed successfully!")
            if final_job_status.get('result_backtest_id'):
                logger.info(f"Result backtest ID: {final_job_status['result_backtest_id']}")
        elif final_job_status['status'] == BacktestJobStatus.FAILED.value:
            logger.error(f"❌ Backtest job failed: {final_job_status.get('error_message', 'Unknown error')}")
        else:
            logger.warning(f"⚠️ Job status: {final_job_status['status']}")
    else:
        logger.error("Failed to get final job status")

    return True

async def main():
    """Main function"""
    try:
        logger.info("Starting backtest job system test...")
        success = await test_backtest_job_system()

        if success:
            logger.info("✅ Test completed successfully!")
        else:
            logger.error("❌ Test failed!")
            sys.exit(1)

    except Exception as e:
        logger.error(f"Test failed with exception: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
