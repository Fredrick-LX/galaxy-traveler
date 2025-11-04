<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import GalaxyMap from "../components/GalaxyMap.vue";
import GalaxyView from "../components/GalaxyView.vue";
import { selectStartingGalaxy } from "../api/galaxy";
import type { Galaxy } from "@galaxy-traveler/shared";
import type { User } from "../types/auth";

const router = useRouter();

const currentView = ref<"map" | "galaxy">("map");
const selectedGalaxy = ref<Galaxy | null>(null);
const showMenu = ref(false);
const showStartingGalaxyDialog = ref(false);
const pendingGalaxy = ref<Galaxy | null>(null);
const isSelectingStartingGalaxy = ref(false);
const user = ref<User | null>(null);

onMounted(() => {
    console.log("游戏主界面已加载");

    // 加载用户信息
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
        user.value = JSON.parse(userInfo);
    }
});

async function handleGalaxyClick(galaxy: Galaxy) {
    // 检查是否是首次选择星系（简单检查localStorage）
    const hasStartingGalaxy = localStorage.getItem("starting_galaxy_id");

    if (!hasStartingGalaxy) {
        // 显示选择起始星系的确认对话框
        pendingGalaxy.value = galaxy;
        showStartingGalaxyDialog.value = true;
    } else {
        // 已有起始星系，直接进入
        selectedGalaxy.value = galaxy;
        currentView.value = "galaxy";
    }
}

async function confirmStartingGalaxy() {
    if (!pendingGalaxy.value) return;

    try {
        isSelectingStartingGalaxy.value = true;
        const response = await selectStartingGalaxy(pendingGalaxy.value.id);

        if (response.success) {
            // 保存起始星系ID
            localStorage.setItem("starting_galaxy_id", pendingGalaxy.value.id);

            // 进入星系视图
            selectedGalaxy.value = pendingGalaxy.value;
            currentView.value = "galaxy";
            showStartingGalaxyDialog.value = false;

            console.log("✅ 成功创建起始星系和探索船:", response.data);
        } else {
            alert(response.error || "选择起始星系失败");
        }
    } catch (error: any) {
        console.error("选择起始星系失败:", error);
        alert(error.response?.data?.error || "选择起始星系失败，请重试");
    } finally {
        isSelectingStartingGalaxy.value = false;
    }
}

function cancelStartingGalaxy() {
    showStartingGalaxyDialog.value = false;
    pendingGalaxy.value = null;
}

function getCenterBodyType(galaxy: Galaxy): string {
    const typeMap: Record<string, string> = {
        single_star: "单星系统",
        binary_star: "双星系统",
        triple_star: "三星系统",
        black_hole: "黑洞系统",
        neutron_star: "中子星系统",
        pulsar: "脉冲星系统",
    };
    return typeMap[galaxy.type] || "未知";
}

function backToMap() {
    currentView.value = "map";
    selectedGalaxy.value = null;
}

function backToHome() {
    router.push("/");
    showMenu.value = false;
}

function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_info");
    router.push("/login");
}
</script>

