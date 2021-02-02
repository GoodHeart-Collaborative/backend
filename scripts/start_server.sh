#!/bin/bash
cd /var/www/html/goodheart_api
#NODE_ENV=beta pm2 start ./build/server.js --name Women_Beta
pm2 delete all
pm2 start build/server.js --name women_beta