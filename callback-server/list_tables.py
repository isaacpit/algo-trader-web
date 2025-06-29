#!/usr/bin/env python3
"""
Script to list DynamoDB table names and their contents
Supports both LocalStack (local development) and AWS DynamoDB (production)
Updated for two-table architecture: User table and Feed table
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import List, Dict, Any

from database import DatabaseManager

# Debug mode detection
DEBUG_MODE = os.getenv("DEBUG", "false").lower() == "true"

def debug_print(message: str, data: Any = None):
    """Print debug information when debug mode is enabled"""
    if DEBUG_MODE:
        print(f"🔍 DEBUG: {message}")
        if data is not None:
            if isinstance(data, dict):
                print(json.dumps(data, indent=2, default=str))
            else:
                print(data)
        print()

def get_config_from_env():
    """Get configuration from environment variables"""
    config = {
        "user_table_name": os.getenv("USER_TABLE_NAME", "Algo-Trader-User-Token-Table"),
        "feed_table_name": os.getenv("FEED_TABLE_NAME", "Algo-Trader-Feed-Table"),
        "backtest_jobs_table_name": os.getenv("BACKTEST_JOBS_TABLE_NAME", "Algo-Trader-Backtest-Jobs-Table"),
        "region": os.getenv("AWS_REGION", "us-east-1"),
        "use_localstack": os.getenv("USE_LOCALSTACK", "true").lower() == "true",
        "localstack_endpoint": os.getenv("LOCALSTACK_ENDPOINT", "http://localhost:4566"),
        "debug": DEBUG_MODE
    }

    debug_print("Configuration loaded", config)
    return config

async def list_all_tables(db: DatabaseManager):
    """List all tables in the database"""
    try:
        # Check if DynamoDB client is available
        if not db.dynamodb:
            raise Exception("DynamoDB client is not available")

        # Get all tables
        tables = list(db.dynamodb.tables.all())

        print(f"📋 Found {len(tables)} table(s):")
        for table in tables:
            print(f"  - {table.name}")

        debug_print("All tables", [table.name for table in tables])

        return [table.name for table in tables]

    except Exception as e:
        error_msg = f"Error listing tables: {e}"
        print(f"❌ {error_msg}")
        debug_print("Error listing tables", {"error": str(e)})
        raise Exception(error_msg)

async def get_table_contents(db: DatabaseManager, table_name: str, limit: int = 50):
    """Get contents of a specific table"""
    try:
        # Check if DynamoDB client is available
        if not db.dynamodb:
            raise Exception("DynamoDB client is not available")

        table = db.dynamodb.Table(table_name)

        # Scan the table
        response = table.scan(Limit=limit)
        items = response.get('Items', [])

        print(f"📊 Table '{table_name}' contains {len(items)} item(s):")

        if not items:
            print("  (No items found)")
            return []

        # Display items based on table type
        is_user_table = table_name.endswith("User-Token-Table") or "user" in table_name.lower()
        is_feed_table = table_name.endswith("Feed-Table") or "feed" in table_name.lower()
        is_backtest_jobs_table = table_name.endswith("Backtest-Jobs-Table") or "backtest" in table_name.lower() and "job" in table_name.lower()

        for i, item in enumerate(items, 1):
            print(f"\n  Item {i}:")
            if DEBUG_MODE:
                print(json.dumps(item, indent=4, default=str))
            else:
                # Show a summary based on table type
                if is_user_table:
                    # User table items
                    if 'user_id' in item:
                        print(f"    User ID: {item['user_id']}")
                    if 'name' in item:
                        print(f"    Name: {item['name']}")
                    if 'email' in item:
                        print(f"    Email: {item['email']}")
                    if 'verified' in item:
                        print(f"    Verified: {item['verified']}")
                    if 'followers' in item:
                        print(f"    Followers: {item['followers']}")
                    if 'created_at' in item:
                        print(f"    Created: {item['created_at']}")

                elif is_feed_table:
                    # Feed table items (signals and backtests)
                    if 'item_id' in item:
                        print(f"    Item ID: {item['item_id']}")
                    if 'item_type' in item:
                        print(f"    Type: {item['item_type']}")
                    if 'user_id' in item:
                        print(f"    User ID: {item['user_id']}")
                    if 'name' in item:
                        print(f"    Name: {item['name']}")
                    if 'status' in item:
                        print(f"    Status: {item['status']}")
                    if 'confidence' in item:
                        print(f"    Confidence: {item['confidence']}%")
                    if 'timeframe' in item:
                        print(f"    Timeframe: {item['timeframe']}")
                    if 'created_at' in item:
                        print(f"    Created: {item['created_at']}")
                    if 'performance' in item and item['performance']:
                        perf = item['performance']
                        win_rate = float(perf.get('win_rate', 0)) if perf.get('win_rate') else 0
                        profit_factor = float(perf.get('profit_factor', 0)) if perf.get('profit_factor') else 0
                        print(f"    Performance: Win Rate {win_rate:.1%}, "
                              f"Profit Factor {profit_factor:.2f}")
                elif is_backtest_jobs_table:
                    # Backtest jobs table items
                    if 'job_id' in item:
                        print(f"    Job ID: {item['job_id']}")
                    if 'user_id' in item:
                        print(f"    User ID: {item['user_id']}")
                    if 'strategy_name' in item:
                        print(f"    Strategy: {item['strategy_name']}")
                    if 'status' in item:
                        print(f"    Status: {item['status']}")
                    if 'progress' in item:
                        progress = float(item['progress']) if item['progress'] else 0
                        print(f"    Progress: {progress:.0f}%")
                    if 'timeframe' in item:
                        print(f"    Timeframe: {item['timeframe']}")
                    if 'assets' in item:
                        assets = item['assets'] if isinstance(item['assets'], list) else [item['assets']]
                        print(f"    Assets: {', '.join(assets)}")
                    if 'initial_capital' in item:
                        capital = float(item['initial_capital']) if item['initial_capital'] else 0
                        print(f"    Initial Capital: ${capital:,.0f}")
                    if 'results' in item and item['results']:
                        results = item['results']
                        if 'total_return' in results:
                            return_pct = float(results['total_return']) if results['total_return'] else 0
                            print(f"    Total Return: {return_pct:.1f}%")
                        if 'win_rate' in results:
                            win_rate = float(results['win_rate']) if results['win_rate'] else 0
                            print(f"    Win Rate: {win_rate:.1%}")
                    if 'error_message' in item:
                        print(f"    Error: {item['error_message']}")
                    if 'created_at' in item:
                        print(f"    Created: {item['created_at']}")
                else:
                    # Unknown table type - show generic info
                    for key, value in item.items():
                        if key in ['user_id', 'item_id', 'job_id', 'name', 'email', 'status', 'created_at']:
                            print(f"    {key.replace('_', ' ').title()}: {value}")

        debug_print(f"Table contents for {table_name}", {
            "total_items": len(items),
            "table_type": "user" if is_user_table else "feed" if is_feed_table else "backtest_jobs" if is_backtest_jobs_table else "unknown",
            "sample_items": items[:3] if len(items) > 3 else items
        })

        return items

    except Exception as e:
        error_msg = f"Error getting contents for table '{table_name}': {e}"
        print(f"❌ {error_msg}")
        debug_print(f"Error getting table contents", {"table": table_name, "error": str(e)})
        raise Exception(error_msg)

async def get_table_info(db: DatabaseManager, table_name: str):
    """Get detailed information about a table"""
    try:
        # Check if DynamoDB client is available
        if not db.dynamodb:
            raise Exception("DynamoDB client is not available")

        table = db.dynamodb.Table(table_name)

        # Get table description
        response = table.meta.client.describe_table(TableName=table_name)
        table_info = response['Table']

        # Determine table type
        is_user_table = table_name.endswith("User-Token-Table") or "user" in table_name.lower()
        is_feed_table = table_name.endswith("Feed-Table") or "feed" in table_name.lower()
        is_backtest_jobs_table = table_name.endswith("Backtest-Jobs-Table") or ("backtest" in table_name.lower() and "job" in table_name.lower())
        table_type = "User Table" if is_user_table else "Feed Table" if is_feed_table else "Backtest Jobs Table" if is_backtest_jobs_table else "Unknown"

        print(f"📋 Table Information for '{table_name}' ({table_type}):")
        print(f"  Status: {table_info['TableStatus']}")
        print(f"  Item Count: {table_info.get('ItemCount', 'Unknown')}")
        print(f"  Created: {table_info.get('CreationDateTime', 'Unknown')}")

        # Show key schema
        if 'KeySchema' in table_info:
            print(f"  Key Schema:")
            for key in table_info['KeySchema']:
                print(f"    {key['AttributeName']} ({key['KeyType']})")

        # Show attributes
        if 'AttributeDefinitions' in table_info:
            print(f"  Attributes:")
            for attr in table_info['AttributeDefinitions']:
                print(f"    {attr['AttributeName']} ({attr['AttributeType']})")

        # Show Global Secondary Indexes if they exist
        if 'GlobalSecondaryIndexes' in table_info:
            print(f"  Global Secondary Indexes:")
            for gsi in table_info['GlobalSecondaryIndexes']:
                print(f"    {gsi['IndexName']}")

        debug_print(f"Table info for {table_name}", table_info)

        return table_info

    except Exception as e:
        error_msg = f"Error getting info for table '{table_name}': {e}"
        print(f"❌ {error_msg}")
        debug_print(f"Error getting table info", {"table": table_name, "error": str(e)})
        raise Exception(error_msg)

async def main():
    """Main function to list tables and their contents"""
    print("🔍 Listing DynamoDB tables and contents...")

    if DEBUG_MODE:
        print("🔍 DEBUG MODE ENABLED - Will output detailed data")

    # Get configuration
    config = get_config_from_env()

    print(f"Configuration:")
    print(f"  User Table Name: {config['user_table_name']}")
    print(f"  Feed Table Name: {config['feed_table_name']}")
    print(f"  Backtest Jobs Table Name: {config['backtest_jobs_table_name']}")
    print(f"  Region: {config['region']}")
    print(f"  Use LocalStack: {config['use_localstack']}")
    print(f"  Debug Mode: {config['debug']}")
    if config['use_localstack']:
        print(f"  LocalStack Endpoint: {config['localstack_endpoint']}")

    # Initialize database with all table names
    db = DatabaseManager(
        config["user_table_name"],
        config["feed_table_name"],
        config["backtest_jobs_table_name"],
        config["region"],
        config["use_localstack"],
        config["localstack_endpoint"]
    )

    if not db.is_connected():
        error_msg = "❌ Failed to connect to database"
        print(error_msg)
        if DEBUG_MODE:
            import traceback
            debug_print("Database connection error", traceback.format_exc())
        sys.exit(1)

    print("✅ Connected to database")

    try:
        # List all tables
        print("\n" + "="*50)
        table_names = await list_all_tables(db)

        if not table_names:
            print("No tables found in the database.")
            return

        # For each table, get info and contents
        for table_name in table_names:
            print("\n" + "="*50)

            # Get table information
            await get_table_info(db, table_name)

            print("\n" + "-"*30)

            # Get table contents
            await get_table_contents(db, table_name)

        print("\n" + "="*50)
        print("✅ Table listing completed!")

        # Display access information
        if config['use_localstack']:
            print("\n🔗 LocalStack Access:")
            print(f"  - LocalStack: http://localhost:4566")
            print(f"  - DynamoDB Admin: http://localhost:8001")
            print(f"  - Health Check: http://localhost:4566/_localstack/health")

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: Table listing failed: {e}")
        if DEBUG_MODE:
            import traceback
            debug_print("Full error traceback", traceback.format_exc())

        # Exit with non-zero status code to indicate failure
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Table listing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        if DEBUG_MODE:
            import traceback
            debug_print("Unexpected error traceback", traceback.format_exc())
        sys.exit(1)
