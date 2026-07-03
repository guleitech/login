# 项目上下文

## 项目概述

本项目是一个完整的用户认证系统，基于 Next.js 16 + Cloudflare Pages + D1 数据库构建。支持用户注册、登录、JWT 认证和 Cookie 会话管理。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Runtime**: Edge Runtime (Cloudflare Pages)
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: JWT + Cookie-based authentication
- **Deployment**: Cloudflare Pages + GitHub

## 目录结构

```
├── database/               # 数据库相关文件
│   └── schema.sql          # D1 数据库表结构定义
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 部署构建脚本（install + next build + tsup）
│   ├── start.sh            # 部署启动脚本（node dist/server.js）
│   ├── coze-preview-build.sh  # Coze 预览构建脚本（install）
│   ├── coze-preview-run.sh    # Coze 预览运行脚本（tsx watch src/server.ts）
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   ├── validate.sh         # 校验脚本（ts-check + lint）
│   └── cf-build.sh         # Cloudflare Pages 构建脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/auth/       # 认证 API 路由
│   │   │   ├── register/   # 注册 API
│   │   │   ├── login/      # 登录 API
│   │   │   ├── logout/     # 登出 API
│   │   │   └── me/         # 获取当前用户信息 API
│   │   ├── register/       # 注册页面
│   │   ├── login/          # 登录页面
│   │   └── page.tsx        # 首页（用户状态展示）
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── utils.ts        # 通用工具函数 (cn)
│   │   └── auth/           # 认证工具库
│   │       ├── types.ts    # 认证类型定义
│   │       ├── password.ts # 密码加密工具（PBKDF2）
│   │       ├── jwt.ts      # JWT 工具（jose）
│   │       └── db.ts       # D1 数据库操作工具
│   └── server.ts           # 自定义服务端入口
├── functions/              # Cloudflare Pages Functions 配置
│   └ env.ts                # 环境变量绑定配置
├── wrangler.toml           # Cloudflare Pages 配置文件
├── .env.example            # 环境变量示例文件
├── DEPLOYMENT.md           # 详细部署教程文档
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。
- 认证相关代码集中在 `src/lib/auth/` 目录，便于维护和扩展。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

### next.config 配置规范

- 配置的路径不要写死绝对路径，必须使用 path.resolve(__dirname, ...)、import.meta.dirname 或 process.cwd() 动态拼接。

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
   3. json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## 认证系统开发规范 (Authentication Standards)

### Edge Runtime 规范

- 所有 API Routes **必须**声明 `export const runtime = 'edge'`
- 禁止使用 Node.js 特有的 API（如 fs、path、crypto（使用 Web Crypto API））
- 使用 `getRequestContext().env` 获取 Cloudflare 环境变量，而不是 `process.env`

### 密码加密规范

- 使用 Web Crypto API 的 PBKDF2 算法（100000 次迭代）
- 必须使用随机盐值（16 字节）
- 密码长度验证：最少 6 字符（建议 8+）
- 加密后的密码格式：`salt:hash`

### JWT 认证规范

- 使用 jose 包处理 JWT（Edge Runtime 兼容）
- JWT 有效期：7 天
- JWT 必包含：userId、email、username
- 使用 HS256 算法签名
- JWT_SECRET 必须至少 32 字符

### Cookie 安全规范

- 必须设置 HttpOnly（防止 XSS）
- 必须设置 Secure（仅 HTTPS）
- 必须设置 SameSite=Strict（防止 CSRF）
- Cookie 名称：`auth_token`
- 有效期：7 天（与 JWT 一致）

### D1 数据库规范

- 所有数据库操作通过 `src/lib/auth/db.ts` 封装
- 使用 SQLite 语法（D1 基于 SQLite）
- 必须创建索引加速查询（email、username）
- 使用参数化查询防止 SQL 注入

### 环境变量规范

- 生产环境变量通过 Cloudflare Dashboard 配置
- 必须配置：JWT_SECRET、DB（D1 binding）
- 禁止在代码中硬编码密钥
- 禁止将 `.env.local` 提交到 Git

## Cloudflare Pages 部署规范

### 构建命令规范

- 生产构建：`bash scripts/cf-build.sh`（使用 @cloudflare/next-on-pages）
- 本地开发：`wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat_v2`
- 禁止使用默认的 Next.js 构建命令

### wrangler.toml 配置规范

- 必须配置 D1 数据库绑定（binding: DB）
- 必须设置 compatibility_flags: ["nodejs_compat_v2"]
- database_id 必须替换为实际值（通过 Cloudflare Dashboard 获取）

### 常见错误规避

1. **wrangler deploy 报错**：检查 D1 binding 配置
2. **页面 404**：确认构建输出目录为 `.vercel/output/static`
3. **自定义 server 冲突**：移除 src/server.ts，使用 Edge Runtime
4. **环境变量未生效**：在 Cloudflare Dashboard 配置，确保 binding 名称正确

## Coze 平台配置

### 项目识别

- **项目类型**：Web 预览型项目（Next.js 16 + 自定义服务器）
- **技术项目根目录**：与工作区根目录重合（`path = ["."]`）
- **运行时**：Node.js 24（`requires = ["nodejs-24"]`）
- **部署产物入口**：`dist/server.js`（通过 tsup 打包 `src/server.ts`）

### 预览链路

- **判定依据**：项目核心结果需要通过浏览器访问的 Web 页面呈现，属于 `web` 类型，可预览
- **预览入口**：自定义 Next.js 服务器（`src/server.ts`），通过 `tsx watch` 启动开发模式
- **预览脚本**：
  - `scripts/coze-preview-build.sh` — 安装依赖（短时执行）
  - `scripts/coze-preview-run.sh` — 启动预览服务，绑定 `0.0.0.0:5000`，具备幂等性
- **根 `.coze` `[dev]`** 指向上述预览脚本

### 部署配置

- **部署类型**：`service` / `web`
- **部署脚本**：
  - `scripts/build.sh` — 安装依赖 → `next build` → `tsup` 打包服务端
  - `scripts/start.sh` — 通过 `node dist/server.js` 启动生产服务，端口 5000
- **根 `.coze` `[deploy]`** 指向上述部署脚本

### 维护注意事项

- 所有脚本（预览和部署）均基于 `SCRIPT_DIR` 推导项目根目录，不依赖调用时的 `pwd` 或 `COZE_WORKSPACE_PATH`
- 预览服务必须绑定 `0.0.0.0:5000`，`HOSTNAME` 环境变量在 `coze-preview-run.sh` 中显式设置
- 部署构建产物为 `dist/server.js`，修改 `src/server.ts` 后需重新构建
- 禁止使用 9000 端口；禁止使用 npm/yarn，仅允许 pnpm
