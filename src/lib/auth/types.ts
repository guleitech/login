// 认证相关类型定义

export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string; // 密码哈希值
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password_hash'>;
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  [key: string]: unknown; // 添加索引签名以兼容 jose 的 JWTPayload
}

// Cloudflare D1 数据库类型
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(colName?: string): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  error?: string;
  meta?: {
    changes?: number;
    duration?: number;
    last_row_id?: number;
    rows_read?: number;
    rows_written?: number;
    size_after?: number;
  };
}

// Cloudflare 环境变量类型
export interface CloudflareEnv {
  DB: D1Database;
  JWT_SECRET: string;
}