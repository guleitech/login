// 注册 API 路由 - Cloudflare Pages Edge Runtime

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { hashPassword, generateSalt } from '@/lib/auth/password';
import { createJWT, createCookieHeader } from '@/lib/auth/jwt';
import {
  createUser,
  isEmailExists,
  isUsernameExists
} from '@/lib/auth/db';
import type { RegisterRequest, AuthResponse } from '@/lib/auth/types';

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
    const body: RegisterRequest = await request.json();
    const { email, username, password } = body;

    // 验证输入
    if (!email || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: '请填写所有必填字段'
        },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: '邮箱格式不正确'
        },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        {
          success: false,
          message: '用户名长度必须在 3-20 个字符之间'
        },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: '密码长度至少 6 个字符'
        },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    if (await isEmailExists(db, email)) {
      return NextResponse.json(
        {
          success: false,
          message: '邮箱已被注册'
        },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    if (await isUsernameExists(db, username)) {
      return NextResponse.json(
        {
          success: false,
          message: '用户名已被使用'
        },
        { status: 400 }
      );
    }

    // 加密密码
    const salt = await generateSalt();
    const passwordHash = await hashPassword(password, salt);

    // 创建用户
    const user = await createUser(db, email, username, passwordHash);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: '注册失败'
        },
        { status: 500 }
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
        message: '注册成功',
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
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '服务器错误'
      },
      { status: 500 }
    );
  }
}