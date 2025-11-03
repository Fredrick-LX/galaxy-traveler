/**
 * JWT 工具
 */

import * as jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/constants';

export interface JwtPayload {
    userId: string;
    email: string;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JwtPayload | null {
    try {
        // 检查token是否为空或格式明显错误
        if (!token || token.trim() === '' || token === 'undefined' || token === 'null') {
            return null;
        }
        
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        // 只在非jwt格式错误时打印日志
        if (error instanceof Error && !error.message.includes('jwt malformed')) {
            console.error('Token 验证失败:', error);
        }
        return null;
    }
}

/**
 * 解码 JWT Token（不验证）
 */
export function decodeToken(token: string): JwtPayload | null {
    try {
        const decoded = jwt.decode(token) as JwtPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}
