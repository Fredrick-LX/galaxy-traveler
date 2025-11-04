<template>
    <div class="galaxy-map-container">
        <div ref="mapCanvas" class="map-canvas"></div>

        <div class="map-controls">
            <div class="control-group">
                <button @click="zoomIn" class="control-btn" title="放大">
                    <img src="/assets/icons/ui/zoom-in.svg" alt="放大" />
                </button>
                <button @click="zoomOut" class="control-btn" title="缩小">
                    <img src="/assets/icons/ui/zoom-out.svg" alt="缩小" />
                </button>
                <button @click="resetView" class="control-btn" title="重置视图">
                    <img src="/assets/icons/ui/reset.svg" alt="重置" />
                </button>
            </div>
            <div class="info-panel">
                <div v-if="hoveredGalaxy" class="galaxy-info">
                    <h4>{{ hoveredGalaxy.name }}</h4>
                    <p>{{ getCenterBodyType(hoveredGalaxy) }}</p>
                </div>
                <div v-else class="galaxy-info-empty">
                    将鼠标悬停在星系上查看描述
                </div>
            </div>
        </div>

        <!-- 星系详情面板 -->
        <div v-if="selectedGalaxy" class="galaxy-detail-panel">
            <div class="detail-header">
                <h3>{{ selectedGalaxy.name }}</h3>
                <button @click="selectedGalaxy = null" class="close-btn">
                    ×
                </button>
            </div>
            <div class="detail-content">
                <div class="detail-item">
                    <span class="detail-label">类型:</span>
                    <span class="detail-value">{{
                        getCenterBodyType(selectedGalaxy)
                    }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">天体数量:</span>
                    <span class="detail-value">{{
                        selectedGalaxy.bodies.length
                    }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">坐标:</span>
                    <span class="detail-value">
                        ({{ Math.round(selectedGalaxy.position.x) }},
                        {{ Math.round(selectedGalaxy.position.y) }})
                    </span>
                </div>
            </div>
            <div class="detail-actions">
                <button @click="enterGalaxy(selectedGalaxy)" class="enter-btn">
                    进入星系 →
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
    Application,
    Container,
    Text,
    TextStyle,
    Sprite,
    Assets,
} from "pixi.js";
import { Viewport } from "pixi-viewport";
import { getGalaxiesInRegion } from "../api/galaxy";
import type { Galaxy, GalaxyType } from "@galaxy-traveler/shared";

const emit = defineEmits<{
    galaxyClick: [galaxy: Galaxy];
}>();

const mapCanvas = ref<HTMLDivElement | null>(null);
const loading = ref(false);
const hoveredGalaxy = ref<Galaxy | null>(null);
const selectedGalaxy = ref<Galaxy | null>(null);

let app: Application | null = null;
let viewport: Viewport | null = null;
let assetsLoaded = false;

// 拖动检测（用于防止拖动时触发点击）
let isViewportDragging = false;

// 双击检测
let lastClickTime = 0;
let lastClickedGalaxyId: string | null = null;
const DOUBLE_CLICK_DELAY = 300; // 毫秒

// 无限宇宙管理
let galaxyNodes = new Map<string, Container>();
let galaxiesData = new Map<string, Galaxy>();
let galaxiesLayer: Container | null = null;
const VIEW_PADDING = 1500; // 视口外扩距离（增加以实现更好的预加载）
let lastViewportBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
let updateDebounceTimer: number | null = null;
let isLoadingInBackground = false; // 后台加载标志

onMounted(async () => {
    await initializeMap();
});

onUnmounted(() => {
    cleanup();
});

async function initializeMap() {
    if (!mapCanvas.value) return;

    try {
        // 预加载所有图标资源
        if (!assetsLoaded) {
            await loadAssets();
            assetsLoaded = true;
        }

        // 创建 Pixi 应用
        app = new Application();
        await app.init({
            width: mapCanvas.value.clientWidth,
            height: mapCanvas.value.clientHeight,
            backgroundColor: 0xeeeeee,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        mapCanvas.value.appendChild(app.canvas);

        // 创建 viewport（无限世界）
        viewport = new Viewport({
            screenWidth: mapCanvas.value.clientWidth,
            screenHeight: mapCanvas.value.clientHeight,
            worldWidth: 100000, // 超大世界，但只渲染可见部分
            worldHeight: 100000,
            events: app.renderer.events,
        });

        app.stage.addChild(viewport);

        // 启用拖拽和缩放，无拖动限制
        viewport.drag().pinch().wheel().decelerate().clampZoom({
            minScale: 0.2,
            maxScale: 3.0,
        });

        // 添加viewport拖动检测
        viewport.on("drag-start", () => {
            isViewportDragging = true;
            // 拖动开始时立即触发一次加载，确保预加载足够的内容
            immediateUpdateVisibleGalaxies();
        });

        viewport.on("drag-end", () => {
            // 延迟重置，确保pointerdown事件能检测到拖动状态
            setTimeout(() => {
                isViewportDragging = false;
            }, 50);
            // 拖动结束后再次加载，确保新区域的星系都已加载
            immediateUpdateVisibleGalaxies();
        });

        // 创建图层
        galaxiesLayer = new Container();
        viewport.addChild(galaxiesLayer);

        // 设置初始视图（居中在(2000, 2000)）
        viewport.moveCenter(2000, 2000);
        viewport.setZoom(0.5);

        // 监听viewport移动事件，实现动态加载（使用防抖）
        viewport.on("moved", () => {
            debounceUpdateVisibleGalaxies();
        });

        viewport.on("zoomed", () => {
            debounceUpdateVisibleGalaxies();
        });

        // 初始加载第一批星系
        await updateVisibleGalaxies();
    } catch (error) {
        console.error("初始化星系地图失败:", error);
        loading.value = false;
    }
}

async function loadAssets() {
    try {
        // 定义所有需要加载的图标
        const assets = [
            {
                alias: "galaxy-single-star",
                src: "/assets/icons/galaxy/single-star.svg",
            },
            {
                alias: "galaxy-binary-star",
                src: "/assets/icons/galaxy/binary-star.svg",
            },
            {
                alias: "galaxy-triple-star",
                src: "/assets/icons/galaxy/triple-star.svg",
            },
            {
                alias: "celestial-black-hole",
                src: "/assets/icons/celestial/black-hole.svg",
            },
            {
                alias: "celestial-neutron-star",
                src: "/assets/icons/celestial/neutron-star.svg",
            },
            {
                alias: "celestial-pulsar",
                src: "/assets/icons/celestial/pulsar.svg",
            },
        ];

        // 批量加载所有资源
        await Assets.load(assets.map((asset) => asset.src));
    } catch (error) {
        console.error("加载图标资源失败:", error);
    }
}

/**
 * 防抖更新（避免频繁请求）
 */
function debounceUpdateVisibleGalaxies() {
    if (updateDebounceTimer !== null) {
        clearTimeout(updateDebounceTimer);
    }
    updateDebounceTimer = window.setTimeout(() => {
        updateVisibleGalaxies(true); // 后台加载，不显示遮罩
    }, 100); // 减少延迟以实现更即时的响应
}

/**
 * 立即更新可见星系（用于拖动开始时）
 */
function immediateUpdateVisibleGalaxies() {
    if (updateDebounceTimer !== null) {
        clearTimeout(updateDebounceTimer);
        updateDebounceTimer = null;
    }
    updateVisibleGalaxies(true); // 后台加载
}

/**
 * 更新可见星系（从服务器动态加载）
 * @param backgroundLoad 是否在后台加载（不显示加载遮罩）
 */
async function updateVisibleGalaxies(backgroundLoad = false) {
    if (!viewport || !galaxiesLayer) return;

    // 如果正在后台加载，跳过此次请求
    if (isLoadingInBackground) return;

    const bounds = viewport.getVisibleBounds();

    // 计算需要加载的区域（带外扩）
    const minX = bounds.x - VIEW_PADDING;
    const maxX = bounds.x + bounds.width + VIEW_PADDING;
    const minY = bounds.y - VIEW_PADDING;
    const maxY = bounds.y + bounds.height + VIEW_PADDING;

    // 检查是否需要加载新数据（避免重复加载）
    if (
        Math.abs(minX - lastViewportBounds.minX) < VIEW_PADDING / 3 &&
        Math.abs(maxX - lastViewportBounds.maxX) < VIEW_PADDING / 3 &&
        Math.abs(minY - lastViewportBounds.minY) < VIEW_PADDING / 3 &&
        Math.abs(maxY - lastViewportBounds.maxY) < VIEW_PADDING / 3
    ) {
        // 视口变化不大，不需要重新加载
        return;
    }

    lastViewportBounds = { minX, maxX, minY, maxY };

    try {
        // 只在非后台加载时显示遮罩
        if (!backgroundLoad) {
            loading.value = true;
        } else {
            isLoadingInBackground = true;
        }

        // 从服务器加载该区域的星系
        const response = await getGalaxiesInRegion(minX, maxX, minY, maxY);

        if (response.success && response.data) {
            const newGalaxies = response.data.galaxies;

            // 更新星系数据缓存
            newGalaxies.forEach((galaxy) => {
                galaxiesData.set(galaxy.id, galaxy);
            });

            // 确定当前视口内应该显示的星系（包含缓冲区）
            const visibleGalaxyIds = new Set<string>();
            const removalBuffer = VIEW_PADDING * 0.5; // 额外缓冲区，避免频繁添加/删除

            galaxiesData.forEach((galaxy, id) => {
                if (
                    galaxy.position.x >= minX &&
                    galaxy.position.x <= maxX &&
                    galaxy.position.y >= minY &&
                    galaxy.position.y <= maxY
                ) {
                    visibleGalaxyIds.add(id);
                }
            });

            // 移除远离视口的星系节点（使用更大的缓冲区）
            galaxyNodes.forEach((node, id) => {
                const galaxy = galaxiesData.get(id);
                if (galaxy) {
                    const isInRemovalZone =
                        galaxy.position.x < minX - removalBuffer ||
                        galaxy.position.x > maxX + removalBuffer ||
                        galaxy.position.y < minY - removalBuffer ||
                        galaxy.position.y > maxY + removalBuffer;

                    if (isInRemovalZone) {
                        galaxiesLayer!.removeChild(node);
                        galaxyNodes.delete(id);
                    }
                }
            });

            // 批量添加新进入视口的星系节点（使用requestAnimationFrame优化）
            const newGalaxyIds = Array.from(visibleGalaxyIds).filter(
                (id) => !galaxyNodes.has(id)
            );

            // 分批添加，避免一次性添加太多导致卡顿
            const batchSize = 20;
            let currentIndex = 0;

            const addBatch = () => {
                const end = Math.min(
                    currentIndex + batchSize,
                    newGalaxyIds.length
                );

                for (let i = currentIndex; i < end; i++) {
                    const id = newGalaxyIds[i];
                    if (!id) continue;
                    const galaxy = galaxiesData.get(id);
                    if (galaxy) {
                        const node = createGalaxyNode(galaxy);
                        galaxiesLayer!.addChild(node);
                        galaxyNodes.set(id, node);
                    }
                }

                currentIndex = end;

                if (currentIndex < newGalaxyIds.length) {
                    requestAnimationFrame(addBatch);
                }
            };

            if (newGalaxyIds.length > 0) {
                requestAnimationFrame(addBatch);
            }
        }

        loading.value = false;
        isLoadingInBackground = false;
    } catch (error) {
        console.error("加载区域星系失败:", error);
        loading.value = false;
        isLoadingInBackground = false;
    }
}

function getGalaxyIconPath(type: GalaxyType): string {
    const iconMap: Record<string, string> = {
        single_star: "/assets/icons/galaxy/single-star.svg",
        binary_star: "/assets/icons/galaxy/binary-star.svg",
        triple_star: "/assets/icons/galaxy/triple-star.svg",
        black_hole: "/assets/icons/celestial/black-hole.svg",
        neutron_star: "/assets/icons/celestial/neutron-star.svg",
        pulsar: "/assets/icons/celestial/pulsar.svg",
    };
    return iconMap[type] || "/assets/icons/galaxy/single-star.svg";
}

function createGalaxyNode(galaxy: Galaxy): Container {
    const container = new Container();
    // 直接使用服务器返回的世界坐标
    container.x = galaxy.position.x;
    container.y = galaxy.position.y;
    container.eventMode = "static";
    container.cursor = "pointer";

    // ===== 【初始渲染星系图标 - 控制大小的代码】 =====
    // 使用SVG图标，设置初始大小为72像素
    const iconPath = getGalaxyIconPath(galaxy.type);
    const size = 72; // 这里控制星系图标的初始大小

    // 创建图标精灵
    const icon = Sprite.from(iconPath);
    icon.anchor.set(0.5);
    icon.width = size; // 设置宽度
    icon.height = size; // 设置高度
    // ================================================

    container.addChild(icon);

    // 星系名称
    const label = new Text({
        text: galaxy.name,
        style: new TextStyle({
            fontSize: 10,
            fill: 0x000000,
            fontFamily: "Courier New, monospace",
            fontWeight: "700",
        }),
    });
    label.anchor.set(0, 0.5);
    label.x = 20;
    label.y = 0;
    container.addChild(label);

    // ===== 【Hover效果 - 大小变化的代码】 =====
    // 交互事件
    container.on("pointerenter", () => {
        hoveredGalaxy.value = galaxy;
        // Hover时放大到1.5倍
        icon.scale.set(1.5);
    });

    container.on("pointerleave", () => {
        hoveredGalaxy.value = null;
        // 离开时恢复原始大小
        icon.scale.set(1);
    });
    // ================================================

    container.on("pointerdown", () => {
        // 如果正在拖动viewport，则不处理点击
        if (isViewportDragging) return;

        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;

        // 双击检测
        if (
            lastClickedGalaxyId === galaxy.id &&
            timeSinceLastClick < DOUBLE_CLICK_DELAY
        ) {
            // 双击：直接进入星系
            enterGalaxy(galaxy);
            lastClickedGalaxyId = null;
            lastClickTime = 0;
        } else {
            // 单击：显示详情面板
            selectedGalaxy.value = galaxy;
            lastClickedGalaxyId = galaxy.id;
            lastClickTime = now;
        }
    });

    return container;
}

/**
 * 进入星系
 */
function enterGalaxy(galaxy: Galaxy) {
    emit("galaxyClick", galaxy);
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

function zoomIn() {
    if (viewport) {
        viewport.zoom(-100, true);
    }
}

function zoomOut() {
    if (viewport) {
        viewport.zoom(100, true);
    }
}

function resetView() {
    if (viewport) {
        viewport.moveCenter(2000, 2000);
        viewport.setZoom(0.5, true);
    }
}

function cleanup() {
    // 清除防抖定时器
    if (updateDebounceTimer !== null) {
        clearTimeout(updateDebounceTimer);
        updateDebounceTimer = null;
    }

    if (app) {
        app.destroy(true, { children: true });
        app = null;
    }

    viewport = null;
    galaxyNodes.clear();
    galaxiesData.clear();
    galaxiesLayer = null;
}
</script>

<style scoped>
.galaxy-map-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #eeeeee;
    overflow: hidden;
}

.map-canvas {
    width: 100%;
    height: 100%;
}

.map-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 10;
}

.control-group {
    display: flex;
    gap: 8px;
    background: #ffffff;
    padding: 8px;
    border-radius: 0;
    border: 2px solid #000000;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.control-btn {
    width: 40px;
    height: 40px;
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.control-btn img {
    width: 20px;
    height: 20px;
    image-rendering: pixelated;
}

.control-btn:hover {
    background: #000000;
    box-shadow: 2px 2px 0 #000000;
    transform: translate(-1px, -1px);
}

.control-btn:hover img {
    filter: invert(1);
}

.info-panel {
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 0;
    padding: 12px;
    min-width: 200px;
    max-width: 250px;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.galaxy-info h4 {
    margin: 0 0 8px 0;
    color: #000000;
    font-size: 14px;
    font-weight: 700;
    font-family: "Courier New", monospace;
}

.galaxy-info p {
    margin: 4px 0;
    color: #333333;
    font-size: 12px;
    font-family: "Courier New", monospace;
}

.galaxy-info-empty {
    color: #666666;
    font-size: 12px;
    text-align: center;
    font-family: "Courier New", monospace;
}

/* 星系详情面板 */
.galaxy-detail-panel {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 320px;
    background: #ffffff;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3);
    z-index: 50;
    animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateY(-50%) translateX(20px);
        opacity: 0;
    }
    to {
        transform: translateY(-50%) translateX(0);
        opacity: 1;
    }
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #000000;
    border-bottom: 3px solid #000000;
}

.detail-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    font-family: "Courier New", monospace;
}

.close-btn {
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.1s;
}

.close-btn:hover {
    opacity: 0.7;
}

.detail-content {
    padding: 20px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eeeeee;
    font-family: "Courier New", monospace;
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-label {
    color: #666666;
    font-size: 13px;
    font-weight: 700;
}

.detail-value {
    color: #000000;
    font-size: 13px;
    font-weight: 700;
}

.detail-actions {
    padding: 0 20px 20px 20px;
}

.enter-btn {
    width: 100%;
    padding: 12px;
    background: #000000;
    color: #ffffff;
    border: 2px solid #000000;
    border-radius: 0;
    font-size: 14px;
    font-weight: 700;
    font-family: "Courier New", monospace;
    cursor: pointer;
    transition: all 0.1s;
}

.enter-btn:hover {
    background: #333333;
    box-shadow: 3px 3px 0 #000000;
    transform: translate(-1px, -1px);
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(238, 238, 238, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #cccccc;
    border-top-color: #000000;
    border-radius: 0;
    animation: spin 1s linear infinite;
}

.loading-overlay p {
    margin-top: 20px;
    color: #000000;
    font-size: 16px;
    font-weight: 700;
    font-family: "Courier New", monospace;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