<template>
    <div class="game-main-container">
        <div class="game-header">
            <div class="header-left">
                <div v-if="user" class="user-display">
                    <span class="username">{{ user.name }}</span>
                    <span class="uuid-suffix"
                        >#{{ user.uuid.substring(0, 8) }}</span
                    >
                </div>
            </div>
            <div class="header-actions">
                <button
                    @click="showMenu = !showMenu"
                    class="action-button menu-btn"
                >
                    <img
                        src="/assets/icons/ui/menu.svg"
                        alt="菜单"
                        class="btn-icon"
                    />
                    菜单
                </button>
            </div>
        </div>

        <div
            v-if="showMenu"
            class="dropdown-menu"
            @click.self="showMenu = false"
        >
            <div class="menu-content">
                <button @click="backToHome" class="menu-item">
                    <img
                        src="/assets/icons/ui/home.svg"
                        alt="返回首页"
                        class="menu-icon"
                    />
                    返回首页
                </button>
                <button @click="logout" class="menu-item danger">
                    <img
                        src="/assets/icons/ui/logout.svg"
                        alt="退出登录"
                        class="menu-icon"
                    />
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

        <!-- 选择起始星系对话框 -->
        <div
            v-if="showStartingGalaxyDialog"
            class="dialog-overlay"
            @click.self="cancelStartingGalaxy"
        >
            <div class="dialog-box">
                <h2>选择起始星系</h2>
                <div class="dialog-content">
                    <p>
                        您选择了
                        <strong>{{ pendingGalaxy?.name }}</strong>
                        作为起始星系。
                    </p>
                    <p class="dialog-description">
                        选择后将在此星系创建您的第一艘探索船。<br />
                        探索船拥有全能力：采矿、攻击、建造、运输等。
                    </p>
                    <div class="galaxy-preview">
                        <div class="preview-item">
                            <span class="preview-label">星系类型:</span>
                            <span class="preview-value">{{
                                getCenterBodyType(pendingGalaxy!)
                            }}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">天体数量:</span>
                            <span class="preview-value">{{
                                pendingGalaxy?.bodies.length
                            }}</span>
                        </div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button
                        @click="confirmStartingGalaxy"
                        class="dialog-btn primary"
                        :disabled="isSelectingStartingGalaxy"
                    >
                        {{
                            isSelectingStartingGalaxy ? "创建中..." : "确认选择"
                        }}
                    </button>
                    <button
                        @click="cancelStartingGalaxy"
                        class="dialog-btn"
                        :disabled="isSelectingStartingGalaxy"
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.game-main-container {
    width: 100vw;
    height: 100vh;
    background: #eeeeee;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.game-header {
    background: #ffffff;
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
    font-family: "Courier New", monospace;
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
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: "Courier New", monospace;
}

.btn-icon {
    width: 16px;
    height: 16px;
    image-rendering: pixelated;
}

.action-button:hover {
    background: #000000;
    color: #ffffff;
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
    background: #ffffff;
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
    font-family: "Courier New", monospace;
}

.menu-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

.menu-item:hover {
    background: #eeeeee;
}

.menu-item.danger {
    color: #000000;
}

.menu-item.danger:hover {
    background: #cccccc;
}

.game-content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

/* 对话框样式 */
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.dialog-box {
    background: #ffffff;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3);
    width: 500px;
    max-width: 90%;
    font-family: "Courier New", monospace;
}

.dialog-box h2 {
    margin: 0;
    padding: 20px;
    background: #000000;
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    border-bottom: 3px solid #000000;
}

.dialog-content {
    padding: 24px;
}

.dialog-content p {
    margin: 0 0 16px 0;
    font-size: 14px;
    line-height: 1.6;
    color: #000000;
}

.dialog-content strong {
    color: #000000;
    font-weight: 700;
}

.dialog-description {
    color: #666666;
    font-size: 13px;
}

.galaxy-preview {
    background: #f5f5f5;
    border: 2px solid #000000;
    padding: 16px;
    margin-top: 16px;
}

.preview-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
}

.preview-label {
    color: #666666;
    font-weight: 700;
}

.preview-value {
    color: #000000;
}

.dialog-actions {
    padding: 0 24px 24px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.dialog-btn {
    padding: 10px 24px;
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 0;
    color: #000000;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    font-family: "Courier New", monospace;
    transition: all 0.1s;
}

.dialog-btn:hover:not(:disabled) {
    background: #000000;
    color: #ffffff;
    box-shadow: 2px 2px 0 #000000;
    transform: translate(-1px, -1px);
}

.dialog-btn.primary {
    background: #666666;
    border-color: #666666;
    color: #ffffff;
}

.dialog-btn.primary:hover:not(:disabled) {
    background: #444444;
    border-color: #444444;
}

.dialog-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
