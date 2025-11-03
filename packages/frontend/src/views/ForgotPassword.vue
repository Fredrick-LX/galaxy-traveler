<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { requestPasswordReset, resetPassword } from '../api/auth';

const router = useRouter();

// 步骤：1 = 请求重置码，2 = 输入重置码和新密码
const step = ref(1);

// 表单数据
const email = ref('');
const resetToken = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// UI 状态
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

/**
 * 请求重置密码
 */
async function handleRequestReset() {
    // 清空消息
    errorMessage.value = '';
    successMessage.value = '';

    // 验证输入
    if (!email.value.trim()) {
        errorMessage.value = '请输入邮箱';
        return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        errorMessage.value = '邮箱格式不正确';
        return;
    }

    loading.value = true;

    try {
        const result = await requestPasswordReset({ email: email.value });

        if (result.success) {
            successMessage.value = result.message;
            // 切换到下一步
            step.value = 2;
        } else {
            errorMessage.value = result.message;
        }
    } catch (error) {
        errorMessage.value = '请求失败，请稍后重试';
    } finally {
        loading.value = false;
    }
}

/**
 * 重置密码
 */
async function handleResetPassword() {
    // 清空消息
    errorMessage.value = '';
    successMessage.value = '';

    // 验证输入
    if (!resetToken.value.trim()) {
        errorMessage.value = '请输入重置码';
        return;
    }

    if (!newPassword.value) {
        errorMessage.value = '请输入新密码';
        return;
    }

    if (newPassword.value.length < 6) {
        errorMessage.value = '密码长度至少为 6 个字符';
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = '两次输入的密码不一致';
        return;
    }

    loading.value = true;

    try {
        const result = await resetPassword({
            email: email.value,
            resetToken: resetToken.value,
            newPassword: newPassword.value,
        });

        if (result.success) {
            successMessage.value = result.message + '，即将跳转到登录页面...';
            
            // 3秒后跳转到登录页面
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            errorMessage.value = result.message;
        }
    } catch (error) {
        errorMessage.value = '重置失败，请稍后重试';
    } finally {
        loading.value = false;
    }
}

/**
 * 返回上一步
 */
function goBack() {
    if (step.value === 2) {
        step.value = 1;
        resetToken.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        errorMessage.value = '';
        successMessage.value = '';
    } else {
        router.push('/login');
    }
}

/**
 * 跳转到登录页面
 */
function goToLogin() {
    router.push('/login');
}
</script>

<template>
    <div class="forgot-password-container">
        <div class="forgot-password-card">
            <div class="forgot-password-header">
                <h1 class="forgot-password-title">找回密码</h1>
                <p class="forgot-password-subtitle">
                    {{ step === 1 ? '我们将发送重置码到您的邮箱' : '请输入重置码和新密码' }}
                </p>
            </div>

            <!-- 步骤 1: 请求重置码 -->
            <form v-if="step === 1" @submit.prevent="handleRequestReset" class="forgot-password-form">
                <div class="form-group">
                    <label for="email" class="form-label">邮箱</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        class="form-input"
                        placeholder="请输入注册时使用的邮箱"
                        :disabled="loading"
                        autocomplete="email"
                    />
                </div>

                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <div v-if="successMessage" class="success-message">
                    {{ successMessage }}
                </div>

                <button type="submit" class="submit-button" :disabled="loading">
                    {{ loading ? '发送中...' : '发送重置码' }}
                </button>
            </form>

            <!-- 步骤 2: 重置密码 -->
            <form v-if="step === 2" @submit.prevent="handleResetPassword" class="forgot-password-form">
                <div class="form-group">
                    <label for="resetToken" class="form-label">重置码</label>
                    <input
                        id="resetToken"
                        v-model="resetToken"
                        type="text"
                        class="form-input"
                        placeholder="请输入收到的 6 位重置码"
                        :disabled="loading"
                        maxlength="6"
                    />
                    <p class="form-hint">重置码已发送到 {{ email }}（开发模式下请查看后端控制台）</p>
                </div>

                <div class="form-group">
                    <label for="newPassword" class="form-label">新密码</label>
                    <input
                        id="newPassword"
                        v-model="newPassword"
                        type="password"
                        class="form-input"
                        placeholder="至少 6 个字符"
                        :disabled="loading"
                        autocomplete="new-password"
                    />
                </div>

                <div class="form-group">
                    <label for="confirmPassword" class="form-label">确认新密码</label>
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        class="form-input"
                        placeholder="再次输入新密码"
                        :disabled="loading"
                        autocomplete="new-password"
                    />
                </div>

                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <div v-if="successMessage" class="success-message">
                    {{ successMessage }}
                </div>

                <button type="submit" class="submit-button" :disabled="loading">
                    {{ loading ? '重置中...' : '重置密码' }}
                </button>
            </form>

            <div class="forgot-password-footer">
                <button type="button" class="link-button" @click="goBack">
                    {{ step === 1 ? '返回登录' : '返回上一步' }}
                </button>
                <span v-if="step === 1" class="divider">|</span>
                <button v-if="step === 1" type="button" class="link-button" @click="goToLogin">
                    记起密码了？
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.forgot-password-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EEEEEE;
    padding: 20px;
}

