// 密码加密工具 - 使用 Web Crypto API (Edge Runtime 兼容)

/**
 * 使用 PBKDF2 算法加密密码
 * PBKDF2 是一种安全的密码加密方法，适用于 Edge Runtime
 */

const ITERATIONS = 100000; // PBKDF2 迭代次数
const KEY_LENGTH = 64; // 密钥长度
const SALT_LENGTH = 16; // 盐值长度

/**
 * 生成随机盐值
 */
export async function generateSalt(): Promise<string> {
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  return Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 使用 PBKDF2 加密密码
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  // 导入密码作为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // 使用 PBKDF2 派生密钥
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-512'
    },
    keyMaterial,
    KEY_LENGTH * 8 // 转换为比特
  );

  // 转换为十六进制字符串
  const hashArray = new Uint8Array(derivedBits);
  const hashHex = Array.from(hashArray, (byte) => byte.toString(16).padStart(2, '0')).join('');

  // 返回格式: salt:hash
  return `${salt}:${hashHex}`;
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  storedPasswordHash: string
): Promise<boolean> {
  const [salt, storedHash] = storedPasswordHash.split(':');
  
  if (!salt || !storedHash) {
    return false;
  }

  // 使用相同的盐值加密输入的密码
  const computedHash = await hashPassword(password, salt);
  const [, computedHashPart] = computedHash.split(':');

  // 比较加密后的密码与存储的密码
  return computedHashPart === storedHash;
}