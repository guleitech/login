# Cloudflare Pages 部署问题修复指南

## 🔧 问题诊断

如果您在 Cloudflare Pages 部署成功但网站打不开，通常有以下原因：

### 1. 构建配置错误

**问题**：输出目录配置不正确。

**解决方案**：
- 在 Cloudflare Pages 项目设置中，将 **Build output directory** 改为 `.worker-next`
- 不要使用 `.vercel/output/static` 或其他目录

### 2. 环境变量未配置

**问题**：JWT_SECRET 环境变量未设置，导致 API Routes 无法运行。

**解决方案**：
1. 登录 Cloudflare Dashboard
2. 进入 Pages → 您的项目 → Settings → Environment variables
3. 添加以下变量：
   - **Variable name**: `JWT_SECRET`
   - **Value**: 使用强随机密钥（至少32字符）

   生成密钥方法：
   ```bash
   openssl rand -base64 32
   ```

### 3. D1 数据库未绑定

**问题**：数据库绑定缺失，导致无法查询用户数据。

**解决方案**：
1. 登录 Cloudflare Dashboard
2. 进入 Pages → 您的项目 → Settings → Functions
3. 找到 "D1 database bindings"
4. 添加绑定：
   - **Variable name**: `DB`
   - **D1 database**: 选择您的数据库（如果没有，需要先创建）

### 4. 数据库表未创建

**问题**：D1 数据库中没有 users 表。

**解决方案**：
1. 进入 Cloudflare Dashboard → D1 → 您的数据库
2. 点击 "Console"
3. 执行以下 SQL：

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

### 5. 构建命令错误

**问题**：使用默认的 Next.js 构建命令，而不是 Cloudflare 专用命令。

**解决方案**：
- 在 Cloudflare Pages 项目设置中，将 **Build command** 改为：
  ```
  bash scripts/cf-build.sh
  ```
- 不要使用 `npm run build` 或 `next build`

---

## 🚀 快速修复步骤

### 步骤 1：更新构建配置

在 Cloudflare Dashboard → Pages → 您的项目 → Settings：

- **Build command**: `bash scripts/cf-build.sh`
- **Build output directory**: `.worker-next`

### 步骤 2：配置环境变量

在 Settings → Environment variables：

- 添加 `JWT_SECRET`（强随机密钥，32+字符）

### 步骤 3：绑定 D1 数据库

在 Settings → Functions → D1 database bindings：

- 添加绑定：Variable name = `DB`，选择您的数据库

### 步骤 4：初始化数据库

在 D1 → Console 执行 `database/schema.sql`

### 步骤 5：重新部署

修改配置后，触发重新部署：
- 在 Pages → Deployments 点击 "Retry deployment"
- 或推送新的代码到 GitHub

---

## ✅ 验证部署成功

部署成功后，测试以下功能：

1. 访问首页 `/`，应显示登录和注册按钮
2. 访问 `/register`，应显示注册表单
3. 访问 `/login`，应显示登录表单
4. 注册用户，检查是否成功
5. 登录用户，检查是否跳转到首页并显示用户信息
6. 登出用户，检查是否清除登录状态

---

## 🐛 其他常见问题

### 问题：API Routes 返回 500 错误

**原因**：环境变量或数据库绑定缺失。

**检查步骤**：
1. 确认 `JWT_SECRET` 已配置
2. 确认 D1 binding 变量名正确为 `DB`
3. 确认数据库中已创建 users 表

### 问题：页面显示空白或 404

**原因**：构建输出目录错误。

**检查步骤**：
1. 确认输出目录为 `.worker-next`
2. 查看构建日志，确认 `@cloudflare/next-on-pages` 执行成功
3. 检查构建日志中是否有错误信息

### 问题：注册/登录失败

**原因**：数据库表未创建或字段错误。

**检查步骤**：
1. 在 D1 Console 执行 `SELECT * FROM users` 查看表是否存在
2. 检查表结构是否符合 `schema.sql` 定义
3. 确认所有字段都存在（email, username, password_hash, created_at, updated_at）

---

## 💡 推荐配置清单

✅ Build command: `bash scripts/cf-build.sh`
✅ Build output directory: `.worker-next`
✅ Environment variable: `JWT_SECRET`（强随机密钥）
✅ D1 binding: Variable name = `DB`
✅ Database: 已创建 users 表并执行 schema.sql

完成以上配置后，您的网站应该可以正常运行！