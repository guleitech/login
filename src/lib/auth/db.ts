// 数据库操作工具 - Cloudflare D1

import type { User, D1Database } from './types';

/**
 * 创建新用户
 */
export async function createUser(
  db: D1Database,
  email: string,
  username: string,
  passwordHash: string
): Promise<User | null> {
  try {
    const result = await db
      .prepare(
        'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?) RETURNING *'
      )
      .bind(email, username, passwordHash)
      .first<User>();

    return result;
  } catch (error) {
    console.error('Create user failed:', error);
    return null;
  }
}

/**
 * 根据邮箱查找用户
 */
export async function getUserByEmail(
  db: D1Database,
  email: string
): Promise<User | null> {
  try {
    const user = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>();

    return user;
  } catch (error) {
    console.error('Get user by email failed:', error);
    return null;
  }
}

/**
 * 根据用户名查找用户
 */
export async function getUserByUsername(
  db: D1Database,
  username: string
): Promise<User | null> {
  try {
    const user = await db
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first<User>();

    return user;
  } catch (error) {
    console.error('Get user by username failed:', error);
    return null;
  }
}

/**
 * 根据 ID 查找用户
 */
export async function getUserById(
  db: D1Database,
  id: number
): Promise<User | null> {
  try {
    const user = await db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User>();

    return user;
  } catch (error) {
    console.error('Get user by id failed:', error);
    return null;
  }
}

/**
 * 检查邮箱是否已存在
 */
export async function isEmailExists(db: D1Database, email: string): Promise<boolean> {
  const user = await getUserByEmail(db, email);
  return user !== null;
}

/**
 * 检查用户名是否已存在
 */
export async function isUsernameExists(db: D1Database, username: string): Promise<boolean> {
  const user = await getUserByUsername(db, username);
  return user !== null;
}