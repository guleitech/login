#!/bin/bash

# Cloudflare Pages 构建脚本

echo "🚀 开始 Cloudflare Pages 构建..."

# 1. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 2. 构建 Next.js 项目（使用 @cloudflare/next-on-pages）
echo "🏗️ 构建 Next.js 项目..."
npx @cloudflare/next-on-pages --experimental-minify

# 3. 构建完成
echo "✅ 构建完成！"
echo "📁 输出目录: .worker-next"

# 提示部署步骤
echo ""
echo "📖 重要配置步骤："
echo "1. ✅ 在 Cloudflare Dashboard 创建 D1 数据库"
echo "2. ✅ 在 Cloudflare Pages 创建项目并连接 GitHub 仓库"
echo "3. ✅ 配置环境变量："
echo "   - JWT_SECRET（至少32字符的随机字符串）"
echo "4. ✅ 配置 D1 数据库绑定："
echo "   - Variable name: DB"
echo "   - D1 database: 选择您的数据库"
echo "5. ✅ 设置构建命令: bash scripts/cf-build.sh"
echo "6. ✅ 设置输出目录: .worker-next"
echo "7. ✅ 执行数据库初始化 SQL（database/schema.sql）"
echo ""
echo "⚠️ 注意：不要使用 wrangler.toml 文件，Pages 配置应在 Dashboard 中完成"