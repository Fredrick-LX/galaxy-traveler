/**
 * 加密工具函数
 */

import { createHash } from 'crypto';

/**
 * MD5 加密
 */
export function hashPassword(password: string): string {
    return createHash('md5').update(password).digest('hex');
}

/**
 * 生成重置令牌（6位数字）
 */
export function generateResetToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

