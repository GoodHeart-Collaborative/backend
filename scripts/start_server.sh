#!/bin/bash
cd /var/www/html/goodheart_api
#NODE_ENV=beta pm2 start ./build/server.js --name Women_Beta
aws s3 cp s3://womenheart/env.production /var/www/html/goodheart_api
cp -r env.production .env.production
pm2 delete all
NODE_ENV=production pm2 start ./build/server.js --name women_prod


