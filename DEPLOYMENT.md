# Cloudflare Pages + D1 注册登录系统部署指南

本指南将帮助您将 Next.js 16 + TypeScript + Cloudflare Pages + D1 注册登录系统部署到生产环境。

## 📋 前置要求

- GitHub 账号
- Cloudflare 账号
- Node.js 18+ 和 pnpm 已安装
- wrangler CLI 已安装（可选，用于本地开发）

---

## 🚀 第一步：GitHub 仓库设置

### 1.1 创建 GitHub 仓库

1. 登录 GitHub
2. 点击 "New repository"
3. 仓库名称：`cloudflare-auth-system`（或您喜欢的名称）
4. 设置为 Private 或 Public
5. 不要初始化 README、.gitignore 或 license（因为本地已有代码）
6. 点击 "Create repository"

### 1.2 推送代码到 GitHub

```bash
# 在本地项目目录执行
git init
git add .
git commit -m "Initial commit: Cloudflare Pages + D1 auth system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cloudflare-auth-system.git
git push -u origin main
```

---

## 🗄️ 第二步：创建 Cloudflare D1 数据库

### 2.1 通过 Cloudflare Dashboard 创建

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Workers & Pages" → "D1 SQL Database"
3. 点击 "Create database"
4. 数据库名称：`auth-database`
5. 点击 "Create"

### 2.2 记录数据库 ID

创建完成后，您会看到数据库 ID（形如 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`），请记录下来，后续配置需要使用。

### 2.3 执行数据库初始化 SQL

1. 在 D1 数据库页面，点击 "Console"
2. 执行以下 SQL 语句（位于项目的 `database/schema.sql` 文件）：

```sql
-- Cloudflare D1 用户表结构
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 创建更新时间触发器
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

3. 点击 "Execute" 执行 SQL
4. 确认表创建成功（可通过 "Tables" 查看）

---

## 🌐 第三步：创建 Cloudflare Pages 项目

### 3.1 通过 Dashboard 创建

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Workers & Pages"
3. 点击 "Create application"
4. 选择 "Pages" → "Connect to Git"
5. 选择您的 GitHub 仓库 `cloudflare-auth-system`
6. 点击 "Begin setup"

### 3.2 配置构建设置

在 "Set up builds and deployments" 页面：

- **Production branch**: `main`
- **Build command**: `bash scripts/cf-build.sh`
- **Build output directory**: `.vercel/output/static`

⚠️ **重要提示**：不要使用默认的 Next.js 构建命令，必须使用我们自定义的 `cf-build.sh` 脚本。

### 3.3 配置环境变量

在 "Environment variables" 部分，添加以下变量：

- `JWT_SECRET`: 您的 JWT 密钥（至少 32 个字符，建议使用随机字符串）
  
  生成方法：
  ```bash
  # 使用 openssl 生成随机密钥
  openssl rand -base64 32
  ```

- `CF_ACCOUNT_ID`: Cloudflare 账户 ID（可在 Dashboard 右侧找到）
- `CF_D1_DATABASE_ID`: D1 数据库 ID（第二步记录的值）
- `CF_API_TOKEN`: Cloudflare API Token（可选，用于 wrangler 命令）

⚠️ **安全提示**：JWT_SECRET 是敏感信息，请使用强随机密钥，不要使用简单密码。

### 3.4 绑定 D1 数据库

1. 在 Pages 项目设置页面，找到 "Functions"
2. 点击 "D1 database bindings"
3. 添加绑定：
   - Variable name: `DB`
   - D1 database: 选择 `auth-database`
4. 点击 "Save"

---

## 🔧 第四步：更新项目配置

### 4.1 更新 wrangler.toml

在项目的 `wrangler.toml` 文件中，将 `YOUR_D1_DATABASE_ID` 替换为实际的数据库 ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "auth-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换为您的数据库 ID
```

### 4.2 提交更改

```bash
git add wrangler.toml
git commit -m "Update D1 database ID"
git push origin main
```

---

## 🚀 第五步：触发部署

### 5.1 自动部署

推送代码后，Cloudflare Pages 会自动触发部署：

1. 进入 Cloudflare Dashboard → "Workers & Pages"
2. 选择您的 Pages 项目
3. 查看 "Deployments" 页面
4. 等待部署完成（通常需要 2-3 分钟）

### 5.2 查看部署状态

部署成功后，您会看到：
- ✅ Build completed
- ✅ Preview URL（用于测试）
- ✅ Production URL（正式访问地址）

### 5.3 测试部署

访问 Production URL，测试以下功能：

1. ✅ 访问首页，应显示登录和注册按钮
2. ✅ 注册功能：填写邮箱、用户名、密码，注册成功
3. ✅ 登录功能：使用注册的账号登录
4. ✅ 登录后首页显示用户信息
5. ✅ 登出功能：点击登出按钮，清除登录状态

---

## 🛠️ 本地开发（可选）

### 6.1 安装 wrangler CLI

```bash
# 使用 npm 安装
npm install -g wrangler

