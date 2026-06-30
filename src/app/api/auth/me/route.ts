// 获取当前用户信息 API 路由 - Cloudflare Pages Edge Runtime

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { verifyJWT, extractTokenFromCookie } from '@/lib/auth/jwt';
import { getUserById } from '@/lib/auth/db';
import type { AuthResponse } from '@/lib/auth/types';

export const runtime = 'edge';

export async function GET(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    // 从 Cloudflare Pages getRequestContext 获取环境变量
    const { env } = getRequestContext() as unknown as { env: import('@/lib/auth/types').CloudflareEnv };
    
    if (!env || !env.DB || !env.JWT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: '环境变量未配置'
        },
        { status: 500 }
      );
    }

    const db = env.DB;
    const jwtSecret = env.JWT_SECRET;

    // 从 Cookie 中提取 JWT Token
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: '未登录'
        },
        { status: 401 }
      );
    }

    // 验证 JWT Token
    const payload = await verifyJWT(token, jwtSecret);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: '登录已过期，请重新登录'
        },
        { status: 401 }
      );
    }

    // 获取用户信息
    const user = await getUserById(db, payload.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: '用户不存在'
        },
        { status: 404 }
      );
    }

    // 返回用户信息
    return NextResponse.json(
      {
        success: true,
        message: '获取用户信息成功',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '服务器错误'
      },
      { status: 500 }
    );
  }
}