import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),  // Uncomment and add 'import path from "path"' if needed
  
  // Cloudflare Pages 配置 - 使用 @cloudflare/next-on-pages 适配器
  // 不使用静态导出，保留 API Routes 支持
  
  // 允许的开发源
  allowedDevOrigins: ['*.dev.coze.site'],
  
  // 图片配置
  images: {
    unoptimized: true, // Cloudflare Pages 需要禁用图片优化
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;