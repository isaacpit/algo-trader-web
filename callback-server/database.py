import boto3
import json
import logging
import traceback
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from botocore.exceptions import ClientError, NoCredentialsError
from decimal import Decimal
import time
import pprint as pp

from models import DynamoDBUser, DynamoDBSignal, DynamoDBBacktest, DynamoDBBacktestJob

logger = logging.getLogger(__name__)

def convert_floats_to_decimal(obj: Any) -> Any:
    """
    Recursively convert all float values to Decimal for DynamoDB compatibility
    """
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {key: convert_floats_to_decimal(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats_to_decimal(item) for item in obj]
    else:
        return obj

def prepare_item_for_dynamodb(item_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare an item dictionary for DynamoDB storage by converting floats to Decimals
    """
    return convert_floats_to_decimal(item_dict)

def convert_decimals_to_float(obj: Any) -> Any:
    """
    Recursively convert all Decimal values back to float for API responses
    """
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {key: convert_decimals_to_float(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals_to_float(item) for item in obj]
    else:
        return obj

def prepare_item_from_dynamodb(item_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare an item dictionary from DynamoDB by converting Decimals back to floats
    """
    return convert_decimals_to_float(item_dict)

class DatabaseManager:
    """Manages DynamoDB operations for the application"""

    def __init__(self, user_table_name: str, feed_table_name: str, backtest_jobs_table_name: str = None, region: str = "us-east-1", use_localstack: bool = True, localstack_endpoint: str = None):
        self.user_table_name = user_table_name
        self.feed_table_name = feed_table_name
        self.backtest_jobs_table_name = backtest_jobs_table_name or f"{user_table_name}_backtest_jobs"
        self.region = region
        self.use_localstack = use_localstack
        self.localstack_endpoint = localstack_endpoint
        self.dynamodb = None
        self.user_table = None
        self.feed_table = None
        self.backtest_jobs_table = None
        self._initialize_connection()

    def _initialize_connection(self):
        """Initialize DynamoDB connection"""
        try:
            if self.use_localstack:
                # Use LocalStack for local development
                logger.info(f"Initializing LocalStack DynamoDB connection")
                self.dynamodb = boto3.resource(
                    'dynamodb',
                    region_name=self.region,
                    endpoint_url=self.localstack_endpoint or 'http://localhost:4566',
                    aws_access_key_id='test',
                    aws_secret_access_key='test'
                )
            else:
                # Use real AWS DynamoDB
                logger.info(f"Initializing AWS DynamoDB connection")
                self.dynamodb = boto3.resource('dynamodb', region_name=self.region)

            self.user_table = self.dynamodb.Table(self.user_table_name)
            self.feed_table = self.dynamodb.Table(self.feed_table_name)
            self.backtest_jobs_table = self.dynamodb.Table(self.backtest_jobs_table_name)

            # Create tables if they don't exist (especially useful for LocalStack)
            if self.use_localstack:
                self._ensure_tables_exist()

            logger.info(f"Successfully connected to DynamoDB tables: {self.user_table_name}, {self.feed_table_name}, {self.backtest_jobs_table_name}")

        except Exception as e:
            logger.error(f"Failed to initialize DynamoDB: {str(e)}")
            logger.error(f"Stack trace: {traceback.format_exc()}")
            self.user_table = None
            self.feed_table = None
            self.backtest_jobs_table = None

    def _ensure_tables_exist(self, max_retries: int = 10, delay: float = 1.0):
        """Ensure all DynamoDB tables exist (for LocalStack development)"""
        # Create user table
        self._ensure_table_exists(self.user_table_name, "user", max_retries, delay)
        # Create feed table
        self._ensure_table_exists(self.feed_table_name, "feed", max_retries, delay)
        # Create backtest jobs table
        self._ensure_table_exists(self.backtest_jobs_table_name, "backtest_jobs", max_retries, delay)

    def _ensure_table_exists(self, table_name: str, table_type: str, max_retries: int = 10, delay: float = 1.0):
        """Ensure a specific DynamoDB table exists"""
        if not self.dynamodb:
            logger.error("DynamoDB resource is not initialized.")
            return

        table = self.dynamodb.Table(table_name)

        for attempt in range(max_retries):
            try:
                # First, try to load the table to see if it already exists
                table.load()
                logger.info(f"Table {table_name} already exists")
                return
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == 'ResourceNotFoundException':
                    logger.info(f"Table {table_name} does not exist, creating...")
                    try:
                        self._create_table(table_name, table_type)
                        return
                    except ClientError as ce:
                        ce_code = ce.response['Error']['Code']
                        if ce_code == 'ResourceInUseException':
                            logger.info(f"Table {table_name} is being created by another worker. Waiting for it to be available...")
                            # Wait for the table to be created by another worker
                            if self._wait_for_table_available(table_name, max_retries=10, delay=delay):
                                logger.info(f"Table {table_name} is now available (created by another worker)")
                                return
                            else:
                                logger.error(f"Table {table_name} failed to become available after waiting")
                                raise Exception(f"Table {table_name} failed to become available after waiting")
                        else:
                            logger.error(f"Failed to create table: {ce}")
                            raise ce
                elif error_code == 'ResourceInUseException':
                    logger.info(f"Table {table_name} is being created by another worker. Waiting for it to be available...")
                    # Wait for the table to be created by another worker
                    if self._wait_for_table_available(table_name, max_retries=10, delay=delay):
                        logger.info(f"Table {table_name} is now available (created by another worker)")
                        return
                    else:
                        logger.error(f"Table {table_name} failed to become available after waiting")
                        raise Exception(f"Table {table_name} failed to become available after waiting")
                else:
                    logger.error(f"Unexpected error: {e}")
                    raise e

            time.sleep(delay)

        logger.error(f"Failed to ensure table {table_name} exists after {max_retries} retries.")
        raise Exception(f"Failed to ensure table {table_name} exists after {max_retries} retries.")

    def _wait_for_table_available(self, table_name: str, max_retries: int = 10, delay: float = 1.0) -> bool:
        """Wait for table to become available after being created by another worker"""
        table = self.dynamodb.Table(table_name)

        for attempt in range(max_retries):
            try:
                # Try to load the table
                table.load()
                # If successful, the table is available
                return True
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == 'ResourceNotFoundException':
                    # Table still doesn't exist, keep waiting
                    logger.debug(f"Table {table_name} still not available, waiting... (attempt {attempt + 1}/{max_retries})")
                elif error_code == 'ResourceInUseException':
                    # Table is still being created, keep waiting
                    logger.debug(f"Table {table_name} still being created, waiting... (attempt {attempt + 1}/{max_retries})")
                else:
                    # Unexpected error
                    logger.error(f"Unexpected error while waiting for table: {e}")
                    return False
            except Exception as e:
                logger.error(f"Error while waiting for table: {e}")
                logger.error(f"Stack trace: {traceback.format_exc()}")
                return False

            time.sleep(delay)

        return False

    def _create_table(self, table_name: str, table_type: str, max_retries: int = 5, delay: float = 1.0):
        """Create DynamoDB table with proper schema based on table type"""
        if not self.dynamodb:
            logger.error("DynamoDB resource is not initialized.")
            return

        for attempt in range(max_retries):
            try:
                if table_type == "user":
                    # User table schema - simple key-value for user tokens
                    table = self.dynamodb.create_table(
                        TableName=table_name,
                        KeySchema=[
                            {
                                'AttributeName': 'user_id',
                                'KeyType': 'HASH'
                            }
                        ],
                        AttributeDefinitions=[
                            {
                                'AttributeName': 'user_id',
                                'AttributeType': 'S'
                            }
                        ],
                        BillingMode='PAY_PER_REQUEST'
                    )
                elif table_type == "feed":
                    # Feed table schema - for signals and backtests
                    table = self.dynamodb.create_table(
                        TableName=table_name,
                        KeySchema=[
                            {
                                'AttributeName': 'item_id',
                                'KeyType': 'HASH'
                            }
                        ],
                        AttributeDefinitions=[
                            {
                                'AttributeName': 'item_id',
                                'AttributeType': 'S'
                            },
                            {
                                'AttributeName': 'user_id',
                                'AttributeType': 'S'
                            },
                            {
                                'AttributeName': 'created_at',
                                'AttributeType': 'S'
                            }
                        ],
                        GlobalSecondaryIndexes=[
                            {
                                'IndexName': 'user_id-index',
                                'KeySchema': [
                                    {
                                        'AttributeName': 'user_id',
                                        'KeyType': 'HASH'
                                    }
                                ],
                                'Projection': {
                                    'ProjectionType': 'ALL'
                                }
                            },
                            {
                                'IndexName': 'created_at-index',
                                'KeySchema': [
                                    {
                                        'AttributeName': 'created_at',
                                        'KeyType': 'HASH'
                                    }
                                ],
                                'Projection': {
                                    'ProjectionType': 'ALL'
                                }
                            }
                        ],
                        BillingMode='PAY_PER_REQUEST'
                    )
                elif table_type == "backtest_jobs":
                    # Backtest jobs table schema - for managing backtest jobs
                    table = self.dynamodb.create_table(
                        TableName=table_name,
                        KeySchema=[
                            {
                                'AttributeName': 'job_id',
                                'KeyType': 'HASH'
                            }
                        ],
                        AttributeDefinitions=[
                            {
                                'AttributeName': 'job_id',
                                'AttributeType': 'S'
                            },
                            {
                                'AttributeName': 'status',
                                'AttributeType': 'S'
                            },
                            {
                                'AttributeName': 'user_id',
                                'AttributeType': 'S'
                            },
                            {
                                'AttributeName': 'created_at',
                                'AttributeType': 'S'
                            }
                        ],
                        GlobalSecondaryIndexes=[
                            {
                                'IndexName': 'StatusIndex',
                                'KeySchema': [
                                    {
                                        'AttributeName': 'status',
                                        'KeyType': 'HASH'
                                    },
                                    {
                                        'AttributeName': 'created_at',
                                        'KeyType': 'RANGE'
                                    }
                                ],
                                'Projection': {
                                    'ProjectionType': 'ALL'
                                }
                            },
                            {
                                'IndexName': 'UserIndex',
                                'KeySchema': [
                                    {
                                        'AttributeName': 'user_id',
                                        'KeyType': 'HASH'
                                    },
                                    {
                                        'AttributeName': 'created_at',
                                        'KeyType': 'RANGE'
                                    }
                                ],
                                'Projection': {
                                    'ProjectionType': 'ALL'
                                }
                            }
                        ],
                        BillingMode='PAY_PER_REQUEST'
                    )
                else:
                    raise ValueError(f"Unknown table type: {table_type}")

                # Wait for table to be created
                table.meta.client.get_waiter('table_exists').wait(TableName=table_name)
                logger.info(f"Table {table_name} ({table_type}) created successfully")

                # Update the appropriate table reference
                if table_type == "user":
                    self.user_table = table
                elif table_type == "feed":
                    self.feed_table = table
                elif table_type == "backtest_jobs":
                    self.backtest_jobs_table = table

                return

            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == 'ResourceInUseException':
                    logger.info(f"Table {table_name} is being created by another worker. Waiting for it to be available...")
                    # Wait for the table to be created by another worker
                    if self._wait_for_table_available(table_name, max_retries=10, delay=delay):
                        logger.info(f"Table {table_name} is now available (created by another worker)")
                        # Update our table reference to the existing table
                        if table_type == "user":
                            self.user_table = self.dynamodb.Table(table_name)
                        elif table_type == "feed":
                            self.feed_table = self.dynamodb.Table(table_name)
                        elif table_type == "backtest_jobs":
                            self.backtest_jobs_table = self.dynamodb.Table(table_name)
                        return
                    else:
                        logger.error(f"Table {table_name} failed to become available after waiting")
                        raise Exception(f"Table {table_name} failed to become available after waiting")
                else:
                    logger.error(f"Failed to create table {table_name}: {str(e)}")
                    raise e
            except Exception as e:
                logger.error(f"Failed to create table {table_name}: {str(e)}")
                raise e

        logger.error(f"Failed to create table {table_name} after {max_retries} retries.")
        raise Exception(f"Failed to create table {table_name} after {max_retries} retries.")

    def is_connected(self) -> bool:
        """Check if database connection is available"""
        return self.user_table is not None and self.feed_table is not None and self.backtest_jobs_table is not None

    # User Operations
    async def create_user(self, user_data: Dict[str, Any]) -> bool:
        """Create a new user"""
        if not self.is_connected():
            return False

        try:
            user_item = DynamoDBUser(
                user_id=user_data["id"],
                email=user_data["email"],
                name=user_data["name"],
                picture=user_data.get("picture"),
                verified=user_data.get("verified", False),
                followers=user_data.get("followers", 0),
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat()
            )

            self.user_table.put_item(Item=user_item.model_dump())
            logger.info(f"Created user: {user_data['email']}")
            return True

        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            return False

    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        if not self.is_connected():
            return None

        try:
            response = self.user_table.get_item(Key={"user_id": user_id})
            user_data = response.get("Item")

            if user_data:
                logger.info(f"Retrieved user: {user_id}")
                return user_data
            else:
                logger.warning(f"User not found: {user_id}")
                return None

        except Exception as e:
            logger.error(f"Failed to get user {user_id}: {str(e)}")
            return None

    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user data"""
        if not self.is_connected():
            return False

        try:
            update_expression = "SET "
            expression_values = {}

            for key, value in updates.items():
                update_expression += f"{key} = :{key}, "
                expression_values[f":{key}"] = value

            update_expression += "updated_at = :updated_at"
            expression_values[":updated_at"] = datetime.utcnow().isoformat()

            self.user_table.update_item(
                Key={"user_id": user_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )

            logger.info(f"Updated user: {user_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to update user {user_id}: {str(e)}")
            return False

    # Signal Operations
    async def create_signal(self, signal_data: Dict[str, Any]) -> bool:
        """Create a new signal"""
        if not self.is_connected():
            return False

        try:
            signal_item = DynamoDBSignal(
                signal_id=signal_data["id"],
                user_id=signal_data["user_id"],
                name=signal_data["name"],
                description=signal_data["description"],
                timeframe=signal_data["timeframe"],
                assets=signal_data["assets"],
                entry=signal_data["entry"],
                target=signal_data["target"],
                stop_loss=signal_data["stop_loss"],
                confidence=signal_data["confidence"],
                status=signal_data.get("status", "active"),
                performance=signal_data["performance"],
                chart_data=signal_data["chart_data"],
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
                likes=signal_data.get("likes", 0),
                comments=signal_data.get("comments", 0),
                shares=signal_data.get("shares", 0)
            )

            # Convert floats to Decimal for DynamoDB compatibility
            item_dict = prepare_item_for_dynamodb(signal_item.model_dump())
            # Add item_id for the feed table primary key
            item_dict["item_id"] = signal_data["id"]
            item_dict["item_type"] = "signal"

            self.feed_table.put_item(Item=item_dict)
            logger.info(f"Created signal: {signal_data['id']}")
            return True

        except Exception as e:
            logger.error(f"Failed to create signal: {str(e)}")
            return False

    async def get_signal(self, signal_id: str) -> Optional[Dict[str, Any]]:
        """Get signal by ID"""
        if not self.is_connected():
            return None

        try:
            response = self.feed_table.get_item(Key={"item_id": signal_id})
            signal_data = response.get("Item")

            if signal_data and signal_data.get("item_type") == "signal":
                logger.info(f"Retrieved signal: {signal_id}")
                # Convert Decimal values back to float for API responses
                return prepare_item_from_dynamodb(signal_data)
            else:
                logger.warning(f"Signal not found: {signal_id}")
                return None

        except Exception as e:
            logger.error(f"Failed to get signal {signal_id}: {str(e)}")
            return None

    async def get_signals_by_user(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get signals by user ID"""
        if not self.is_connected():
            return []

        try:
            # For LocalStack, we'll use scan with filter (simpler approach)
            if self.use_localstack:
                response = self.feed_table.scan(
                    FilterExpression="user_id = :user_id AND item_type = :item_type",
                    ExpressionAttributeValues={
                        ":user_id": user_id,
                        ":item_type": "signal"
                    },
                    Limit=limit
                )
            else:
                # Use GSI for production
                response = self.feed_table.query(
                    IndexName="user_id-index",
                    KeyConditionExpression="user_id = :user_id",
                    FilterExpression="item_type = :item_type",
                    ExpressionAttributeValues={
                        ":user_id": user_id,
                        ":item_type": "signal"
                    },
                    Limit=limit
                )

            signals = response.get("Items", [])
            logger.info(f"Retrieved {len(signals)} signals for user: {user_id}")
            # Convert Decimal values back to float for API responses
            return [prepare_item_from_dynamodb(signal) for signal in signals]

        except Exception as e:
            logger.error(f"Failed to get signals for user {user_id}: {str(e)}")
            return []

    # Backtest Operations
    async def create_backtest(self, backtest_data: Dict[str, Any]) -> bool:
        """Create a new backtest"""
        if not self.is_connected():
            return False

        try:
            backtest_item = DynamoDBBacktest(
                backtest_id=backtest_data["id"],
                user_id=backtest_data["user_id"],
                name=backtest_data["name"],
                description=backtest_data["description"],
                timeframe=backtest_data["timeframe"],
                assets=backtest_data["assets"],
                period=backtest_data["period"],
                initial_capital=backtest_data["initial_capital"],
                final_capital=backtest_data["final_capital"],
                status=backtest_data.get("status", "active"),
                performance=backtest_data["performance"],
                chart_data=backtest_data["chart_data"],
                strategy_config=backtest_data.get("strategy_config", {}),
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
                likes=backtest_data.get("likes", 0),
                comments=backtest_data.get("comments", 0),
                shares=backtest_data.get("shares", 0)
            )

            # Convert floats to Decimal for DynamoDB compatibility
            item_dict = prepare_item_for_dynamodb(backtest_item.model_dump())
            # Add item_id for the feed table primary key
            item_dict["item_id"] = backtest_data["id"]
            item_dict["item_type"] = "backtest"

            self.feed_table.put_item(Item=item_dict)
            logger.info(f"Created backtest: {backtest_data['id']}")
            return True

        except Exception as e:
            logger.error(f"Failed to create backtest: {str(e)}")
            return False

    async def get_backtest(self, backtest_id: str) -> Optional[Dict[str, Any]]:
        """Get backtest by ID"""
        if not self.is_connected():
            return None

        try:
            response = self.feed_table.get_item(Key={"item_id": backtest_id})
            backtest_data = response.get("Item")

            if backtest_data and backtest_data.get("item_type") == "backtest":
                logger.info(f"Retrieved backtest: {backtest_id}")
                # Convert Decimal values back to float for API responses
                return prepare_item_from_dynamodb(backtest_data)
            else:
                logger.warning(f"Backtest not found: {backtest_id}")
                return None

        except Exception as e:
            logger.error(f"Failed to get backtest {backtest_id}: {str(e)}")
            return None

    async def get_backtests_by_user(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get backtests by user ID"""
        if not self.is_connected():
            return []

        try:
            # For LocalStack, we'll use scan with filter (simpler approach)
            if self.use_localstack:
                response = self.feed_table.scan(
                    FilterExpression="user_id = :user_id AND item_type = :item_type",
                    ExpressionAttributeValues={
                        ":user_id": user_id,
                        ":item_type": "backtest"
                    },
                    Limit=limit
                )
            else:
                # Use GSI for production
                response = self.feed_table.query(
                    IndexName="user_id-index",
                    KeyConditionExpression="user_id = :user_id",
                    FilterExpression="item_type = :item_type",
                    ExpressionAttributeValues={
                        ":user_id": user_id,
                        ":item_type": "backtest"
                    },
                    Limit=limit
                )

            backtests = response.get("Items", [])
            logger.info(f"Retrieved {len(backtests)} backtests for user: {user_id}")
            # Convert Decimal values back to float for API responses
            return [prepare_item_from_dynamodb(backtest) for backtest in backtests]

        except Exception as e:
            logger.error(f"Failed to get backtests for user {user_id}: {str(e)}")
            return []

    async def update_signal(self, signal_id: str, updates: Dict[str, Any]) -> bool:
        """Update a signal with the provided updates"""
        if not self.is_connected():
            return False

        try:
            # Build update expression
            update_expression = "SET "
            expression_values = {}
            expression_names = {}

            for key, value in updates.items():
                # Handle reserved keywords by using expression attribute names
                attr_name = f"#{key}"
                attr_value = f":{key}"
                update_expression += f"{attr_name} = {attr_value}, "
                expression_names[attr_name] = key
                expression_values[attr_value] = value

            # Remove trailing comma and space
            update_expression = update_expression.rstrip(", ")

            # Add updated_at timestamp
            update_expression += ", #updated_at = :updated_at"
            expression_names["#updated_at"] = "updated_at"
            expression_values[":updated_at"] = datetime.utcnow().isoformat()

            # Prepare item for DynamoDB (convert floats to Decimal)
            expression_values = prepare_item_for_dynamodb(expression_values)

            self.feed_table.update_item(
                Key={"item_id": signal_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_names,
                ExpressionAttributeValues=expression_values
            )

            logger.info(f"Updated signal: {signal_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to update signal {signal_id}: {str(e)}")
            return False

    async def update_backtest(self, backtest_id: str, updates: Dict[str, Any]) -> bool:
        """Update a backtest with the provided updates"""
        if not self.is_connected():
            return False

        try:
            # Build update expression
            update_expression = "SET "
            expression_values = {}
            expression_names = {}

            for key, value in updates.items():
                # Handle reserved keywords by using expression attribute names
                attr_name = f"#{key}"
                attr_value = f":{key}"
                update_expression += f"{attr_name} = {attr_value}, "
                expression_names[attr_name] = key
                expression_values[attr_value] = value

            # Remove trailing comma and space
            update_expression = update_expression.rstrip(", ")

            # Add updated_at timestamp
            update_expression += ", #updated_at = :updated_at"
            expression_names["#updated_at"] = "updated_at"
            expression_values[":updated_at"] = datetime.utcnow().isoformat()

            # Prepare item for DynamoDB (convert floats to Decimal)
            expression_values = prepare_item_for_dynamodb(expression_values)

            self.feed_table.update_item(
                Key={"item_id": backtest_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_names,
                ExpressionAttributeValues=expression_values
            )

            logger.info(f"Updated backtest: {backtest_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to update backtest {backtest_id}: {str(e)}")
            return False

    # Feed Operations
    async def get_feed_items(self, page: int = 1, limit: int = 10, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get paginated feed items with optional filters"""
        if not self.is_connected():
            return self._empty_feed_response()

        try:
            # Build scan parameters - scan all items first for proper pagination
            scan_params = {}

            # Apply filters
            filter_expression = None
            expression_values = {}

            if filters:
                if filters.get("type"):
                    filter_expression = "item_type = :item_type"
                    expression_values[":item_type"] = filters["type"]

                if filters.get("timeframe"):
                    if filter_expression:
                        filter_expression += " AND "
                    else:
                        filter_expression = ""
                    filter_expression += "timeframe = :timeframe"
                    expression_values[":timeframe"] = filters["timeframe"]

                if filters.get("user_id"):
                    if filter_expression:
                        filter_expression += " AND "
                    else:
                        filter_expression = ""
                    filter_expression += "user_id = :user_id"
                    expression_values[":user_id"] = filters["user_id"]

            if filter_expression:
                scan_params["FilterExpression"] = filter_expression
                scan_params["ExpressionAttributeValues"] = expression_values

            # Scan all items from feed table
            all_items = []
            last_evaluated_key = None

            while True:
                if last_evaluated_key:
                    scan_params["ExclusiveStartKey"] = last_evaluated_key

                response = self.feed_table.scan(**scan_params)
                all_items.extend(response.get("Items", []))

                last_evaluated_key = response.get("LastEvaluatedKey")
                if not last_evaluated_key:
                    break

            # Sort by created_at (newest first)
            all_items.sort(key=lambda x: x.get('created_at', ''), reverse=True)

            # Apply pagination
            start_index = (page - 1) * limit
            end_index = start_index + limit
            paginated_items = all_items[start_index:end_index]

            # Calculate pagination metadata
            total_items = len(all_items)
            total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1

            logger.info(f"Retrieved {len(paginated_items)} feed items (page {page}/{total_pages}, total: {total_items})")

            # Convert Decimal values back to float for API responses
            converted_items = [prepare_item_from_dynamodb(item) for item in paginated_items]

            return {
                "items": converted_items,
                "total_items": total_items,
                "current_page": page,
                "total_pages": total_pages,
                "has_next_page": page < total_pages,
                "page_size": limit
            }

        except Exception as e:
            logger.error(f"Failed to get feed items: {str(e)}")
            return self._empty_feed_response()

    def _empty_feed_response(self) -> Dict[str, Any]:
        """Return empty feed response"""
        return {
            "items": [],
            "total_items": 0,
            "current_page": 1,
            "total_pages": 0,
            "has_next_page": False,
            "page_size": 10
        }

    # Utility Operations
    async def delete_item(self, item_id: str, item_type: str) -> bool:
        """Delete an item by ID and type"""
        if not self.is_connected():
            return False

        try:
            self.feed_table.delete_item(Key={"item_id": item_id})
            logger.info(f"Deleted {item_type}: {item_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete {item_type} {item_id}: {str(e)}")
            return False

    async def update_item_likes(self, item_id: str, item_type: str, increment: int = 1) -> bool:
        """Update item likes count"""
        if not self.is_connected():
            return False

        try:
            self.feed_table.update_item(
                Key={"item_id": item_id},
                UpdateExpression="SET likes = likes + :increment",
                ExpressionAttributeValues={":increment": increment}
            )

            logger.info(f"Updated {item_type} {item_id} likes by {increment}")
            return True

        except Exception as e:
            logger.error(f"Failed to update {item_type} {item_id} likes: {str(e)}")
            return False

    async def update_item_comments(self, item_id: str, item_type: str, increment: int = 1) -> bool:
        """Update item comments count"""
        if not self.is_connected():
            return False

        try:
            self.feed_table.update_item(
                Key={"item_id": item_id},
                UpdateExpression="SET comments = comments + :increment",
                ExpressionAttributeValues={":increment": increment}
            )

            logger.info(f"Updated {item_type} {item_id} comments by {increment}")
            return True

        except Exception as e:
            logger.error(f"Failed to update {item_type} {item_id} comments: {str(e)}")
            return False

    async def update_item_shares(self, item_id: str, item_type: str, increment: int = 1) -> bool:
        """Update item shares count"""
        if not self.is_connected():
            return False

        try:
            self.feed_table.update_item(
                Key={"item_id": item_id},
                UpdateExpression="SET shares = shares + :increment",
                ExpressionAttributeValues={":increment": increment}
            )

            logger.info(f"Updated {item_type} {item_id} shares by {increment}")
            return True

        except Exception as e:
            logger.error(f"Failed to update {item_type} {item_id} shares: {str(e)}")
            return False

    # Backtest Job Operations
    async def create_backtest_job(self, job_data: Dict[str, Any]) -> bool:
        """Create a new backtest job"""
        if not self.is_connected():
            return False

        try:
            job_item = DynamoDBBacktestJob(
                job_id=job_data["job_id"],
                user_id=job_data["user_id"],
                status=job_data["status"],
                priority=job_data["priority"],
                created_at=datetime.utcnow().isoformat(),
                started_at=job_data.get("started_at"),
                completed_at=job_data.get("completed_at"),
                strategy_name=job_data["strategy_name"],
                strategy_description=job_data["strategy_description"],
                timeframe=job_data["timeframe"],
                assets=job_data["assets"],
                period=job_data["period"],
                initial_capital=job_data["initial_capital"],
                strategy_definition=job_data["strategy_definition"],
                estimated_duration=job_data.get("estimated_duration"),
                actual_duration=job_data.get("actual_duration"),
                error_message=job_data.get("error_message"),
                progress=job_data.get("progress", 0.0),
                result_backtest_id=job_data.get("result_backtest_id")
            )

            # Convert floats to Decimal for DynamoDB compatibility
            item_dict = prepare_item_for_dynamodb(job_item.model_dump())

            self.backtest_jobs_table.put_item(Item=item_dict)
            logger.info(f"Created backtest job: {job_data['job_id']}")
            return True

        except Exception as e:
            logger.error(f"Failed to create backtest job: {str(e)}")
            return False

    async def get_backtest_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get a backtest job by ID"""
        if not self.is_connected():
            return None

        try:
            response = self.backtest_jobs_table.get_item(Key={'job_id': job_id})
            if 'Item' in response:
                item = prepare_item_from_dynamodb(response['Item'])
                return item
            return None

        except Exception as e:
            logger.error(f"Failed to get backtest job {job_id}: {str(e)}")
            return None

    async def get_pending_backtest_jobs(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get pending backtest jobs ordered by priority and creation time"""
        if not self.is_connected():
            return []

        try:
            # Query the StatusIndex for pending jobs
            response = self.backtest_jobs_table.query(
                IndexName='StatusIndex',
                KeyConditionExpression='#status = :status',
                ExpressionAttributeNames={
                    '#status': 'status'
                },
                ExpressionAttributeValues={
                    ':status': 'pending'
                },
                ScanIndexForward=True,  # Ascending order by created_at
                Limit=limit
            )

            jobs = []
            for item in response.get('Items', []):
                jobs.append(prepare_item_from_dynamodb(item))

            return jobs

        except Exception as e:
            logger.error(f"Failed to get pending backtest jobs: {str(e)}")
            return []

    async def get_user_backtest_jobs(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get backtest jobs for a specific user"""
        if not self.is_connected():
            return []

        try:
            # Query the UserIndex for user's jobs
            response = self.backtest_jobs_table.query(
                IndexName='UserIndex',
                KeyConditionExpression='#user_id = :user_id',
                ExpressionAttributeNames={
                    '#user_id': 'user_id'
                },
                ExpressionAttributeValues={
                    ':user_id': user_id
                },
                ScanIndexForward=False,  # Descending order by created_at
                Limit=limit
            )

            jobs = []
            for item in response.get('Items', []):
                jobs.append(prepare_item_from_dynamodb(item))

            return jobs

        except Exception as e:
            logger.error(f"Failed to get backtest jobs for user {user_id}: {str(e)}")
            return []

    async def update_backtest_job(self, job_id: str, updates: Dict[str, Any]) -> bool:
        """Update a backtest job"""
        if not self.is_connected():
            return False

        try:
            # Build update expression
            update_expression_parts = []
            expression_attribute_names = {}
            expression_attribute_values = {}

            for key, value in updates.items():
                if value is not None:
                    attr_name = f"#{key}"
                    attr_value = f":{key}"

                    update_expression_parts.append(f"{attr_name} = {attr_value}")
                    expression_attribute_names[attr_name] = key

                    # Convert floats to Decimal for DynamoDB
                    if isinstance(value, float):
                        expression_attribute_values[attr_value] = Decimal(str(value))
                    else:
                        expression_attribute_values[attr_value] = value

            if not update_expression_parts:
                return True  # No updates to make

            update_expression = "SET " + ", ".join(update_expression_parts)

            self.backtest_jobs_table.update_item(
                Key={'job_id': job_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values
            )

            logger.info(f"[UPDATE JOB] -- updated backtest job: {job_id} --")
            logger.info(f"[UPDATE JOB] \tupdated_expression={pp.pformat(update_expression)} ")
            logger.info(f"[UPDATE JOB] \texpression_attribute_values={pp.pformat(expression_attribute_values)} ")
            return True

        except Exception as e:
            logger.error(f"Failed to update backtest job {job_id}: {str(e)}")
            return False

    async def delete_backtest_job(self, job_id: str) -> bool:
        """Delete a backtest job"""
        if not self.is_connected():
            return False

        try:
            self.backtest_jobs_table.delete_item(Key={'job_id': job_id})
            logger.info(f"Deleted backtest job: {job_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete backtest job {job_id}: {str(e)}")
            return False

# Global database instance
db_manager = None

def initialize_database(user_table_name: str, feed_table_name: str, backtest_jobs_table_name: str = None, region: str = "us-east-1", use_localstack: bool = False, localstack_endpoint: str = None):
    """Initialize the global database manager"""
    global db_manager
    db_manager = DatabaseManager(user_table_name, feed_table_name, backtest_jobs_table_name, region, use_localstack, localstack_endpoint)
    return db_manager

def get_database() -> DatabaseManager:
    """Get the global database manager instance"""
    return db_manager
