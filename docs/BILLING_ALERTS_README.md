# AWS Billing Alerts & Spending Controls

A comprehensive solution to monitor AWS costs and prevent overspending with automatic controls and alerts.

## 🎯 Overview

This system provides:

- **Real-time cost monitoring** with CloudWatch alarms
- **Email alerts** when approaching or exceeding budget
- **Automatic cost controls** to prevent overspending
- **Daily monitoring** via Lambda function
- **CloudWatch dashboard** for cost visualization
- **Comprehensive reporting** and analysis

## 🚀 Quick Start

### 1. Deploy Billing Alerts Stack

```bash
# Deploy with default settings ($2 monthly budget)
./deploy-billing-alerts.sh -e your-email@example.com

# Deploy with custom budget and threshold
./deploy-billing-alerts.sh -e your-email@example.com -b 5.00 -t 90

# Deploy to specific region
./deploy-billing-alerts.sh -e your-email@example.com -r us-west-2
```

### 2. Confirm Email Subscription

Check your email for the SNS subscription confirmation and click the link to confirm.

### 3. Monitor Your Costs

- **CloudWatch Dashboard**: View real-time cost metrics
- **Email Alerts**: Receive notifications at 80% and 100% of budget
- **Lambda Logs**: Monitor automatic cost controls

## 📊 Features

### Cost Monitoring

- **Real-time tracking** of AWS costs
- **Service breakdown** analysis
- **Budget percentage** calculations
- **Historical cost** trends

### Alert System

- **80% budget warning** - Early notification
- **100% budget exceeded** - Critical alert
- **Email notifications** via SNS
- **Customizable thresholds**

### Automatic Controls

When budget is exceeded, the system automatically:

- **Stops non-essential EC2 instances**
- **Scales down RDS instances** to minimum
- **Disables non-critical Lambda functions**
- **Cleans up old CloudWatch logs**
- **Removes old S3 objects**

### CloudWatch Integration

- **Custom dashboard** for cost visualization
- **Daily monitoring** via scheduled Lambda
- **Comprehensive metrics** and alarms

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS Billing   │    │  CloudWatch     │    │   SNS Topic     │
│     Service     │───▶│    Alarms       │───▶│   (Alerts)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Lambda        │    │   Email         │
                       │   Function      │    │   Notifications │
                       │   (Daily Check) │    │                 │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cost Controls │
                       │   (Auto Actions)│
                       └─────────────────┘
```

## 📁 Files

### CloudFormation Template

- `infra/billing-alerts.yaml` - Main CloudFormation template

### Deployment Scripts

- `deploy-billing-alerts.sh` - Automated deployment script
- `callback-server/billing_monitor.py` - Standalone monitoring script

### Generated Resources

- **SNS Topic** - For email notifications
- **CloudWatch Alarms** - Budget monitoring
- **Lambda Function** - Daily cost checking
- **IAM Roles** - Permissions for monitoring
- **CloudWatch Dashboard** - Cost visualization

## 🔧 Configuration

### Environment Variables

```bash
# Required
EMAIL_ADDRESS=your-email@example.com

# Optional (with defaults)
MONTHLY_BUDGET=2.00          # Monthly budget in USD
ALERT_THRESHOLD=80          # Alert at 80% of budget
AWS_REGION=us-east-1        # AWS region
```

### CloudFormation Parameters

- `EmailAddress` - Email for billing alerts
- `MonthlyBudget` - Monthly spending limit ($2.00 default)
- `AlertThreshold` - Percentage to trigger first alert (80% default)

## 📈 Monitoring

### CloudWatch Dashboard

Access your personalized dashboard at:

```
https://{region}.console.aws.amazon.com/cloudwatch/home?region={region}#dashboards:name={stack-name}-billing-dashboard
```

### Lambda Function Monitoring

- **Schedule**: Runs daily at midnight UTC
- **Logs**: Available in CloudWatch Logs
- **Metrics**: Monitored via CloudWatch

### Cost Alerts

- **Warning**: At 80% of budget
- **Critical**: At 100% of budget
- **Format**: Detailed email with cost breakdown

## 🛠️ Usage Examples

### Deploy Billing Alerts

```bash
# Basic deployment
./deploy-billing-alerts.sh -e admin@yourcompany.com

# Custom budget and threshold
./deploy-billing-alerts.sh \
  -e admin@yourcompany.com \
  -b 10.00 \
  -t 85 \
  -r us-west-2

# Delete stack
./deploy-billing-alerts.sh -d -s algotraders-billing-alerts
```

### Manual Cost Monitoring

```bash
# Generate cost report
python callback-server/billing_monitor.py --report-only

# Run monitoring with alerts
python callback-server/billing_monitor.py \
  --budget 2.00 \
  --threshold 80 \
  --topic-arn arn:aws:sns:region:account:topic-name

