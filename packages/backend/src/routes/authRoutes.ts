/**
 * 认证路由
 */

import { Router } from 'express';
import {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword,
} from '@/services/authService';

const router = Router();

/**
 * 注册接口
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // 验证必填字段
        if (!email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: '邮箱、用户名和密码为必填项',
            });
        }

        const result = await registerUser(email, name, password);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(201).json(result);
    } catch (error) {
        console.error('注册接口错误:', error);
        return res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试',
        });
    }
});

/**
 * 登录接口
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 验证必填字段
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '邮箱和密码为必填项',
            });
        }

        const result = await loginUser(email, password);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('登录接口错误:', error);
        return res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试',
        });
    }
});

/**
 * 请求重置密码接口
 * POST /api/auth/request-reset
 */
router.post('/request-reset', async (req, res) => {
    try {
        const { email } = req.body;

        // 验证必填字段
        if (!email) {
            return res.status(400).json({
                success: false,
                message: '邮箱为必填项',
            });
        }

        const result = await requestPasswordReset(email);

        return res.status(200).json(result);
    } catch (error) {
        console.error('请求重置密码接口错误:', error);
        return res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试',
        });
    }
});

/**
 * 重置密码接口
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        // 验证必填字段
        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '邮箱、重置令牌和新密码为必填项',
            });
        }

        const result = await resetPassword(email, resetToken, newPassword);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('重置密码接口错误:', error);
        return res.status(500).json({
            success: false,
            message: '服务器错误，请稍后重试',
        });
    }
});

export default router;

