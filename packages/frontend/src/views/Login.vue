<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../api/auth";
import type { LoginRequest } from "../types/auth";

const router = useRouter();

// 表单数据
const formData = ref<LoginRequest>({
    email: "",
    password: "",
});

// UI 状态
const loading = ref(false);
const errorMessage = ref("");

/**
 * 处理登录
 */
async function handleLogin() {
    // 清空错误信息
    errorMessage.value = "";

    // 验证输入
    if (!formData.value.email.trim()) {
        errorMessage.value = "请输入邮箱";
        return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.value.email)) {
        errorMessage.value = "邮箱格式不正确";
        return;
    }

    if (!formData.value.password) {
        errorMessage.value = "请输入密码";
        return;
    }

    loading.value = true;

    try {
        const result = await login(formData.value);

        if (result.success && result.token && result.user) {
            // 保存 token 和用户信息
            localStorage.setItem("auth_token", result.token);
            localStorage.setItem("user_info", JSON.stringify(result.user));

            // 跳转到主页
            router.push("/");
        } else {
            errorMessage.value = result.message;
        }
    } catch (error) {
        errorMessage.value = "登录失败，请稍后重试";
    } finally {
        loading.value = false;
    }
}

/**
 * 跳转到注册页面
 */
function goToRegister() {
    router.push("/register");
}

/**
 * 跳转到找回密码页面
 */
function goToForgotPassword() {
    router.push("/forgot-password");
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h1 class="login-title">星河旅者</h1>
                <p class="login-subtitle">欢迎回来，探索者</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label for="email" class="form-label">邮箱</label>
                    <input
                        id="email"
                        v-model="formData.email"
                        type="text"
                        class="form-input"
                        placeholder="请输入邮箱"
                        :disabled="loading"
                        autocomplete="email"
                    />
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">密码</label>
                    <input
                        id="password"
                        v-model="formData.password"
                        type="password"
                        class="form-input"
                        placeholder="请输入密码"
                        :disabled="loading"
                        autocomplete="current-password"
                    />
                </div>

                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <button type="submit" class="submit-button" :disabled="loading">
                    {{ loading ? "登录中..." : "登录" }}
                </button>
            </form>

            <div class="login-footer">
                <button
                    type="button"
                    class="link-button"
                    @click="goToForgotPassword"
                >
                    忘记密码？
                </button>
                <span class="divider">|</span>
                <button type="button" class="link-button" @click="goToRegister">
                    注册新账号
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eeeeee;
    padding: 20px;
}

.login-card {
    background: #ffffff;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
    padding: 40px;
    width: 100%;
    max-width: 420px;
}

.login-header {
    text-align: center;
    margin-bottom: 32px;
    border-bottom: 2px solid #000000;
    padding-bottom: 16px;
}

.login-title {
    font-size: 24px;
    font-weight: 700;
    color: #000000;
    margin: 0 0 8px 0;
    letter-spacing: 2px;
}

.login-subtitle {
    font-size: 13px;
    color: #666666;
    margin: 0;
}

.login-form {
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
    font-family: "Courier New", Courier, monospace;
    border: 2px solid #333333;
    border-radius: 0;
    background: #ffffff;
    color: #000000;
    transition: all 0.1s;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #000000;
    box-shadow: 0 0 0 2px #cccccc;
}

.form-input:disabled {
    background-color: #f5f5f5;
    color: #999999;
    cursor: not-allowed;
}

.error-message {
    background-color: #eeeeee;
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
    font-family: "Courier New", Courier, monospace;
    color: #ffffff;
    background: #000000;
    border: 2px solid #000000;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.1s;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.submit-button:hover:not(:disabled) {
    background: #ffffff;
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
    color: #cccccc;
    cursor: not-allowed;
}

.login-footer {
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
    font-family: "Courier New", Courier, monospace;
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
