/**
 * 路由辅助函数
 */

import type { Request, Response } from 'express';

/**
 * 异步路由处理器包装函数
 * 自动捕获异步函数中的错误并返回 500 响应
 */
export function asyncHandler(
    fn: (req: Request, res: Response) => Promise<any>
) {
    return async (req: Request, res: Response) => {
        try {
            await fn(req, res);
        } catch (error) {
            console.error('路由处理错误:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: '服务器错误，请稍后重试',
                });
            }
        }
    };
}

/**
 * 验证必填字段中间件生成器
 */
export function validateFields(fields: string[]) {
    return (req: Request, res: Response, next: Function) => {
        const missing = fields.filter(field => !req.body[field]);

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `缺少必填字段: ${missing.join(', ')}`,
            });
        }

        next();
    };
}

/**
 * 创建标准响应对象
 */
export function createResponse(success: boolean, data?: any, message?: string) {
    const response: any = { success };

    if (data !== undefined) {
        response.data = data;
    }

    if (message) {
        response.message = message;
    }

    if (!success && !message && !data) {
        response.error = '操作失败';
    }

    return response;
}

/**
 * 发送成功响应
 */
export function sendSuccess(res: Response, data?: any, message?: string) {
    return res.json(createResponse(true, data, message));
}

/**
 * 发送错误响应
 */
export function sendError(res: Response, message: string, statusCode = 400) {
    return res.status(statusCode).json(createResponse(false, undefined, message));
}

