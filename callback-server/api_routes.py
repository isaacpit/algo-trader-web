from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import logging
import pprint as pp
import traceback
from datetime import datetime, timedelta
import uuid
import asyncio
import random
import os

from models import (
    CallbackRequest, UserResponse, ErrorResponse, User, Signal, Backtest,
    CreateSignalRequest, CreateBacktestRequest, UpdateSignalRequest, UpdateBacktestRequest,
    FeedItemResponse, FeedResponse, PaginationParams, ItemType, Timeframe, Status,
    BacktestGenerationRequest, BacktestGenerationResponse, PerformanceMetrics, ChartData,
    BacktestJobRequest, BacktestJob, BacktestJobUpdate, BacktestJobStatus, BacktestJobPriority
)
from database import get_database, DatabaseManager
from backtest_generator import BacktestGenerator
from backtest_worker import get_backtest_worker

logger = logging.getLogger(__name__)

# Create router
api_router = APIRouter(prefix="/api", tags=["API"])

# Initialize backtest generator
backtest_generator = BacktestGenerator()

# Job status endpoints - no artificial slowdown here (slowdown is in job processing)

# Feed Routes
@api_router.get("/feed", response_model=FeedResponse)
async def get_feed(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    type: Optional[str] = Query(None, description="Filter by type (signal/backtest)"),
    timeframe: Optional[str] = Query(None, description="Filter by timeframe"),
    user_id: Optional[str] = Query(None, description="Filter by user ID")
):
    """Get paginated feed items with optional filters"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")


        # Build filters
        filters = {}
        if type:
            filters["type"] = type
        if timeframe:
            filters["timeframe"] = timeframe
        if user_id:
            filters["user_id"] = user_id

        # Get feed items
        result = await db.get_feed_items(page, limit, filters)

        # Transform items to response format
        feed_items = []
        logger.info(f"Fetched feed items count: {len(result['items'])}")
        logger.debug(f"First item structure: {pp.pformat(result['items'][0] if result['items'] else 'No items')}")

        for i, item in enumerate(result["items"]):
            # Determine item type and get user data
            item_type = "signal" if "signal_id" in item else "backtest"
            user_data = await db.get_user(item["user_id"])

            if not user_data:
                continue  # Skip items with missing user data

            # Convert user data to User model
            try:
                user_model = User(**user_data)
            except Exception as e:
                logger.error(f"Invalid user data for user {item['user_id']}: {e}")
                logger.error(f"User data: {pp.pformat(user_data)}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                continue

                        # Convert performance dict to PerformanceMetrics
            try:
                if "performance" not in item:
                    logger.error(f"Item {i} missing performance field. Available keys: {list(item.keys())}")
                    logger.error(f"Full item data: {pp.pformat(item)}")
                    continue

                # Convert string values to proper types for PerformanceMetrics
                performance_data = item["performance"].copy()
                performance_data["win_rate"] = float(performance_data["win_rate"])
                performance_data["profit_factor"] = float(performance_data["profit_factor"])
                performance_data["total_trades"] = int(performance_data["total_trades"])
                performance_data["avg_return"] = float(performance_data["avg_return"])
                performance_data["max_drawdown"] = float(performance_data["max_drawdown"])
                performance_data["sharpe_ratio"] = float(performance_data["sharpe_ratio"])
                if performance_data.get("sortino_ratio"):
                    performance_data["sortino_ratio"] = float(performance_data["sortino_ratio"])
                if performance_data.get("calmar_ratio"):
                    performance_data["calmar_ratio"] = float(performance_data["calmar_ratio"])

                performance_metrics = PerformanceMetrics(**performance_data)
            except Exception as e:
                logger.error(f"Invalid performance data for item {item.get('signal_id') or item.get('backtest_id')}: {e}")
                logger.error(f"Raw performance data: {item.get('performance', 'MISSING')}")
                logger.error(f"Converted performance data: {performance_data if 'performance_data' in locals() else 'CONVERSION_FAILED'}")
                logger.error(f"Full item: {pp.pformat(item)}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                continue

            # Convert chart_data dict to ChartData
            try:
                chart_data_obj = ChartData(**item["chart_data"])
            except Exception as e:
                logger.error(f"Invalid chart data for item {item.get('signal_id') or item.get('backtest_id')}: {e}")
                logger.error(f"Chart data: {pp.pformat(item.get('chart_data', 'MISSING'))}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                continue

            # Convert signal/backtest data to proper models if needed
            signal_model = None
            backtest_model = None

            if item_type == "signal":
                try:
                    # Convert string fields to proper types and map field names
                    signal_data = {
                        "id": item["item_id"],  # Map item_id to id
                        "user_id": item["user_id"],
                        "name": item["name"],
                        "description": item["description"],
                        "timeframe": Timeframe(item["timeframe"]),
                        "assets": item["assets"],
                        "entry": item["entry"],
                        "target": item["target"],
                        "stop_loss": item["stop_loss"],
                        "confidence": item["confidence"],
                        "status": Status(item["status"]),
                        "performance": performance_metrics,  # Use the already created PerformanceMetrics object
                        "chart_data": chart_data_obj,  # Use the already created ChartData object
                        "created_at": datetime.fromisoformat(item["created_at"]),
                        "updated_at": datetime.fromisoformat(item["updated_at"]),
                        "likes": item.get("likes", 0),
                        "comments": item.get("comments", 0),
                        "shares": item.get("shares", 0)
                    }
                    signal_model = Signal(**signal_data)
                except Exception as e:
                    logger.error(f"Invalid signal data for item {item.get('item_id')}: {e}")
                    logger.error(f"Signal data: {pp.pformat(signal_data if 'signal_data' in locals() else 'DATA_PREPARATION_FAILED')}")
                    logger.error(f"Stack trace: {traceback.format_exc()}")
                    # Don't skip the item, just set signal_model to None
            else:
                try:
                    # Convert string fields to proper types and map field names
                    backtest_data = {
                        "id": item["item_id"],  # Map item_id to id
                        "user_id": item["user_id"],
                        "name": item["name"],
                        "description": item["description"],
                        "timeframe": Timeframe(item["timeframe"]),
                        "assets": item["assets"],
                        "period": item["period"],
                        "initial_capital": item["initial_capital"],
                        "final_capital": item["final_capital"],
                        "status": Status(item["status"]),
                        "performance": performance_metrics,  # Use the already created PerformanceMetrics object
                        "chart_data": chart_data_obj,  # Use the already created ChartData object
                        "created_at": datetime.fromisoformat(item["created_at"]),
                        "updated_at": datetime.fromisoformat(item["updated_at"]),
                        "likes": item.get("likes", 0),
                        "comments": item.get("comments", 0),
                        "shares": item.get("shares", 0)
                    }
                    backtest_model = Backtest(**backtest_data)
                except Exception as e:
                    logger.error(f"Invalid backtest data for item {item.get('item_id')}: {e}")
                    logger.error(f"Backtest data: {pp.pformat(backtest_data if 'backtest_data' in locals() else 'DATA_PREPARATION_FAILED')}")
                    logger.error(f"Stack trace: {traceback.format_exc()}")
                    # Don't skip the item, just set backtest_model to None

            # Create feed item response
            feed_item = FeedItemResponse(
                id=item["item_id"],
                type=ItemType.SIGNAL if item_type == "signal" else ItemType.BACKTEST,
                user=user_model,
                signal=signal_model,
                backtest=backtest_model,
                performance=performance_metrics,
                chart_data=chart_data_obj,
                timestamp=item["created_at"],
                likes=item.get("likes", 0),
                comments=item.get("comments", 0),
                shares=item.get("shares", 0)
            )
            feed_items.append(feed_item)

        return FeedResponse(
            items=feed_items,
            total_items=result["total_items"],
            current_page=result["current_page"],
            total_pages=result["total_pages"],
            has_next_page=result["has_next_page"],
            page_size=result["page_size"]
        )

    except Exception as e:
        logger.error(f"Error getting feed: {str(e)}")
        logger.error(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to get feed items: {str(e)}")

@api_router.get("/feed/{item_id}")
async def get_feed_item(item_id: str):
    """Get a specific feed item by ID"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Try to get as signal first
        signal_data = await db.get_signal(item_id)
        if signal_data:
            user_data = await db.get_user(signal_data["user_id"])
            if not user_data:
                raise HTTPException(status_code=404, detail="User not found")

            # Convert user data to User model
            try:
                user_model = User(**user_data)
            except Exception as e:
                logger.error(f"Invalid user data for user {signal_data['user_id']}: {e}")
                logger.error(f"User data: {pp.pformat(user_data)}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Invalid user data: {str(e)}")

            # Convert performance dict to PerformanceMetrics
            try:
                # Convert string values to proper types for PerformanceMetrics
                performance_data = signal_data["performance"].copy()
                performance_data["win_rate"] = float(performance_data["win_rate"])
                performance_data["profit_factor"] = float(performance_data["profit_factor"])
                performance_data["total_trades"] = int(performance_data["total_trades"])
                performance_data["avg_return"] = float(performance_data["avg_return"])
                performance_data["max_drawdown"] = float(performance_data["max_drawdown"])
                performance_data["sharpe_ratio"] = float(performance_data["sharpe_ratio"])
                if performance_data.get("sortino_ratio"):
                    performance_data["sortino_ratio"] = float(performance_data["sortino_ratio"])
                if performance_data.get("calmar_ratio"):
                    performance_data["calmar_ratio"] = float(performance_data["calmar_ratio"])

                performance_metrics = PerformanceMetrics(**performance_data)
            except Exception as e:
                logger.error(f"Invalid performance data for signal {item_id}: {e}")
                logger.error(f"Raw performance data: {signal_data.get('performance', 'MISSING')}")
                logger.error(f"Converted performance data: {performance_data if 'performance_data' in locals() else 'CONVERSION_FAILED'}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Invalid performance data: {str(e)}")

            # Convert chart_data dict to ChartData
            try:
                chart_data_obj = ChartData(**signal_data["chart_data"])
            except Exception as e:
                logger.error(f"Invalid chart data for signal {item_id}: {e}")
                logger.error(f"Chart data: {pp.pformat(signal_data.get('chart_data', 'MISSING'))}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Invalid chart data: {str(e)}")

            # Convert signal data to Signal model
            try:
                signal_model_data = signal_data.copy()
                signal_model_data["timeframe"] = Timeframe(signal_data["timeframe"])
                signal_model_data["status"] = Status(signal_data["status"])
                signal_model_data["created_at"] = datetime.fromisoformat(signal_data["created_at"])
                signal_model_data["updated_at"] = datetime.fromisoformat(signal_data["updated_at"])
                signal_model = Signal(**signal_model_data)
            except Exception as e:
                logger.error(f"Invalid signal data for item {item_id}: {e}")
                logger.error(f"Signal model data: {pp.pformat(signal_model_data if 'signal_model_data' in locals() else 'DATA_PREPARATION_FAILED')}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Invalid signal data: {str(e)}")

            return FeedItemResponse(
                id=signal_data["signal_id"],
                type=ItemType.SIGNAL,
                user=user_model,
                signal=signal_model,
                backtest=None,
                performance=performance_metrics,
                chart_data=chart_data_obj,
                timestamp=signal_data["created_at"],
                likes=signal_data.get("likes", 0),
                comments=signal_data.get("comments", 0),
                shares=signal_data.get("shares", 0)
            )

        # Try to get as backtest
        backtest_data = await db.get_backtest(item_id)
        if backtest_data:
            user_data = await db.get_user(backtest_data["user_id"])
            if not user_data:
                raise HTTPException(status_code=404, detail="User not found")

            # Convert user data to User model
            try:
                user_model = User(**user_data)
            except Exception as e:
                logger.error(f"Invalid user data for user {backtest_data['user_id']}: {e}")
                logger.error(f"User data: {pp.pformat(user_data)}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Invalid user data: {str(e)}")

            # Convert performance dict to PerformanceMetrics
            try:
                # Convert string values to proper types for PerformanceMetrics
                performance_data = backtest_data["performance"].copy()
                performance_data["win_rate"] = float(performance_data["win_rate"])
                performance_data["profit_factor"] = float(performance_data["profit_factor"])
                performance_data["total_trades"] = int(performance_data["total_trades"])
                performance_data["avg_return"] = float(performance_data["avg_return"])
                performance_data["max_drawdown"] = float(performance_data["max_drawdown"])
                performance_data["sharpe_ratio"] = float(performance_data["sharpe_ratio"])
                if performance_data.get("sortino_ratio"):
                    performance_data["sortino_ratio"] = float(performance_data["sortino_ratio"])
                if performance_data.get("calmar_ratio"):
                    performance_data["calmar_ratio"] = float(performance_data["calmar_ratio"])

                performance_metrics = PerformanceMetrics(**performance_data)
            except Exception as e:
                logger.error(f"Invalid performance data for backtest {item_id}: {e}")
                logger.error(f"Raw performance data: {backtest_data.get('performance', 'MISSING')}")
                logger.error(f"Converted performance data: {performance_data if 'performance_data' in locals() else 'CONVERSION_FAILED'}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Invalid performance data: {str(e)}")

            # Convert chart_data dict to ChartData
            try:
                chart_data_obj = ChartData(**backtest_data["chart_data"])
            except Exception as e:
                logger.error(f"Invalid chart data for backtest {item_id}: {e}")
                logger.error(f"Chart data: {pp.pformat(backtest_data.get('chart_data', 'MISSING'))}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail=f"Invalid chart data: {str(e)}")

            # Convert backtest data to Backtest model
            try:
                backtest_model_data = backtest_data.copy()
                backtest_model_data["timeframe"] = Timeframe(backtest_data["timeframe"])
                backtest_model_data["status"] = Status(backtest_data["status"])
                backtest_model_data["created_at"] = datetime.fromisoformat(backtest_data["created_at"])
                backtest_model_data["updated_at"] = datetime.fromisoformat(backtest_data["updated_at"])
                backtest_model = Backtest(**backtest_model_data)
            except Exception as e:
                logger.error(f"Invalid backtest data for item {item_id}: {e}")
                logger.error(f"Backtest model data: {pp.pformat(backtest_model_data if 'backtest_model_data' in locals() else 'DATA_PREPARATION_FAILED')}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                backtest_model = None

            return FeedItemResponse(
                id=backtest_data["backtest_id"],
                type=ItemType.BACKTEST,
                user=user_model,
                signal=None,
                backtest=backtest_model,
                performance=performance_metrics,
                chart_data=chart_data_obj,
                timestamp=backtest_data["created_at"],
                likes=backtest_data.get("likes", 0),
                comments=backtest_data.get("comments", 0),
                shares=backtest_data.get("shares", 0)
            )

        raise HTTPException(status_code=404, detail="Item not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feed item {item_id}: {str(e)}")
        logger.error(f"Stack trace: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to get feed item: {str(e)}")

# Signal Routes
@api_router.post("/signals")
async def create_signal(request: CreateSignalRequest, user_id: str):
    """Create a new signal"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Generate signal data
        signal_id = f"signal_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{user_id}"

        # Generate mock performance and chart data (in real app, this would be calculated)
        performance = {
            "win_rate": 0.65,
            "profit_factor": 1.8,
            "total_trades": 45,
            "avg_return": 2.3,
            "max_drawdown": -8.5,
            "sharpe_ratio": 1.2
        }

        chart_data = {
            "labels": [str(i) for i in range(100)],
            "datasets": [
                {
                    "label": "Strategy Performance",
                    "data": [1000 + i * 2 + (i % 10) * 5 for i in range(100)],
                    "borderColor": "rgba(99, 102, 241, 0.8)",
                    "backgroundColor": "rgba(99, 102, 241, 0.1)",
                    "fill": True
                }
            ]
        }

        signal_data = {
            "id": signal_id,
            "user_id": user_id,
            "name": request.name,
            "description": request.description,
            "timeframe": request.timeframe,
            "assets": request.assets,
            "entry": request.entry,
            "target": request.target,
            "stop_loss": request.stop_loss,
            "confidence": request.confidence,
            "performance": performance,
            "chart_data": chart_data
        }

        success = await db.create_signal(signal_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create signal")

        logger.info(f"Created signal: {signal_id}")
        return {"id": signal_id, "message": "Signal created successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating signal: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create signal")

@api_router.get("/signals/{signal_id}")
async def get_signal(signal_id: str):
    """Get a specific signal by ID"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        signal_data = await db.get_signal(signal_id)
        if not signal_data:
            raise HTTPException(status_code=404, detail="Signal not found")

        return signal_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting signal {signal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get signal")

@api_router.put("/signals/{signal_id}")
async def update_signal(signal_id: str, request: UpdateSignalRequest):
    """Update a signal"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Get current signal
        signal_data = await db.get_signal(signal_id)
        if not signal_data:
            raise HTTPException(status_code=404, detail="Signal not found")

        # Prepare updates
        updates = {}
        if request.name is not None:
            updates["name"] = request.name
        if request.description is not None:
            updates["description"] = request.description
        if request.entry is not None:
            updates["entry"] = request.entry
        if request.target is not None:
            updates["target"] = request.target
        if request.stop_loss is not None:
            updates["stop_loss"] = request.stop_loss
        if request.confidence is not None:
            updates["confidence"] = request.confidence
        if request.status is not None:
            updates["status"] = request.status

        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")

        # Update signal
        success = await db.update_signal(signal_id, updates)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update signal")

        logger.info(f"Updated signal: {signal_id}")
        return {"message": "Signal updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating signal {signal_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update signal")

# Backtest Routes
@api_router.post("/backtest-jobs")
async def create_backtest_job(request: BacktestJobRequest):
    """Create a new backtest job"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Generate job ID
        job_id = f"job_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{request.user_id}"

        # Create job data
        job_data = {
            "job_id": job_id,
            "user_id": request.user_id,
            "status": BacktestJobStatus.PENDING.value,
            "priority": request.priority.value,
            "strategy_name": request.strategy_name,
            "strategy_description": request.strategy_description,
            "timeframe": request.timeframe.value,
            "assets": request.assets,
            "period": request.period,
            "initial_capital": request.initial_capital,
            "strategy_definition": request.strategy_definition.model_dump(),
            "estimated_duration": request.estimated_duration
        }

        # Store job in database
        success = await db.create_backtest_job(job_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create backtest job")

        logger.info(f"Created backtest job: {job_id}")
        return {
            "job_id": job_id,
            "status": BacktestJobStatus.PENDING.value,
            "message": "Backtest job created successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating backtest job: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create backtest job")

@api_router.get("/backtest-jobs/{job_id}")
async def get_backtest_job(job_id: str):
    """Get backtest job status and details"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        job_data = await db.get_backtest_job(job_id)
        if not job_data:
            raise HTTPException(status_code=404, detail="Backtest job not found")

        return job_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting backtest job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get backtest job")

@api_router.get("/backtest-jobs/user/{user_id}")
async def get_user_backtest_jobs(user_id: str, limit: int = Query(50, ge=1, le=100)):
    """Get backtest jobs for a specific user"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        jobs = await db.get_user_backtest_jobs(user_id, limit=limit)
        return {
            "jobs": jobs,
            "total": len(jobs),
            "user_id": user_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting backtest jobs for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get backtest jobs")

@api_router.delete("/backtest-jobs/{job_id}")
async def cancel_backtest_job(job_id: str):
    """Cancel a backtest job"""
    try:
        worker = get_backtest_worker()
        success = await worker.cancel_job(job_id)

        if not success:
            raise HTTPException(status_code=404, detail="Backtest job not found or cannot be cancelled")

        return {"message": "Backtest job cancelled successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling backtest job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel backtest job")

@api_router.post("/backtests/generate")
async def generate_backtest(request: BacktestGenerationRequest):
    """Generate a new backtest from strategy configuration (now uses job system)"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Create a backtest job instead of running immediately
        job_request = BacktestJobRequest(
            user_id=request.user_id,
            strategy_name=request.strategy_name,
            strategy_description=request.strategy_description,
            timeframe=request.timeframe,
            assets=request.assets,
            period=request.period,
            initial_capital=request.initial_capital,
            strategy_definition=request.strategy_definition,
            priority=BacktestJobPriority.NORMAL
        )

        # Generate job ID
        job_id = f"job_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{request.user_id}"

        # Create job data
        job_data = {
            "job_id": job_id,
            "user_id": request.user_id,
            "status": BacktestJobStatus.PENDING.value,
            "priority": BacktestJobPriority.NORMAL.value,
            "strategy_name": request.strategy_name,
            "strategy_description": request.strategy_description,
            "timeframe": request.timeframe.value,
            "assets": request.assets,
            "period": request.period,
            "initial_capital": request.initial_capital,
            "strategy_definition": request.strategy_definition.model_dump()
        }

        # Store job in database
        success = await db.create_backtest_job(job_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create backtest job")

        logger.info(f"Created backtest job: {job_id}")
        return BacktestGenerationResponse(
            backtest_id=job_id,  # Return job_id instead of backtest_id
            status="pending",
            message="Backtest job created successfully",
            estimated_completion_time=None
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating backtest job: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create backtest job")

@api_router.post("/backtests")
async def create_backtest(request: CreateBacktestRequest, user_id: str):
    """Create a new backtest"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Generate backtest data
        backtest_id = f"backtest_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{user_id}"

        # Generate mock performance and chart data (in real app, this would be calculated)
        performance = {
            "win_rate": 0.68,
            "profit_factor": 2.1,
            "total_trades": 156,
            "avg_return": 3.2,
            "max_drawdown": -12.5,
            "sharpe_ratio": 1.8
        }

        chart_data = {
            "labels": [str(i) for i in range(100)],
            "datasets": [
                {
                    "label": "Portfolio Value",
                    "data": [10000 + i * 15 + (i % 15) * 8 for i in range(100)],
                    "borderColor": "rgba(16, 185, 129, 0.8)",
                    "backgroundColor": "rgba(16, 185, 129, 0.1)",
                    "fill": True
                }
            ]
        }

        backtest_data = {
            "id": backtest_id,
            "user_id": user_id,
            "name": request.name,
            "description": request.description,
            "timeframe": request.timeframe,
            "assets": request.assets,
            "period": request.period,
            "initial_capital": request.initial_capital,
            "final_capital": request.initial_capital * 1.25,  # Mock final capital
            "performance": performance,
            "chart_data": chart_data,
            "strategy_config": request.strategy_config
        }

        success = await db.create_backtest(backtest_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create backtest")

        logger.info(f"Created backtest: {backtest_id}")
        return {"id": backtest_id, "message": "Backtest created successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating backtest: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create backtest")

@api_router.get("/backtests/{backtest_id}")
async def get_backtest(backtest_id: str):
    """Get a specific backtest by ID"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        backtest_data = await db.get_backtest(backtest_id)
        if not backtest_data:
            raise HTTPException(status_code=404, detail="Backtest not found")

        return backtest_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting backtest {backtest_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get backtest")

@api_router.put("/backtests/{backtest_id}")
async def update_backtest(backtest_id: str, request: UpdateBacktestRequest):
    """Update a backtest"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        # Get current backtest
        backtest_data = await db.get_backtest(backtest_id)
        if not backtest_data:
            raise HTTPException(status_code=404, detail="Backtest not found")

        # Prepare updates
        updates = {}
        if request.name is not None:
            updates["name"] = request.name
        if request.description is not None:
            updates["description"] = request.description
        if request.status is not None:
            updates["status"] = request.status

        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")

        # Update backtest
        success = await db.update_backtest(backtest_id, updates)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update backtest")

        logger.info(f"Updated backtest: {backtest_id}")
        return {"message": "Backtest updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating backtest {backtest_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update backtest")

# User Routes
@api_router.get("/users/{user_id}/signals")
async def get_user_signals(user_id: str, limit: int = Query(50, ge=1, le=100)):
    """Get signals by user ID"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        signals = await db.get_signals_by_user(user_id, limit)
        return {"signals": signals, "count": len(signals)}

    except Exception as e:
        logger.error(f"Error getting signals for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user signals")

@api_router.get("/users/{user_id}/backtests")
async def get_user_backtests(user_id: str, limit: int = Query(50, ge=1, le=100)):
    """Get backtests by user ID"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        backtests = await db.get_backtests_by_user(user_id, limit)
        return {"backtests": backtests, "count": len(backtests)}

    except Exception as e:
        logger.error(f"Error getting backtests for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user backtests")

# Interaction Routes
@api_router.post("/items/{item_id}/like")
async def like_item(item_id: str, item_type: str = Query(..., description="Type of item (signal/backtest)")):
    """Like an item"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        success = await db.update_item_likes(item_id, item_type)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update likes")

        return {"message": "Item liked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error liking item {item_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to like item")

@api_router.post("/items/{item_id}/comment")
async def comment_item(item_id: str, item_type: str = Query(..., description="Type of item (signal/backtest)")):
    """Add a comment to an item"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        success = await db.update_item_comments(item_id, item_type)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update comments")

        return {"message": "Comment added successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error commenting on item {item_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add comment")

@api_router.post("/items/{item_id}/share")
async def share_item(item_id: str, item_type: str = Query(..., description="Type of item (signal/backtest)")):
    """Share an item"""
    try:
        db = get_database()
        if not db or not db.is_connected():
            raise HTTPException(status_code=503, detail="Database not available")

        success = await db.update_item_shares(item_id, item_type)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update shares")

        return {"message": "Item shared successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing item {item_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to share item")
