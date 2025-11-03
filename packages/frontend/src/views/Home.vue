<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import type { User } from '../types/auth';

const router = useRouter();
const user = ref<User | null>(null);
const countdown = ref(3);
let countdownTimer: number | null = null;

onMounted(() => {
    // 从本地存储获取用户信息
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
        user.value = JSON.parse(userInfo);
        startCountdown();
    } else {
        // 如果没有用户信息，跳转到登录页
        router.push('/login');
    }
});

onUnmounted(() => {
    if (countdownTimer !== null) {
        clearInterval(countdownTimer);
    }
});

/**
 * 开始倒计时
 */
function startCountdown() {
    countdownTimer = window.setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            enterGame();
        }
    }, 1000);
}

/**
 * 进入游戏主界面
 */
function enterGame() {
    if (countdownTimer !== null) {
        clearInterval(countdownTimer);
    }
    router.push('/game');
}
</script>

<template>
    <div class="home-container">
        <div class="home-content">
            <div class="welcome-card">
                <h1 class="welcome-title">欢迎来到星河旅者</h1>
                <div v-if="user" class="user-info">
                    <p class="user-greeting">
                        你好，<span class="display-name">
                            <strong class="username">{{ user.name }}</strong>
                            <span class="uuid-suffix">#{{ user.uuid.substring(0, 8) }}</span>
                        </span>！
                    </p>
                    <p class="success-text">登录成功</p>
                </div>
                <div class="countdown-info">
                    <p class="countdown-text">{{ countdown }} 秒后自动进入游戏</p>
                </div>
                <div class="actions">
                    <button class="primary-button" @click="enterGame">
                        立即进入
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EEEEEE;
    padding: 20px;
}

.home-content {
    width: 100%;
    max-width: 600px;
}

.welcome-card {
    background: #FFFFFF;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.2);
    padding: 48px;
    text-align: center;
}

.welcome-title {
    font-size: 28px;
    font-weight: 700;
    color: #000000;
    margin: 0 0 32px 0;
    letter-spacing: 2px;
    border-bottom: 2px solid #000000;
    padding-bottom: 16px;
}

.user-info {
    background: #F5F5F5;
    border: 2px solid #000000;
    border-radius: 0;
    padding: 24px;
    margin-bottom: 32px;
}

.user-greeting {
    font-size: 16px;
    color: #000000;
    margin: 0 0 8px 0;
    font-family: 'Courier New', Courier, monospace;
}

.display-name {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
}

.username {
    color: #000000;
    font-weight: 700;
}

.uuid-suffix {
    color: #999999;
    font-size: 14px;
    font-weight: 400;
}

.success-text {
    font-size: 14px;
    color: #666666;
    margin: 8px 0 0 0;
    font-family: 'Courier New', Courier, monospace;
}

.countdown-info {
    margin: 24px 0;
    padding: 16px;
    background: #F0F0F0;
    border: 2px solid #000000;
    border-radius: 0;
}

.countdown-text {
    font-size: 16px;
    font-weight: 700;
    color: #000000;
    margin: 0;
    font-family: 'Courier New', Courier, monospace;
    letter-spacing: 1px;
}

.actions {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.primary-button {
    padding: 12px 32px;
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

.primary-button:hover {
    background: #FFFFFF;
    color: #000000;
    box-shadow: 4px 4px 0 #000000;
    transform: translate(-2px, -2px);
}

.primary-button:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0 #000000;
}
</style>

