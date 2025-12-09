@echo off

ssh root@212.85.19.3 "cd /home/formind-projecthub/htdocs/projecthub.formind.tech/frontend && git pull && npm install --force && npm run build"
pause