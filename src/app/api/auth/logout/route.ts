// 登出 API 路由 - Edge Runtime

import { NextRequest, NextResponse } from 'next/server';
import { createClearCookieHeader } from '@/lib/auth/jwt';
import type { AuthResponse } from '@/lib/auth/types';

export const runtime = 'edge';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    // 清除 Cookie
    return NextResponse.json(
      {
        success: true,
        message: '登出成功'
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': createClearCookieHeader()
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '服务器错误'
      },
      { status: 500 }
    );
  }
}