.forgot-password-card {
    background: #FFFFFF;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
    padding: 40px;
    width: 100%;
    max-width: 420px;
}

.forgot-password-header {
    text-align: center;
    margin-bottom: 32px;
    border-bottom: 2px solid #000000;
    padding-bottom: 16px;
}

.forgot-password-title {
    font-size: 24px;
    font-weight: 700;
    color: #000000;
    margin: 0 0 8px 0;
    letter-spacing: 2px;
}

.forgot-password-subtitle {
    font-size: 13px;
    color: #666666;
    margin: 0;
}

.forgot-password-form {
    margin-bottom: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.form-input {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-family: 'Courier New', Courier, monospace;
    border: 2px solid #333333;
    border-radius: 0;
    background: #FFFFFF;
    color: #000000;
    transition: all 0.1s;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px #CCCCCC;
}

.form-input:disabled {
    background-color: #F5F5F5;
    color: #999999;
    cursor: not-allowed;
}

.form-hint {
    margin-top: 8px;
    font-size: 11px;
    color: #666666;
    font-family: 'Courier New', Courier, monospace;
}

.error-message {
    background-color: #EEEEEE;
    color: #000000;
    border: 2px solid #000000;
    padding: 12px;
    border-radius: 0;
    font-size: 13px;
    margin-bottom: 16px;
}

.success-message {
    background-color: #FFFFFF;
    color: #000000;
    border: 2px solid #000000;
    padding: 12px;
    border-radius: 0;
    font-size: 13px;
    margin-bottom: 16px;
}

.submit-button {
    width: 100%;
    padding: 14px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Courier New', Courier, monospace;
    color: #FFFFFF;
    background: #000000;
    border: 2px solid #000000;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.1s;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.submit-button:hover:not(:disabled) {
    background: #FFFFFF;
    color: #000000;
    box-shadow: 4px 4px 0 #000000;
    transform: translate(-2px, -2px);
}

.submit-button:active:not(:disabled) {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0 #000000;
}

.submit-button:disabled {
    background: #666666;
    border-color: #666666;
    color: #CCCCCC;
    cursor: not-allowed;
}

.forgot-password-footer {
    text-align: center;
    padding-top: 24px;
    border-top: 2px solid #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.link-button {
    background: none;
    border: none;
    color: #000000;
    font-size: 12px;
    font-family: 'Courier New', Courier, monospace;
    cursor: pointer;
    transition: all 0.1s;
    padding: 0;
    text-decoration: underline;
}

.link-button:hover {
    color: #666666;
}

.divider {
    color: #000000;
    font-weight: 700;
}
</style>

