/**
 * 认证服务
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { getData, putData, updateData, DB_PREFIX } from '@/db/db';
import { generateToken, JwtPayload } from '@/utils/jwt';

/**
 * 用户数据结构
 */
export interface UserData {
    uuid: string;
    email: string;
    name: string;
    password: string; // MD5 加密后的密码
    createdAt: number;
    lastLogin: number;
    resetToken?: string; // 重置密码令牌
    resetTokenExpires?: number; // 重置密码令牌过期时间
}

/**
 * 注册结果
 */
export interface RegisterResult {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        uuid: string;
        email: string;
        name: string;
    };
}

/**
 * 登录结果
 */
export interface LoginResult {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        uuid: string;
        email: string;
        name: string;
    };
}

/**
 * 找回密码结果
 */
export interface ResetPasswordResult {
    success: boolean;
    message: string;
}

/**
 * 注册用户
 */
export async function registerUser(email: string, name: string, password: string): Promise<RegisterResult> {
    try {
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: '邮箱格式不正确' };
        }

        // 验证用户名长度
        if (name.length < 2 || name.length > 20) {
            return { success: false, message: '用户名长度必须在 2-20 个字符之间' };
        }

        // 验证密码强度
        if (password.length < 6) {
            return { success: false, message: '密码长度至少为 6 个字符' };
        }

        // 检查邮箱是否已存在
        const existingEmailUuid = await getData<string>(`${DB_PREFIX.USER_EMAIL}${email}`);
        if (existingEmailUuid) {
            return { success: false, message: '该邮箱已被注册' };
        }

        // 用户名允许重复，不再检查唯一性

        // 生成 UUID
        const uuid = uuidv4();

        // 加密密码
        const hashedPassword = createHash('md5').update(password).digest('hex');

        // 创建用户数据
        const userData: UserData = {
            uuid,
            email,
            name,
            password: hashedPassword,
            createdAt: Date.now(),
            lastLogin: Date.now(),
        };

        // 存储用户数据
        await putData(`${DB_PREFIX.USER_UUID}${uuid}`, userData);
        await putData(`${DB_PREFIX.USER_EMAIL}${email}`, uuid);
        // 用户名允许重复，不再创建用户名索引

        // 生成 JWT Token
        const tokenPayload: JwtPayload = {
            userId: uuid,
            email,
        };
        const token = generateToken(tokenPayload);

        return {
            success: true,
            message: '注册成功',
            token,
            user: {
                uuid,
                email,
                name,
            },
        };
    } catch (error) {
        console.error('注册用户失败:', error);
        return { success: false, message: '注册失败，请稍后重试' };
    }
}

/**
 * 用户登录（仅支持邮箱）
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
    try {
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: '邮箱格式不正确' };
        }

        // 通过邮箱查找用户
        const uuid = await getData<string>(`${DB_PREFIX.USER_EMAIL}${email}`);

        if (!uuid) {
            return { success: false, message: '该邮箱未注册' };
        }

        // 获取用户数据
        const userData = await getData<UserData>(`${DB_PREFIX.USER_UUID}${uuid}`);
        if (!userData) {
            return { success: false, message: '用户数据异常' };
        }

        // 验证密码
        const hashedPassword = createHash('md5').update(password).digest('hex');
        if (hashedPassword !== userData.password) {
            return { success: false, message: '密码错误' };
        }

        // 更新最后登录时间
        await updateData<UserData>(`${DB_PREFIX.USER_UUID}${uuid}`, {
            lastLogin: Date.now(),
        });

        // 生成 JWT Token
        const tokenPayload: JwtPayload = {
            userId: userData.uuid,
            email: userData.email,
        };
        const token = generateToken(tokenPayload);

        return {
            success: true,
            message: '登录成功',
            token,
            user: {
                uuid: userData.uuid,
                email: userData.email,
                name: userData.name,
            },
        };
    } catch (error) {
        console.error('登录失败:', error);
        return { success: false, message: '登录失败，请稍后重试' };
    }
}

/**
 * 请求重置密码（发送重置令牌）
 */
export async function requestPasswordReset(email: string): Promise<ResetPasswordResult> {
    try {
        // 查找用户
        const uuid = await getData<string>(`${DB_PREFIX.USER_EMAIL}${email}`);
        if (!uuid) {
            // 为了安全考虑，不透露用户是否存在
            return { success: true, message: '如果该邮箱已注册，重置链接已发送' };
        }

        // 获取用户数据
        const userData = await getData<UserData>(`${DB_PREFIX.USER_UUID}${uuid}`);
        if (!userData) {
            return { success: false, message: '用户数据异常' };
        }

        // 生成重置令牌（6位随机数字）
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 分钟有效期

        // 更新用户数据
        await updateData<UserData>(`${DB_PREFIX.USER_UUID}${uuid}`, {
            resetToken,
            resetTokenExpires,
        });

        // TODO: 实际项目中应该通过邮件发送重置令牌
        // 这里仅在控制台打印（开发测试用）
        console.log(`✉️ 重置密码令牌 [${email}]: ${resetToken}`);

        return {
            success: true,
            message: '如果该邮箱已注册，重置链接已发送',
        };
    } catch (error) {
        console.error('请求重置密码失败:', error);
        return { success: false, message: '请求失败，请稍后重试' };
    }
}

/**
 * 重置密码
 */
export async function resetPassword(
    email: string,
    resetToken: string,
    newPassword: string
): Promise<ResetPasswordResult> {
    try {
        // 验证密码强度
        if (newPassword.length < 6) {
            return { success: false, message: '密码长度至少为 6 个字符' };
        }

        // 查找用户
        const uuid = await getData<string>(`${DB_PREFIX.USER_EMAIL}${email}`);
        if (!uuid) {
            return { success: false, message: '用户不存在' };
        }

        // 获取用户数据
        const userData = await getData<UserData>(`${DB_PREFIX.USER_UUID}${uuid}`);
        if (!userData) {
            return { success: false, message: '用户数据异常' };
        }

        // 验证重置令牌
        if (!userData.resetToken || userData.resetToken !== resetToken) {
            return { success: false, message: '重置令牌无效' };
        }

        // 检查令牌是否过期
        if (!userData.resetTokenExpires || userData.resetTokenExpires < Date.now()) {
            return { success: false, message: '重置令牌已过期' };
        }

        // 加密新密码
        const hashedPassword = createHash('md5').update(newPassword).digest('hex');

        // 更新密码并清除重置令牌
        await updateData<UserData>(`${DB_PREFIX.USER_UUID}${uuid}`, {
            password: hashedPassword,
            resetToken: undefined,
            resetTokenExpires: undefined,
        });

        return {
            success: true,
            message: '密码重置成功',
        };
    } catch (error) {
        console.error('重置密码失败:', error);
        return { success: false, message: '重置失败，请稍后重试' };
    }
}

