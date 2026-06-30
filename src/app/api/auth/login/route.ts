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
    // Cloudflare Pages 标准获取 env
    const ctx = getRequestContext();
    const env = ctx.env;

    // 分层精准校验，不再笼统提示
    if (!env) {
      return NextResponse.json(
        {
          success: false,
          message: '错误：未读取到运行环境env'
        },
        { status: 500 }
      );
    }
    if (!env.DB) {
      return NextResponse.json(
        {
          success: false,
          message: '错误：当前环境缺少D1数据库绑定 DB'
        },
        { status: 500 }
      );
    }
    if (!env.JWT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: '错误：当前环境缺少环境变量 JWT_SECRET'
        },
        { status: 500 }
      );
    }

    const db = env.DB;
    const jwtSecret = env.JWT_SECRET;

    // 解析请求体
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // 基础输入校验
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: '请填写邮箱和密码'
        },
        { status: 400 }
      );
    }

    // 查询用户
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

    // 校验密码
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

    // 签发JWT
    const token = await createJWT(
      {
        userId: user.id,
        email: user.email,
        username: user.username
      },
      jwtSecret
    );

    // 登录成功，返回用户+Cookie
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
