#!/usr/bin/env python3
"""
Test script to demonstrate LocalStack enhanced logging
Generates various DynamoDB requests to show in the logs
"""

import boto3
import json
import time
from datetime import datetime

def test_localstack_logging():
    """Test LocalStack enhanced logging with various DynamoDB operations"""

    print("🚀 Testing LocalStack Enhanced Logging")
    print("=" * 50)

    # Configure boto3 for LocalStack
    dynamodb = boto3.resource(
        'dynamodb',
        endpoint_url='http://localhost:4566',
        region_name='us-east-1',
        aws_access_key_id='test',
        aws_secret_access_key='test'
    )

    client = boto3.client(
        'dynamodb',
        endpoint_url='http://localhost:4566',
        region_name='us-east-1',
        aws_access_key_id='test',
        aws_secret_access_key='test'
    )

    table_name = f"test_logging_table_{int(time.time())}"

    try:
        print(f"📋 Creating table: {table_name}")

        # Create table with complex schema
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {
                    'AttributeName': 'user_id',
                    'KeyType': 'HASH'
                },
                {
                    'AttributeName': 'timestamp',
                    'KeyType': 'RANGE'
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'user_id',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'timestamp',
                    'AttributeType': 'S'
                }
            ],
            BillingMode='PAY_PER_REQUEST',
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'StatusIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'status',
                            'KeyType': 'HASH'
                        },
                        {
                            'AttributeName': 'timestamp',
                            'KeyType': 'RANGE'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    }
                }
            ]
        )

        # Wait for table to be created
        table.meta.client.get_waiter('table_exists').wait(TableName=table_name)
        print("✅ Table created successfully")

        print("\n📝 Adding test items...")

        # Add some test items with complex data
        test_items = [
            {
                'user_id': 'user_123',
                'timestamp': datetime.now().isoformat(),
                'status': 'active',
                'data': {
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'preferences': {
                        'theme': 'dark',
                        'notifications': True,
                        'timezone': 'UTC'
                    },
                    'metrics': {
                        'login_count': 42,
                        'last_login': '2024-01-15T10:30:00Z',
                        'score': 95.5
                    }
                },
                'tags': ['premium', 'verified', 'beta'],
                'metadata': {
                    'created_by': 'system',
                    'version': '1.0.0',
                    'environment': 'development'
                }
            },
            {
                'user_id': 'user_456',
                'timestamp': datetime.now().isoformat(),
                'status': 'inactive',
                'data': {
                    'name': 'Jane Smith',
                    'email': 'jane@example.com',
                    'preferences': {
                        'theme': 'light',
                        'notifications': False,
                        'timezone': 'EST'
                    },
                    'metrics': {
                        'login_count': 15,
                        'last_login': '2024-01-10T14:20:00Z',
                        'score': 78.2
                    }
                },
                'tags': ['standard', 'verified'],
                'metadata': {
                    'created_by': 'admin',
                    'version': '1.0.0',
                    'environment': 'development'
                }
            }
        ]

        # Insert items
        for item in test_items:
            table.put_item(Item=item)
            print(f"✅ Added item for user: {item['user_id']}")

        print("\n🔍 Performing queries...")

        # Query by user_id
        response = table.query(
            KeyConditionExpression='user_id = :user_id',
            ExpressionAttributeValues={
                ':user_id': 'user_123'
            }
        )
        print(f"✅ Query result: {len(response['Items'])} items found")

        # Scan with filter
        response = table.scan(
            FilterExpression='#status = :status',
            ExpressionAttributeNames={
                '#status': 'status'
            },
            ExpressionAttributeValues={
                ':status': 'active'
            }
        )
        print(f"✅ Scan result: {len(response['Items'])} active items found")

        # Update item
        print("\n🔄 Updating item...")
        table.update_item(
            Key={
                'user_id': 'user_123',
                'timestamp': test_items[0]['timestamp']
            },
            UpdateExpression='SET #data.metrics.login_count = :count, #data.metrics.last_login = :login',
            ExpressionAttributeNames={
                '#data': 'data'
            },
            ExpressionAttributeValues={
                ':count': 43,
                ':login': datetime.now().isoformat()
            }
        )
        print("✅ Item updated successfully")

        # Delete item
        print("\n🗑️  Deleting item...")
        table.delete_item(
            Key={
                'user_id': 'user_456',
                'timestamp': test_items[1]['timestamp']
            }
        )
        print("✅ Item deleted successfully")

        print("\n📊 Checking table statistics...")
        response = client.describe_table(TableName=table_name)
        print(f"✅ Table status: {response['Table']['TableStatus']}")
        print(f"✅ Item count: {response['Table'].get('ItemCount', 'N/A')}")

        print("\n🧹 Cleaning up...")
        table.delete()
        print("✅ Table deleted successfully")

        print("\n🎉 Test completed successfully!")
        print("\n📋 Check the LocalStack logs to see the detailed request/response bodies:")
        print("   ./view_localstack_logs.sh -f -d")
        print("   ./view_localstack_logs.sh -r")

    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
        return False

    return True

if __name__ == "__main__":
    test_localstack_logging()
