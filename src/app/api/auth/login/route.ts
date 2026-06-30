// 登录 API 路由 - Cloudflare Pages Edge Runtime

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { verifyPassword } from '@/lib/auth/password';
import { createJWT, createCookieHeader } from '@/lib/auth/jwt';
import { getUserByEmail } from '@/lib/auth/db';
import type { LoginRequest, AuthResponse } from '@/lib/auth/types';

export const runtime = 'edge';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
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

    // 解析请求体
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: '请填写邮箱和密码'
        },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await getUserByEmail(db, email);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: '邮箱或密码错误'
        },
        { status: 401 }
      );
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: '邮箱或密码错误'
        },
        { status: 401 }
      );
    }

    // 创建 JWT Token
    const token = await createJWT(
      {
        userId: user.id,
        email: user.email,
        username: user.username
      },
      jwtSecret
    );

    // 返回成功响应，设置 Cookie
    return NextResponse.json(
      {
        success: true,
        message: '登录成功',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': createCookieHeader(token)
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '服务器错误'
      },
      { status: 500 }
    );
  }
}