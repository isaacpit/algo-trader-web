#!/bin/sh

set -o allexport; source .env; set +o allexport

if [[ -z "${ELASTIC_IP}" ]]; then
  echo "[ERROR] The env variable 'ELASTIC_IP' was not set"
else
  echo "ELASTIC_IP was properly set!"
  echo "ELASTIC_IP=$ELASTIC_IP"
fi

rsync -avz -e "ssh -i ~/.ssh/aws-isaacpit97-kp.pem" callback-server/ ec2-user@$ELASTIC_IP:/home/ec2-user/callback-server/