// Cloudflare Pages Functions 配置
// 用于将 D1 数据库和 JWT_SECRET 绑定到 API Routes

// 这个文件会被 @cloudflare/next-on-pages 自动处理
// 确保 API Routes 能够访问到 Cloudflare 环境变量

export interface CloudflareEnv {
  DB: import('@/lib/auth/types').D1Database;
  JWT_SECRET: string;
}

// 在生产环境中，Cloudflare 会自动注入这些环境变量
// 在开发环境中，需要通过 wrangler pages dev 命令启动