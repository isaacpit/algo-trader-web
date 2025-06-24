#!/bin/sh

set -exo pipefail

aws cloudformation deploy \
  --template-file infra/templates/dynamodb.yaml \
  --stack-name algotrader-user-token-dynamodb

aws cloudformation deploy \
  --template-file infra/templates/ec2-iam.yaml \
  --stack-name algotrader-ec2-iam \
  --capabilities CAPABILITY_NAMED_IAM