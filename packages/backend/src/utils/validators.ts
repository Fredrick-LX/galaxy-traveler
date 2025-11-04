/**
 * 验证工具函数
 */

/**
 * 邮箱正则表达式
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

/**
 * 验证用户名长度
 */
export function isValidUsername(name: string, minLength = 2, maxLength = 20): boolean {
    return name.length >= minLength && name.length <= maxLength;
}

/**
 * 验证密码强度
 */
export function isValidPassword(password: string, minLength = 6): boolean {
    return password.length >= minLength;
}

/**
 * 验证必填字段
 */
export function validateRequiredFields(
    fields: Record<string, any>,
    requiredFields: string[]
): { valid: boolean; missing: string[] } {
    const missing = requiredFields.filter(field => !fields[field]);
    return {
        valid: missing.length === 0,
        missing
    };
}

