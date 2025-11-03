/**
 * 认证 API 服务
 */

import axios from 'axios';
import type {
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    RequestResetRequest,
    RequestResetResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
} from '../types/auth';

// 配置 axios 实例
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token 过期或无效
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * 用户注册
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
        const response = await apiClient.post<RegisterResponse>('/auth/register', data);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || '注册失败，请稍后重试',
        };
    }
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
    try {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || '登录失败，请稍后重试',
        };
    }
}

/**
 * 请求重置密码
 */
export async function requestPasswordReset(data: RequestResetRequest): Promise<RequestResetResponse> {
    try {
        const response = await apiClient.post<RequestResetResponse>('/auth/request-reset', data);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || '请求失败，请稍后重试',
        };
    }
}

/**
 * 重置密码
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
        const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || '重置失败，请稍后重试',
        };
    }
}

export { apiClient };

