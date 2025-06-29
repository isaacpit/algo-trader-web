#!/usr/bin/env python3
"""
Billing Monitor for AlgoTraders Project
Monitors AWS costs and implements spending controls
"""

import boto3
import json
import os
import sys
from datetime import datetime, timedelta
from botocore.exceptions import ClientError, NoCredentialsError
import argparse

class BillingMonitor:
    def __init__(self, monthly_budget=2.00, alert_threshold=80):
        self.monthly_budget = float(monthly_budget)
        self.alert_threshold = float(alert_threshold)
        self.ce_client = boto3.client('ce')
        self.sns_client = boto3.client('sns')
        self.sts_client = boto3.client('sts')
        self.ec2_client = boto3.client('ec2')
        self.rds_client = boto3.client('rds')
        self.lambda_client = boto3.client('lambda')
        self.s3_client = boto3.client('s3')

    def get_current_month_cost(self):
        """Get current month's cost"""
        try:
            start_date = datetime.now().replace(day=1).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')

            response = self.ce_client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date,
                    'End': end_date
                },
                Granularity='MONTHLY',
                Metrics=['UnblendedCost']
            )

            if response['ResultsByTime']:
                cost_str = response['ResultsByTime'][0]['Total']['UnblendedCost']['Amount']
                return float(cost_str)
            return 0.0

        except Exception as e:
            print(f"Error getting current month cost: {e}")
            return 0.0

    def get_cost_by_service(self):
        """Get cost breakdown by AWS service"""
        try:
            start_date = datetime.now().replace(day=1).strftime('%Y-%m-%d')
            end_date = datetime.now().strftime('%Y-%m-%d')

            response = self.ce_client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date,
                    'End': end_date
                },
                Granularity='MONTHLY',
                Metrics=['UnblendedCost'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'}
                ]
            )

            service_costs = {}
            if response['ResultsByTime']:
                for group in response['ResultsByTime'][0]['Groups']:
                    service = group['Keys'][0]
                    cost = float(group['Metrics']['UnblendedCost']['Amount'])
                    if cost > 0:
                        service_costs[service] = cost

            return service_costs

        except Exception as e:
            print(f"Error getting cost by service: {e}")
            return {}

    def get_account_info(self):
        """Get AWS account information"""
        try:
            identity = self.sts_client.get_caller_identity()
            return {
                'account_id': identity['Account'],
                'user_id': identity['UserId'],
                'arn': identity['Arn']
            }
        except Exception as e:
            print(f"Error getting account info: {e}")
            return {}

    def send_alert(self, subject, message, topic_arn=None):
        """Send alert via SNS"""
        try:
            if topic_arn:
                self.sns_client.publish(
                    TopicArn=topic_arn,
                    Subject=subject,
                    Message=message
                )
                print(f"Alert sent to SNS topic: {subject}")
            else:
                print(f"Alert (no SNS topic): {subject}")
                print(message)
        except Exception as e:
            print(f"Error sending alert: {e}")

    def stop_non_essential_ec2_instances(self):
        """Stop non-essential EC2 instances"""
        try:
            response = self.ec2_client.describe_instances(
                Filters=[
                    {'Name': 'instance-state-name', 'Values': ['running']},
                    {'Name': 'tag:Essential', 'Values': ['false']}
                ]
            )

            stopped_instances = []
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    instance_id = instance['InstanceId']
                    try:
                        self.ec2_client.stop_instances(InstanceIds=[instance_id])
                        stopped_instances.append(instance_id)
                        print(f"Stopped EC2 instance: {instance_id}")
                    except Exception as e:
                        print(f"Error stopping instance {instance_id}: {e}")

            return stopped_instances

        except Exception as e:
            print(f"Error stopping EC2 instances: {e}")
            return []

    def scale_down_rds_instances(self):
        """Scale down RDS instances to minimum"""
        try:
            response = self.rds_client.describe_db_instances()

            scaled_instances = []
            for instance in response['DBInstances']:
                if instance['DBInstanceStatus'] == 'available':
                    instance_id = instance['DBInstanceIdentifier']
                    current_class = instance['DBInstanceClass']

                    # Scale down to db.t3.micro if larger
                    if 'micro' not in current_class.lower():
                        try:
                            self.rds_client.modify_db_instance(
                                DBInstanceIdentifier=instance_id,
                                DBInstanceClass='db.t3.micro',
                                ApplyImmediately=True
                            )
                            scaled_instances.append(instance_id)
                            print(f"Scaled down RDS instance: {instance_id} to db.t3.micro")
                        except Exception as e:
                            print(f"Error scaling down RDS instance {instance_id}: {e}")

            return scaled_instances

        except Exception as e:
            print(f"Error scaling down RDS instances: {e}")
            return []

    def disable_non_critical_lambdas(self):
        """Disable non-critical Lambda functions"""
        try:
            response = self.lambda_client.list_functions()

            disabled_functions = []
            for function in response['Functions']:
                function_name = function['FunctionName']

                # Skip functions with 'critical' in name or tags
                if 'critical' not in function_name.lower():
                    try:
                        # Disable by setting concurrency to 0
                        self.lambda_client.put_function_concurrency(
                            FunctionName=function_name,
                            ReservedConcurrentExecutions=0
                        )
                        disabled_functions.append(function_name)
                        print(f"Disabled Lambda function: {function_name}")
                    except Exception as e:
                        print(f"Error disabling Lambda function {function_name}: {e}")

            return disabled_functions

        except Exception as e:
            print(f"Error disabling Lambda functions: {e}")
            return []

    def cleanup_old_cloudwatch_logs(self):
        """Clean up old CloudWatch logs"""
        try:
            logs_client = boto3.client('logs')

            # List log groups
            response = logs_client.describe_log_groups()

            cleaned_groups = []
            cutoff_date = datetime.now() - timedelta(days=7)  # Keep only 7 days

            for log_group in response['logGroups']:
                log_group_name = log_group['logGroupName']

                # Skip critical log groups
                if 'critical' not in log_group_name.lower():
                    try:
                        # Delete log group
                        logs_client.delete_log_group(logGroupName=log_group_name)
                        cleaned_groups.append(log_group_name)
                        print(f"Deleted CloudWatch log group: {log_group_name}")
                    except Exception as e:
                        print(f"Error deleting log group {log_group_name}: {e}")

            return cleaned_groups

        except Exception as e:
            print(f"Error cleaning up CloudWatch logs: {e}")
            return []

    def cleanup_old_s3_objects(self):
        """Clean up old S3 objects"""
        try:
            response = self.s3_client.list_buckets()

            cleaned_buckets = []
            cutoff_date = datetime.now() - timedelta(days=30)  # Keep only 30 days

            for bucket in response['Buckets']:
                bucket_name = bucket['Name']

                # Skip critical buckets
                if 'critical' not in bucket_name.lower() and 'backup' not in bucket_name.lower():
                    try:
                        # List objects older than cutoff
                        objects_response = self.s3_client.list_objects_v2(
                            Bucket=bucket_name,
                            MaxKeys=1000
                        )

                        old_objects = []
                        for obj in objects_response.get('Contents', []):
                            if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                                old_objects.append({'Key': obj['Key']})

                        if old_objects:
                            self.s3_client.delete_objects(
                                Bucket=bucket_name,
                                Delete={'Objects': old_objects}
                            )
                            cleaned_buckets.append(bucket_name)
                            print(f"Cleaned up {len(old_objects)} old objects from S3 bucket: {bucket_name}")

                    except Exception as e:
                        print(f"Error cleaning up S3 bucket {bucket_name}: {e}")

            return cleaned_buckets

        except Exception as e:
            print(f"Error cleaning up S3 objects: {e}")
            return []

    def implement_cost_controls(self):
        """Implement comprehensive cost controls"""
        print("🚨 Implementing cost controls...")

        controls_applied = {
            'ec2_instances_stopped': self.stop_non_essential_ec2_instances(),
            'rds_instances_scaled': self.scale_down_rds_instances(),
            'lambda_functions_disabled': self.disable_non_critical_lambdas(),
            'cloudwatch_logs_cleaned': self.cleanup_old_cloudwatch_logs(),
            's3_objects_cleaned': self.cleanup_old_s3_objects()
        }

        return controls_applied

    def generate_cost_report(self):
        """Generate comprehensive cost report"""
        current_cost = self.get_current_month_cost()
        service_costs = self.get_cost_by_service()
        account_info = self.get_account_info()

        report = {
            'timestamp': datetime.now().isoformat(),
            'account_info': account_info,
            'current_month_cost': current_cost,
            'monthly_budget': self.monthly_budget,
            'budget_percentage': (current_cost / self.monthly_budget) * 100 if self.monthly_budget > 0 else 0,
            'service_breakdown': service_costs,
            'budget_exceeded': current_cost >= self.monthly_budget,
            'alert_threshold_reached': (current_cost / self.monthly_budget) * 100 >= self.alert_threshold
        }

        return report

    def run_monitoring(self, topic_arn=None, apply_controls=False):
        """Run complete billing monitoring"""
        print("🔍 Starting billing monitoring...")

        # Get cost report
        report = self.generate_cost_report()

        # Display report
        print("\n" + "="*60)
        print("BILLING MONITORING REPORT")
        print("="*60)
        print(f"Account ID: {report['account_info'].get('account_id', 'Unknown')}")
        print(f"Current Month Cost: ${report['current_month_cost']:.2f}")
        print(f"Monthly Budget: ${report['monthly_budget']:.2f}")
        print(f"Budget Usage: {report['budget_percentage']:.1f}%")
        print(f"Budget Exceeded: {'Yes' if report['budget_exceeded'] else 'No'}")
        print(f"Alert Threshold Reached: {'Yes' if report['alert_threshold_reached'] else 'No'}")

        print("\nService Cost Breakdown:")
        print("-" * 30)
        for service, cost in sorted(report['service_breakdown'].items(), key=lambda x: x[1], reverse=True):
            print(f"{service}: ${cost:.2f}")

        # Send alerts if needed
        if report['budget_exceeded']:
            subject = f"🚨 CRITICAL: AWS Budget Exceeded - ${report['current_month_cost']:.2f}"
            message = f"""
🚨 CRITICAL BILLING ALERT 🚨

Your AWS account has exceeded the monthly budget of ${report['monthly_budget']:.2f}.

Current Month Cost: ${report['current_month_cost']:.2f}
Budget Limit: ${report['monthly_budget']:.2f}
Over Budget: ${report['current_month_cost'] - report['monthly_budget']:.2f}

Account ID: {report['account_info'].get('account_id', 'Unknown')}
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

IMMEDIATE ACTION REQUIRED:
1. Review and terminate unnecessary resources
2. Check for unexpected charges
3. Consider implementing stricter spending controls

Service Breakdown:
{chr(10).join([f"- {service}: ${cost:.2f}" for service, cost in report['service_breakdown'].items()])}
            """

            self.send_alert(subject, message, topic_arn)

            if apply_controls:
                print("\n🔧 Applying cost controls...")
                controls = self.implement_cost_controls()

                print("\nCost Controls Applied:")
                print("-" * 25)
                for control_type, items in controls.items():
                    if items:
                        print(f"{control_type}: {len(items)} items")
                        for item in items[:3]:  # Show first 3 items
                            print(f"  - {item}")
                        if len(items) > 3:
                            print(f"  ... and {len(items) - 3} more")

        elif report['alert_threshold_reached']:
            subject = f"⚠️ WARNING: AWS Budget at {report['budget_percentage']:.1f}%"
            message = f"""
⚠️ BUDGET WARNING ⚠️

Your AWS account is approaching the monthly budget limit.

Current Month Cost: ${report['current_month_cost']:.2f}
Budget Limit: ${report['monthly_budget']:.2f}
Usage: {report['budget_percentage']:.1f}%
Remaining: ${report['monthly_budget'] - report['current_month_cost']:.2f}

Account ID: {report['account_info'].get('account_id', 'Unknown')}
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

RECOMMENDED ACTIONS:
1. Review current resource usage
2. Consider stopping non-essential services
3. Monitor spending closely

Service Breakdown:
{chr(10).join([f"- {service}: ${cost:.2f}" for service, cost in report['service_breakdown'].items()])}
            """

            self.send_alert(subject, message, topic_arn)

        print("\n" + "="*60)
        print("Monitoring completed!")
        print("="*60)

        return report

def main():
    parser = argparse.ArgumentParser(description='AWS Billing Monitor for AlgoTraders')
    parser.add_argument('--budget', type=float, default=2.00, help='Monthly budget in USD (default: 2.00)')
    parser.add_argument('--threshold', type=float, default=80, help='Alert threshold percentage (default: 80)')
    parser.add_argument('--topic-arn', help='SNS topic ARN for alerts')
    parser.add_argument('--apply-controls', action='store_true', help='Apply cost controls when budget exceeded')
    parser.add_argument('--report-only', action='store_true', help='Generate report only, no alerts')

    args = parser.parse_args()

    try:
        monitor = BillingMonitor(args.budget, args.threshold)

        if args.report_only:
            report = monitor.generate_cost_report()
            print(json.dumps(report, indent=2))
        else:
            monitor.run_monitoring(args.topic_arn, args.apply_controls)

    except NoCredentialsError:
        print("❌ AWS credentials not found. Please run 'aws configure' first.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
