// JWT 工具 - 使用 jose 包 (Edge Runtime 兼容)

import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from './types';

const JWT_EXPIRATION = '7d'; // JWT 有效期 7 天
const JWT_ISSUER = 'cloudflare-auth-system'; // JWT 发行者

/**
 * 创建 JWT Token
 */
export async function createJWT(
  payload: JWTPayload,
  secret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secretKey);

  return token;
}

/**
 * 验证 JWT Token
 */
export async function verifyJWT(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey, {
      issuer: JWT_ISSUER,
    });

    // 将 payload 转换为 JWTPayload 类型
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      username: payload.username as string,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * 从请求中提取 JWT Token
 */
export function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const authCookie = cookies.find(c => c.startsWith('auth_token='));

  if (!authCookie) {
    return null;
  }

  return authCookie.substring('auth_token='.length);
}

/**
 * 创建 Cookie 设置头
 */
export function createCookieHeader(token: string): string {
  return `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`;
}

/**
 * 创建 Cookie 清除头
 */
export function createClearCookieHeader(): string {
  return 'auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}