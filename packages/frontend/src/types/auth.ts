/**
 * 认证相关类型定义
 */

export interface User {
    uuid: string;
    email: string;
    name: string;
}

export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
}

export interface RequestResetRequest {
    email: string;
}

export interface RequestResetResponse {
    success: boolean;
    message: string;
}

export interface ResetPasswordRequest {
    email: string;
    resetToken: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

