<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GalaxyMap from '../components/GalaxyMap.vue';
import GalaxyView from '../components/GalaxyView.vue';
import CodeEditor from './CodeEditor.vue';
import type { Galaxy } from '@galaxy-traveler/shared';
import type { User } from '../types/auth';

const router = useRouter();

const currentView = ref<'map' | 'galaxy'>('map');
const selectedGalaxy = ref<Galaxy | null>(null);
const showMenu = ref(false);
const showCodeEditor = ref(false);
const showConsole = ref(false);
const user = ref<User | null>(null);
const consoleLogs = ref<Array<{time: number, type: 'info' | 'error' | 'success', message: string}>>([]);

onMounted(() => {
    console.log('游戏主界面已加载');
    
    // 加载用户信息
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
        user.value = JSON.parse(userInfo);
    }
});

function handleGalaxyClick(galaxy: Galaxy) {
    selectedGalaxy.value = galaxy;
    currentView.value = 'galaxy';
}

function backToMap() {
    currentView.value = 'map';
    selectedGalaxy.value = null;
}

function navigateToCode() {
    showCodeEditor.value = true;
    showMenu.value = false;
}

function closeCodeEditor() {
    showCodeEditor.value = false;
}

function backToHome() {
    router.push('/');
    showMenu.value = false;
}

function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    router.push('/login');
}

function toggleConsole() {
    showConsole.value = !showConsole.value;
}

function addLog(message: string, type: 'info' | 'error' | 'success' = 'info') {
    consoleLogs.value.push({
        time: Date.now(),
        type,
        message,
    });
}

function clearConsole() {
    consoleLogs.value = [];
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
</script>

<template>
    <div class="game-main-container">
        <div class="game-header">
            <div class="header-left">
                <div v-if="user" class="user-display">
                    <span class="username">{{ user.name }}</span>
                    <span class="uuid-suffix">#{{ user.uuid.substring(0, 8) }}</span>
                </div>
            </div>
            <div class="header-actions">
                <button @click="navigateToCode" class="action-button">
                    <img src="/assets/icons/ui/code.svg" alt="代码" class="btn-icon" />
                    代码
                </button>
                <button @click="toggleConsole" class="action-button">
                    <img src="/assets/icons/ui/console.svg" alt="控制台" class="btn-icon" />
                    控制台
                </button>
                <button @click="showMenu = !showMenu" class="action-button menu-btn">
                    <img src="/assets/icons/ui/menu.svg" alt="菜单" class="btn-icon" />
                    菜单
                </button>
            </div>
        </div>

        <div v-if="showMenu" class="dropdown-menu" @click.self="showMenu = false">
            <div class="menu-content">
                <button @click="backToHome" class="menu-item">
                    <img src="/assets/icons/ui/home.svg" alt="返回首页" class="menu-icon" />
                    返回首页
                </button>
                <button @click="logout" class="menu-item danger">
                    <img src="/assets/icons/ui/logout.svg" alt="退出登录" class="menu-icon" />
                    退出登录
                </button>
            </div>
        </div>
        
        <div class="game-content">
            <GalaxyMap 
                v-if="currentView === 'map'"
                @galaxy-click="handleGalaxyClick"
            />
            <GalaxyView 
                v-else-if="currentView === 'galaxy' && selectedGalaxy"
                :galaxy="selectedGalaxy"
                @back="backToMap"
            />
        </div>

        <!-- 代码编辑器窗口 -->
        <CodeEditor 
            v-if="showCodeEditor" 
            @close="closeCodeEditor"
            @log="addLog"
        />

        <!-- 底部控制台 -->
        <div v-if="showConsole" class="bottom-console">
            <div class="console-header">
                <h3>控制台</h3>
                <div class="console-actions">
                    <button @click="clearConsole" class="console-btn">清空</button>
                    <button @click="toggleConsole" class="console-btn">✕</button>
                </div>
            </div>
            <div class="console-output">
                <div
                    v-for="(log, index) in consoleLogs"
                    :key="index"
                    :class="['console-line', log.type]"
                >
                    <span class="log-time">{{ formatTime(log.time) }}</span>
                    <span class="log-message">{{ log.message }}</span>
                </div>
                <div v-if="consoleLogs.length === 0" class="console-empty">
                    控制台输出将在这里显示...
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.game-main-container {
    width: 100vw;
    height: 100vh;
    background: #EEEEEE;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.game-header {
    background: #FFFFFF;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #000000;
    z-index: 100;
    position: relative;
}

.header-left {
    display: flex;
    align-items: baseline;
    gap: 12px;
}

.user-display {
    display: flex;
    align-items: baseline;
    gap: 2px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
}

.username {
    color: #000000;
    font-weight: 700;
}

.uuid-suffix {
    color: #999999;
    font-size: 12px;
    font-weight: 400;
}

.header-actions {
    display: flex;
    gap: 8px;
    position: relative;
}

.action-button {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 700;
    color: #000000;
    background: #FFFFFF;
    border: 2px solid #000000;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Courier New', monospace;
}

.btn-icon {
    width: 16px;
    height: 16px;
    image-rendering: pixelated;
}

.action-button:hover {
    background: #000000;
    color: #FFFFFF;
    box-shadow: 2px 2px 0 #000000;
    transform: translate(-1px, -1px);
}

.action-button:hover .btn-icon {
    filter: invert(1);
}

.menu-btn {
    min-width: 80px;
}

.dropdown-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 101;
}

.menu-content {
    position: absolute;
    top: 56px;
    right: 24px;
    background: #FFFFFF;
    border: 3px solid #000000;
    border-radius: 0;
    overflow: hidden;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
    min-width: 180px;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px 20px;
    text-align: left;
    background: transparent;
    border: none;
    color: #000000;
    cursor: pointer;
    transition: all 0.1s;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Courier New', monospace;
}

.menu-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

.menu-item:hover {
    background: #EEEEEE;
}

.menu-item.danger {
    color: #000000;
}

.menu-item.danger:hover {
    background: #CCCCCC;
}

.game-content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.bottom-console {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: #FFFFFF;
    border-top: 3px solid #000000;
    z-index: 500;
    display: flex;
    flex-direction: column;
}

.console-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #EEEEEE;
    border-bottom: 2px solid #000000;
}

.console-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    color: #000000;
}

.console-actions {
    display: flex;
    gap: 8px;
}

.console-btn {
    padding: 4px 12px;
    background: #FFFFFF;
    border: 2px solid #000000;
    border-radius: 0;
    color: #000000;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    transition: all 0.1s;
}

.console-btn:hover {
    background: #000000;
    color: #FFFFFF;
}

.console-output {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    background: #FFFFFF;
}

.console-line {
    padding: 6px 8px;
    margin-bottom: 4px;
    border-left: 3px solid transparent;
}

.console-line.error {
    background: #FFE6E6;
    border-left-color: #FF0000;
    color: #CC0000;
}

.console-line.success {
    background: #E6FFE6;
    border-left-color: #00CC00;
    color: #006600;
}

.console-line.info {
    color: #000000;
}

.log-time {
    color: #666666;
    margin-right: 8px;
    font-weight: 700;
}

.console-empty {
    color: #999999;
    font-style: italic;
    padding: 20px;
    text-align: center;
}
</style>
