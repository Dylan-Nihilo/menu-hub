#!/bin/sh
# 初始化数据库
npx prisma db push --skip-generate

# 启动应用
exec node server.js
