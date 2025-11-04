<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GalaxyMap from '../components/GalaxyMap.vue';
import GalaxyView from '../components/GalaxyView.vue';
import type { Galaxy } from '@galaxy-traveler/shared';
import type { User } from '../types/auth';

const router = useRouter();

const currentView = ref<'map' | 'galaxy'>('map');
const selectedGalaxy = ref<Galaxy | null>(null);
const showMenu = ref(false);
const user = ref<User | null>(null);

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

function backToHome() {
    router.push('/');
    showMenu.value = false;
}

function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    router.push('/login');
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
</style>