# 或使用 pnpm 安装
pnpm add -g wrangler
```

### 6.2 登录 Cloudflare

```bash
wrangler login
```

### 6.3 本地运行（使用 D1 数据库）

```bash
# 在项目目录执行
wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat_v2
```

⚠️ **注意**：本地开发需要先构建项目：
```bash
bash scripts/cf-build.sh
```

---

## 🐛 常见问题解决方案

### 问题 1：wrangler deploy 报错 "Error: No such binding: DB"

**原因**：wrangler.toml 中未正确配置 D1 绑定，或数据库 ID 错误。

**解决方案**：
1. 检查 wrangler.toml 中的 `database_id` 是否正确
2. 确认 Cloudflare Dashboard 中已创建 D1 数据库
3. 在 Pages 项目设置中添加 D1 binding

### 问题 2：页面 404 错误

**原因**：构建输出目录配置错误。

**解决方案**：
1. 确认 Build output directory 设置为 `.vercel/output/static`
2. 检查构建日志，确认 `@cloudflare/next-on-pages` 执行成功
3. 确认 `scripts/cf-build.sh` 脚本正确执行

### 问题 3：自定义 server 冲突

**原因**：Cloudflare Pages 不支持自定义 Node.js server。

**解决方案**：
1. 移除 `src/server.ts` 文件（如果存在）
2. 确保所有 API Routes 都使用 Edge Runtime (`export const runtime = 'edge'`)
3. 不要使用 Node.js 特有的 API（如 fs、path 等）

### 问题 4：环境变量未生效

**原因**：环境变量配置错误或未正确绑定。

**解决方案**：
1. 在 Cloudflare Dashboard → Pages → Settings → Environment variables 中配置
2. 确认变量名称正确（JWT_SECRET、DB）
3. 确保 D1 binding 的 Variable name 为 `DB`

### 问题 5：JWT 验证失败

**原因**：JWT_SECRET 配置错误或不一致。

**解决方案**：
1. 确认 JWT_SECRET 已在环境变量中设置
2. 确保 JWT_SECRET 值一致（生产环境和预览环境使用相同值）
3. 检查 JWT Token 是否过期（默认有效期 7 天）

### 问题 6：D1 数据库查询失败

**原因**：数据库表未创建或 SQL 语法错误。

**解决方案**：
1. 在 D1 Console 中执行 `database/schema.sql` 创建表
2. 检查 SQL 语法是否符合 D1 规范（D1 基于 SQLite）
3. 使用 D1 Console 测试查询语句

---

## 🔐 安全建议

### 1. JWT_SECRET 安全

- 使用强随机密钥（至少 32 字符）
- 不要在代码中硬编码
- 定期更换密钥（需要用户重新登录）

### 2. Cookie 安全

- 使用 HttpOnly 防止 XSS 攻击
- 使用 Secure 确保仅 HTTPS 传输
- 使用 SameSite=Strict 防止 CSRF 攻击

### 3. 密码安全

- 使用 PBKDF2 加密（100000 次迭代）
- 密码长度至少 6 字符（建议 8+）
- 使用随机盐值

### 4. 环境变量安全

- 不要将 `.env.local` 提交到 Git
- 在 Cloudflare Dashboard 中配置生产环境变量
- 使用 Cloudflare API Token 时设置最小权限

---

## 📊 监控和日志

### 查看 Pages 部署日志

1. Cloudflare Dashboard → Pages → Deployments
2. 点击具体部署 → "Logs"

### 查看 D1 数据库日志

1. Cloudflare Dashboard → D1 → auth-database
2. 点击 "Logs" 查看查询日志

### 查看 Functions 日志

1. Cloudflare Dashboard → Pages → Functions
2. 点击 "Logs" 查看 API Routes 执行日志

---

## 🎉 部署成功！

恭喜！您已成功部署 Next.js 16 + Cloudflare Pages + D1 注册登录系统。

**下一步建议**：
- 添加邮箱验证功能
- 实现密码重置功能
- 添加用户资料编辑功能
- 实现权限管理和角色系统
- 添加 OAuth 第三方登录

---

## 📚 参考文档

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 官方文档](https://developers.cloudflare.com/d1/)
- [@cloudflare/next-on-pages 文档](https://github.com/cloudflare/next-on-pages)
- [Next.js 16 官方文档](https://nextjs.org/docs)
- [JWT 最佳实践](https://jwt.io/introduction)