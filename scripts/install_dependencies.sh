#!/bin/bash
cd /var/www/html/goodheart_api
#sudo yum install -y gcc-c++ make
sudo npm install -g pm2
sudo npm install -g typescript
sudo npm install
tsc && cp ./google_auth.json ./build/ 