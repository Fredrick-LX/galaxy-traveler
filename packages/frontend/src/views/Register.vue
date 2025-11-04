<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { register } from "../api/auth";
import type { RegisterRequest } from "../types/auth";

const router = useRouter();

// 表单数据
const formData = ref<RegisterRequest>({
    email: "",
    name: "",
    password: "",
});

const confirmPassword = ref("");

// UI 状态
const loading = ref(false);
const errorMessage = ref("");

/**
 * 处理注册
 */
async function handleRegister() {
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

    if (!formData.value.name.trim()) {
        errorMessage.value = "请输入用户名";
        return;
    }

    if (formData.value.name.length < 2 || formData.value.name.length > 20) {
        errorMessage.value = "用户名长度必须在 2-20 个字符之间";
        return;
    }

    if (!formData.value.password) {
        errorMessage.value = "请输入密码";
        return;
    }

    if (formData.value.password.length < 6) {
        errorMessage.value = "密码长度至少为 6 个字符";
        return;
    }

    if (formData.value.password !== confirmPassword.value) {
        errorMessage.value = "两次输入的密码不一致";
        return;
    }

    loading.value = true;

    try {
        const result = await register(formData.value);

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
        errorMessage.value = "注册失败，请稍后重试";
    } finally {
        loading.value = false;
    }
}

/**
 * 跳转到登录页面
 */
function goToLogin() {
    router.push("/login");
}
</script>

<template>
    <div class="register-container">
        <div class="register-card">
            <div class="register-header">
                <h1 class="register-title">加入星际旅行</h1>
                <p class="register-subtitle">开启你的冒险之旅</p>
            </div>

            <form @submit.prevent="handleRegister" class="register-form">
                <div class="form-group">
                    <label for="email" class="form-label">邮箱</label>
                    <input
                        id="email"
                        v-model="formData.email"
                        type="email"
                        class="form-input"
                        placeholder="请输入邮箱"
                        :disabled="loading"
                        autocomplete="email"
                    />
                </div>

                <div class="form-group">
                    <label for="name" class="form-label">用户名</label>
                    <input
                        id="name"
                        v-model="formData.name"
                        type="text"
                        class="form-input"
                        placeholder="2-20 个字符"
                        :disabled="loading"
                        autocomplete="username"
                    />
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">密码</label>
                    <input
                        id="password"
                        v-model="formData.password"
                        type="password"
                        class="form-input"
                        placeholder="至少 6 个字符"
                        :disabled="loading"
                        autocomplete="new-password"
                    />
                </div>

                <div class="form-group">
                    <label for="confirmPassword" class="form-label"
                        >确认密码</label
                    >
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        class="form-input"
                        placeholder="再次输入密码"
                        :disabled="loading"
                        autocomplete="new-password"
                    />
                </div>

                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <button type="submit" class="submit-button" :disabled="loading">
                    {{ loading ? "注册中..." : "注册" }}
                </button>
            </form>

            <div class="register-footer">
                <span class="footer-text">已有账号？</span>
                <button type="button" class="link-button" @click="goToLogin">
                    立即登录
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eeeeee;
    padding: 20px;
}

.register-card {
    background: #ffffff;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
    padding: 40px;
    width: 100%;
    max-width: 420px;
}

.register-header {
    text-align: center;
    margin-bottom: 32px;
    border-bottom: 2px solid #000000;
    padding-bottom: 16px;
}

.register-title {
    font-size: 24px;
    font-weight: 700;
    color: #000000;
    margin: 0 0 8px 0;
    letter-spacing: 2px;
}

.register-subtitle {
    font-size: 13px;
    color: #666666;
    margin: 0;
}

.register-form {
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

.register-footer {
    text-align: center;
    padding-top: 24px;
    border-top: 2px solid #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.footer-text {
    font-size: 12px;
    color: #666666;
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
</style>
