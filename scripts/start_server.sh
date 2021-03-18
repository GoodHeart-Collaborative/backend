#!/bin/bash
cd /var/www/html/goodheart_api
#NODE_ENV=beta pm2 start ./build/server.js --name Women_Beta
pm2 delete all
NODE_ENV=prod pm2 start ./build/server.js --name women_prod