# Apply cost controls
python callback-server/billing_monitor.py \
  --apply-controls \
  --topic-arn arn:aws:sns:region:account:topic-name
```

### AWS CLI Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name algotraders-billing-alerts

# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name algotraders-billing-alerts \
  --query 'Stacks[0].Outputs'

# View Lambda logs
aws logs tail /aws/lambda/algotraders-billing-alerts-billing-control --follow
```

## 🔒 Security

### IAM Permissions

The system uses minimal required permissions:

- **Cost Explorer**: Read access to billing data
- **CloudWatch**: Create alarms and publish metrics
- **SNS**: Publish notifications
- **Lambda**: Basic execution role

### Data Protection

- **No sensitive data** stored in logs
- **Encrypted communications** via HTTPS
- **Principle of least privilege** for IAM roles

## 🚨 Alert Examples

### Warning Alert (80% of budget)

```
⚠️ BUDGET WARNING ⚠️

Your AWS account is approaching the monthly budget limit.

Current Month Cost: $1.60
Budget Limit: $2.00
Usage: 80.0%
Remaining: $0.40

Account ID: 123456789012
Date: 2024-01-15 10:30:00

RECOMMENDED ACTIONS:
1. Review current resource usage
2. Consider stopping non-essential services
3. Monitor spending closely

Service Breakdown:
- Amazon EC2: $0.85
- Amazon RDS: $0.45
- AWS Lambda: $0.20
- Amazon S3: $0.10
```

### Critical Alert (100% of budget)

```
🚨 CRITICAL BILLING ALERT 🚨

Your AWS account has exceeded the monthly budget of $2.00.

Current Month Cost: $2.15
Budget Limit: $2.00
Over Budget: $0.15

Account ID: 123456789012
Date: 2024-01-15 10:30:00

IMMEDIATE ACTION REQUIRED:
1. Review and terminate unnecessary resources
2. Check for unexpected charges
3. Consider implementing stricter spending controls

Service Breakdown:
- Amazon EC2: $1.20
- Amazon RDS: $0.60
- AWS Lambda: $0.25
- Amazon S3: $0.10
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Email Notifications Not Received

```bash
# Check SNS subscription status
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:region:account:topic-name

# Resend confirmation
aws sns confirm-subscription \
  --topic-arn arn:aws:sns:region:account:topic-name \
  --token your-confirmation-token
```

#### 2. Lambda Function Errors

```bash
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/algotraders-billing-alerts

# View recent logs
aws logs tail /aws/lambda/algotraders-billing-alerts-billing-control --since 1h
```

#### 3. CloudWatch Alarms Not Triggering

```bash
# Check alarm status
aws cloudwatch describe-alarms \
  --alarm-names algotraders-billing-alerts-budget-warning

# Test alarm
aws cloudwatch set-alarm-state \
  --alarm-name algotraders-billing-alerts-budget-warning \
  --state-value ALARM \
  --state-reason "Testing alarm"
```

### Debug Mode

```bash
# Enable debug logging
export AWS_CLI_DEBUG=1

# Run with verbose output
./deploy-billing-alerts.sh -e your-email@example.com --debug
```

## 📊 Cost Optimization Tips

### Before Budget Exceeded

1. **Review EC2 instances** - Stop unused instances
2. **Check RDS databases** - Scale down if possible
3. **Monitor Lambda functions** - Remove unused functions
4. **Clean up S3 storage** - Delete old objects
5. **Review CloudWatch logs** - Set retention policies

### After Budget Exceeded

1. **Immediate actions** - Stop all non-critical resources
2. **Investigate charges** - Check for unexpected usage
3. **Implement limits** - Set up stricter spending controls
4. **Monitor closely** - Check costs daily
5. **Consider alternatives** - Use cheaper AWS services

## 🔄 Maintenance

### Regular Tasks

- **Monthly**: Review and adjust budget limits
- **Weekly**: Check CloudWatch dashboard
- **Daily**: Monitor email alerts
- **As needed**: Update email addresses

### Updates

```bash
# Update stack with new parameters
./deploy-billing-alerts.sh \
  -e new-email@example.com \
  -b 5.00 \
  -t 90
```

## 📞 Support

### Getting Help

1. **Check logs**: Review CloudWatch and Lambda logs
2. **Verify configuration**: Ensure all parameters are correct
3. **Test manually**: Run billing monitor script manually
4. **Contact support**: For AWS-specific issues

### Useful Commands

```bash
# Get stack status
aws cloudformation describe-stacks --stack-name algotraders-billing-alerts

# View all resources
aws cloudformation list-stack-resources --stack-name algotraders-billing-alerts

# Check costs manually
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics UnblendedCost
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**⚠️ Important**: This system helps prevent overspending but should not replace regular cost monitoring and optimization practices. Always review your AWS usage regularly and implement appropriate cost controls for your specific use case.
