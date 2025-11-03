/**
 * 基础常量配置
 */

// JWT 配置
export const JWT_SECRET = process.env.JWT_SECRET || 'GT-DEV-SECRET-KEY-2025';
export const JWT_EXPIRES_IN = '7d';

// 数据库配置
export const DB_PATH = process.env.DB_PATH || './data/gamedb';

// 服务器配置
export const PORT = process.env.PORT || 3000;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
