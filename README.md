# Cloudflare Pages + D1 注册登录系统

基于 Next.js 16 + TypeScript + Cloudflare Pages + D1 数据库构建的完整用户认证系统。

## ✨ 功能特性

- ✅ 用户注册（邮箱、用户名、密码）
- ✅ 用户登录（邮箱 + 密码）
- ✅ JWT 认证（7 天有效期）
- ✅ Cookie 会话管理（HttpOnly、Secure、SameSite=Strict）
- ✅ 密码加密（PBKDF2，100000 次迭代）
- ✅ Edge Runtime 支持
- ✅ Cloudflare D1 数据库集成
- ✅ 完整部署教程

## 🛠️ 技术栈

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **Runtime**: Edge Runtime (Cloudflare Pages)
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: JWT (jose) + PBKDF2 密码加密
- **Deployment**: Cloudflare Pages + GitHub

## 📦 项目结构

```
├── database/schema.sql        # D1 数据库表结构
├── src/lib/auth/              # 认证工具库
│   ├── types.ts               # 类型定义
│   ├── password.ts            # 密码加密（PBKDF2）
│   ├── jwt.ts                 # JWT 工具（jose）
│   └── db.ts                  # D1 数据库操作
├── src/app/api/auth/          # 认证 API 路由
│   ├── register/route.ts      # 注册 API
│   ├── login/route.ts         # 登录 API
│   ├── logout/route.ts        # 登出 API
│   └── me/route.ts            # 获取当前用户信息 API
├── src/app/register/          # 注册页面
├── src/app/login/             # 登录页面
├── wrangler.toml              # Cloudflare Pages 配置
├── DEPLOYMENT.md              # 详细部署教程
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/cloudflare-auth-system.git
cd cloudflare-auth-system
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local，填写实际的环境变量
```

### 4. 本地开发

```bash
# 先构建项目
bash scripts/cf-build.sh

# 使用 wrangler 本地运行（需要配置 D1 数据库）
wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat_v2
```

### 5. 部署到 Cloudflare Pages

详细部署步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔐 安全特性

### 密码安全
- PBKDF2 加密算法（100000 次迭代）
- 随机盐值（16 字节）
- 密码长度验证（最少 6 字符）

### JWT 安全
- HS256 签名算法
- 7 天有效期
- 强随机密钥（至少 32 字符）

### Cookie 安全
- HttpOnly（防止 XSS）
- Secure（仅 HTTPS）
- SameSite=Strict（防止 CSRF）

## 📖 文档

- [部署教程](./DEPLOYMENT.md) - 完整的 GitHub + Cloudflare Pages 部署指南
- [项目文档](./AGENTS.md) - 开发规范和项目结构说明

## 🐛 常见问题

### wrangler deploy 报错
检查 wrangler.toml 中的 D1 database_id 是否正确配置。

### 页面 404
确认构建输出目录为 `.vercel/output/static`，使用 `bash scripts/cf-build.sh` 构建。

### 环境变量未生效
在 Cloudflare Dashboard 中配置 JWT_SECRET 和 D1 binding。

更多问题解决方案请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 的"常见问题解决方案"章节。

## 📝 License

MIT

## 👨‍💻 Author

Created with ❤️ by Cloudflare Auth System