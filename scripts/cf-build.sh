#!/bin/bash

# Cloudflare Pages 构建脚本

echo "🚀 开始 Cloudflare Pages 构建..."

# 1. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 2. 构建 Next.js 项目（使用 @cloudflare/next-on-pages）
echo "🏗️ 构建 Next.js 项目..."
npx @cloudflare/next-on-pages

# 3. 构建完成
echo "✅ 构建完成！"
echo "📁 输出目录: .vercel/output/static"

# 提示部署步骤
echo ""
echo "📖 部署步骤："
echo "1. 在 Cloudflare Dashboard 创建 D1 数据库"
echo "2. 在 Cloudflare Pages 创建项目并连接 GitHub 仓库"
echo "3. 配置环境变量：JWT_SECRET"
echo "4. 设置构建命令: bash scripts/cf-build.sh"
echo "5. 设置输出目录: .vercel/output/static"
echo "6. 在 wrangler.toml 中更新数据库 ID"
echo "7. 部署完成！"