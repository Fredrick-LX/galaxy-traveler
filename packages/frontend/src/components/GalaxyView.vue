<template>
    <div class="galaxy-view-container">
        <div class="view-header">
            <button @click="goBack" class="back-btn">← 返回星系地图</button>
            <h2>{{ galaxy?.name || "加载中..." }}</h2>
            <div class="header-info">
                <span v-if="galaxy">{{ galaxy.bodies.length }} 个天体</span>
            </div>
        </div>

        <div ref="viewCanvas" class="view-canvas"></div>

        <!-- 控制面板 -->
        <UnitControlPanel
            :selected-units="getSelectedUnitsInfo()"
            @close="clearSelection"
            @command="handleCommand"
            @demolish="handleDemolish"
        />

        <!-- 天体列表（左侧） -->
        <div class="celestial-list">
            <div class="panel-header">
                <h3>天体列表</h3>
            </div>
            <div class="panel-content">
                <div
                    class="body-item"
                    v-for="body in sortedBodies"
                    :key="body.id"
                    :class="{
                        center: isCenterBody(body),
                        selected: selectedBody?.id === body.id,
                    }"
                    @click="selectBody(body)"
                >
                    <div class="body-icon">
                        <img
                            :src="getCelestialIconPath(body.type)"
                            :alt="getCelestialTypeName(body.type)"
                        />
                    </div>
                    <div class="body-details">
                        <div class="body-name">{{ body.name }}</div>
                        <div class="body-type">
                            {{ getCelestialTypeName(body.type) }}
                        </div>
                        <div
                            v-if="body.resources && body.resources.length > 0"
                            class="body-resources"
                        >
                            <span
                                v-for="resource in body.resources"
                                :key="resource"
                                class="resource-item"
                            >
                                <img
                                    :src="getResourceIconPath(resource)"
                                    :alt="resource"
                                    class="resource-icon"
                                />
                                {{ resource }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 建造菜单（右侧） -->
        <div class="building-menu-panel">
            <div class="panel-header">
                <h3>建造菜单</h3>
            </div>
            <div class="panel-content">
                <BuildingMenu @place-building="startBuildingPlacement" />
            </div>
        </div>

        <!-- 天体信息面板 -->
        <div v-if="selectedBody" class="celestial-info-panel">
            <div class="info-header">
                <h3>{{ selectedBody.name }}</h3>
                <button @click="selectedBody = null" class="close-btn">
                    ✕
                </button>
            </div>
            <div class="info-content">
                <div class="info-row">
                    <span class="info-label">类型:</span>
                    <span class="info-value">{{
                        getCelestialTypeName(selectedBody.type)
                    }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">质量:</span>
                    <span class="info-value">{{
                        selectedBody.mass.toFixed(2)
                    }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">半径:</span>
                    <span class="info-value"
                        >{{ selectedBody.radius.toFixed(0) }} km</span
                    >
                </div>
                <div v-if="selectedBody.temperature" class="info-row">
                    <span class="info-label">温度:</span>
                    <span class="info-value"
                        >{{ selectedBody.temperature.toFixed(0) }} K</span
                    >
                </div>
                <div v-if="selectedBody.orbitRadius" class="info-row">
                    <span class="info-label">轨道半径:</span>
                    <span class="info-value">{{
                        selectedBody.orbitRadius.toFixed(2)
                    }}</span>
                </div>
                <div
                    v-if="
                        selectedBody.resources &&
                        selectedBody.resources.length > 0
                    "
                    class="info-row"
                >
                    <span class="info-label">资源:</span>
                    <div class="info-resources">
                        <span
                            v-for="resource in selectedBody.resources"
                            :key="resource"
                            class="resource-badge"
                        >
                            <img
                                :src="getResourceIconPath(resource)"
                                :alt="resource"
                                class="resource-icon"
                            />
                            {{ resource }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
    Application,
    Graphics,
    Container,
    Text,
    TextStyle,
    Sprite,
    Assets,
} from "pixi.js";
import { Viewport } from "pixi-viewport";
import type {
    Galaxy,
    CelestialBody,
    CelestialType,
    GameShip,
    GameStructure,
} from "@galaxy-traveler/shared";
import UnitControlPanel from "./UnitControlPanel.vue";
import BuildingMenu from "./BuildingMenu.vue";

// ==================== Props & Emits ====================
const props = defineProps<{
    galaxy: Galaxy;
}>();

const emit = defineEmits<{
    back: [];
}>();

// ==================== 常量配置 ====================
const WORLD_SIZE = 15; // 世界大小 15x15
const WORLD_CENTER = WORLD_SIZE / 2; // 世界中心点 7.5
const GRID_STEP = 0.5; // 网格间隔

// 天体大小配置
const BODY_SIZES = {
    LARGE: 2.5, // 恒星、黑洞、中子星、脉冲星
    MEDIUM: 1.8, // 气态巨星、冰巨星
    SMALL: 1.2, // 类地行星
    TINY: 1.0, // 小行星带
};

// ==================== Refs ====================
const viewCanvas = ref<HTMLDivElement | null>(null);
const selectedBody = ref<CelestialBody | null>(null);
const selectedObjects = ref<Set<string>>(new Set());
const isPlacingBuilding = ref(false);
const placingBuildingId = ref<string | null>(null);

// 游戏对象数据（模拟数据，后续从后端获取）
const ships = ref<Map<string, GameShip>>(new Map());
const structures = ref<Map<string, GameStructure>>(new Map());

// Pixi.js 对象
let app: Application | null = null;
let viewport: Viewport | null = null;
let bodiesContainer: Container | null = null;
let gameObjectsContainer: Container | null = null;
let selectionBox: Graphics | null = null;
let buildingPreview: Graphics | null = null;
let assetsLoaded = false;

// 框选相关
const isDraggingSelection = ref(false);
const selectionStart = ref<{ x: number; y: number } | null>(null);
const selectionEnd = ref<{ x: number; y: number } | null>(null);

// ==================== Computed ====================
const sortedBodies = computed(() => {
    if (!props.galaxy) return [];
    return [...props.galaxy.bodies].sort((a, b) => {
        const aOrbit = a.orbitRadius || 0;
        const bOrbit = b.orbitRadius || 0;
        return aOrbit - bOrbit;
    });
});

// ==================== 生命周期 ====================
onMounted(async () => {
    await initializeView();
});

onUnmounted(() => {
    cleanup();
});

// ==================== 初始化 ====================
async function initializeView() {
    if (!viewCanvas.value || !props.galaxy) return;

    try {
        // 预加载所有图标资源
        if (!assetsLoaded) {
            await loadAllAssets();
            assetsLoaded = true;
        }

        // 初始化 Pixi.js Application
        app = new Application();
        await app.init({
            width: viewCanvas.value.clientWidth,
            height: viewCanvas.value.clientHeight,
            backgroundColor: 0xffffff,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        viewCanvas.value.appendChild(app.canvas);

        // 创建 viewport
        viewport = new Viewport({
            screenWidth: viewCanvas.value.clientWidth,
            screenHeight: viewCanvas.value.clientHeight,
            worldWidth: WORLD_SIZE,
            worldHeight: WORLD_SIZE,
            events: app.renderer.events,
        });

        app.stage.addChild(viewport);

        // 配置 viewport 交互
        setupViewportInteractions();

        // 添加图层
        selectionBox = new Graphics();
        buildingPreview = new Graphics();
        viewport.addChild(selectionBox);
        viewport.addChild(buildingPreview);

        // 绘制星系视图
        renderGalaxyView();

        // 居中视图
        viewport.moveCenter(WORLD_CENTER, WORLD_CENTER);
        viewport.setZoom(
            Math.min(
                viewCanvas.value.clientWidth,
                viewCanvas.value.clientHeight
            ) / WORLD_SIZE
        );
    } catch (error) {
        console.error("初始化星系视图失败:", error);
    }
}

function setupViewportInteractions() {
    if (!viewport) return;

    viewport
        .drag({ mouseButtons: "middle" })
        .pinch()
        .wheel()
        .decelerate()
        .clamp({ direction: "all" })
        .clampZoom({
            minScale: 30.0,
            maxScale: 30.0,
        });

    viewport.eventMode = "static";
    viewport.on("pointerdown", handlePointerDown);
    viewport.on("pointermove", handlePointerMove);
    viewport.on("pointerup", handlePointerUp);
    viewport.on("rightclick", handleRightClick);
}

// ==================== 资源加载 ====================
async function loadAllAssets() {
    try {
        const assets = [
            // 天体图标
            ...getAssetList("celestial", [
                "star",
                "black-hole",
                "neutron-star",
                "pulsar",
                "gas-giant",
                "planet",
                "asteroid-belt",
            ]),
            // 建筑图标
            ...getAssetList("buildings", [
                "ore_extractor",
                "gas_harvester",
                "crystal_miner",
                "liquid_pump",
                "basic_refinery",
                "advanced_refinery",
                "chemical_plant",
                "component_factory",
                "assembly_plant",
                "shipyard",
                "repair_station",
                "research_lab",
                "structure_constructor",
                "advanced_mining_complex",
                "high_tech_fabricator",
            ]),
        ];

        await Assets.load(assets.map((asset) => asset.src));
    } catch (error) {
        console.error("加载图标资源失败:", error);
    }
}

function getAssetList(category: string, names: string[]) {
    return names.map((name) => ({
        alias: `${category}-${name}`,
        src: `/assets/icons/${category}/${name}.svg`,
    }));
}

// ==================== 渲染 ====================
function renderGalaxyView() {
    if (!viewport || !props.galaxy) return;

    // 绘制网格
    const gridLayer = new Container();
    drawGrid(gridLayer);
    viewport.addChild(gridLayer);

    // 绘制天体
    bodiesContainer = new Container();
    props.galaxy.bodies.forEach((body) => {
        bodiesContainer!.addChild(createBodyNode(body));
    });
    viewport.addChild(bodiesContainer);

    // 绘制游戏对象
    gameObjectsContainer = new Container();
    viewport.addChild(gameObjectsContainer);
    renderGameObjects();
}

function drawGrid(container: Container) {
    const grid = new Graphics();

    // 绘制垂直和水平网格线
    for (let i = 0; i <= WORLD_SIZE; i += GRID_STEP) {
        const lineStyle = getGridLineStyle(i);

        // 垂直线
        grid.moveTo(i, 0);
        grid.lineTo(i, WORLD_SIZE);
        grid.stroke(lineStyle);

        // 水平线
        grid.moveTo(0, i);
        grid.lineTo(WORLD_SIZE, i);
        grid.stroke(lineStyle);
    }

    // 绘制中心轴线
    const centerLineStyle = { width: 0.12, color: 0x000000, alpha: 0.8 };
    grid.moveTo(WORLD_CENTER, 0);
    grid.lineTo(WORLD_CENTER, WORLD_SIZE);
    grid.stroke(centerLineStyle);

    grid.moveTo(0, WORLD_CENTER);
    grid.lineTo(WORLD_SIZE, WORLD_CENTER);
    grid.stroke(centerLineStyle);

    container.addChild(grid);
}

function getGridLineStyle(position: number) {
    if (position % 5 === 0) {
        // 整5的线：加黑加粗
        return { width: 0.08, color: 0x000000, alpha: 0.7 };
    } else if (position % 1 === 0) {
        // 普通整数线：中等
        return { width: 0.03, color: 0x666666, alpha: 0.5 };
    } else {
        // 0.5网格线：浅色
        return { width: 0.02, color: 0xcccccc, alpha: 0.3 };
    }
}

function createBodyNode(body: CelestialBody): Container {
    const container = new Container();
    container.x = WORLD_CENTER + body.position.x;
    container.y = WORLD_CENTER + body.position.y;

    // 图标
    const icon = Sprite.from(getCelestialIconPath(body.type));
    const size = getBodySize(body);
    icon.anchor.set(0.5);
    icon.width = size;
    icon.height = size;
    container.addChild(icon);

    // 名称标签
    const label = createLabel(body.name, 0.8, size / 2 + 0.3, 0);
    container.addChild(label);

    // 添加交互
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("click", () => selectBody(body));

    return container;
}

function getBodySize(body: CelestialBody): number {
    switch (body.type) {
        case "star":
        case "black_hole":
        case "neutron_star":
        case "pulsar":
            return BODY_SIZES.LARGE;
        case "gas_giant":
        case "ice_giant":
            return BODY_SIZES.MEDIUM;
        case "terrestrial":
            return BODY_SIZES.SMALL;
        case "asteroid_belt":
        default:
            return BODY_SIZES.TINY;
    }
}

function renderGameObjects() {
    if (!gameObjectsContainer) return;
    gameObjectsContainer.removeChildren();

    ships.value.forEach((ship) => {
        gameObjectsContainer!.addChild(createShip(ship));
    });

    structures.value.forEach((structure) => {
        gameObjectsContainer!.addChild(createStructure(structure));
    });
}

function createShip(ship: GameShip): Container {
    const container = new Container();
    container.x = ship.position!.x;
    container.y = ship.position!.y;

    // 选中框
    if (selectedObjects.value.has(ship.instanceId)) {
        const selectionCircle = new Graphics();
        selectionCircle.circle(0, 0, 0.8);
        selectionCircle.fill({ color: 0xcccccc, alpha: 0.5 });
        selectionCircle.circle(0, 0, 0.8);
        selectionCircle.stroke({ width: 0.15, color: 0x000000 });
        container.addChild(selectionCircle);
    }

    // 图标
    const shipIcon = Sprite.from(`/assets/icons/ships/${ship.shipId}.svg`);
    shipIcon.anchor.set(0.5);
    shipIcon.width = 1;
    shipIcon.height = 1;
    container.addChild(shipIcon);

    // 标签
    const label = createLabel(ship.instanceId, 0.5, 0.7, 0);
    container.addChild(label);

    // 交互
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("click", (event) => {
        event.stopPropagation();
        handleObjectClick(ship.instanceId, event);
    });

    return container;
}

function createStructure(structure: GameStructure): Container {
    const container = new Container();
    container.x = structure.position.x;
    container.y = structure.position.y;

    // 选中框
    if (selectedObjects.value.has(structure.id)) {
        const selectionRect = new Graphics();
        selectionRect.rect(-0.9, -0.9, 1.8, 1.8);
        selectionRect.fill({ color: 0xcccccc, alpha: 0.5 });
        selectionRect.rect(-0.9, -0.9, 1.8, 1.8);
        selectionRect.stroke({ width: 0.15, color: 0x000000 });
        container.addChild(selectionRect);
    }

    // 图标
    const buildingIcon = Sprite.from(
        `/assets/icons/buildings/${structure.type}.svg`
    );
    buildingIcon.anchor.set(0.5);
    buildingIcon.width = 1.2;
    buildingIcon.height = 1.2;
    container.addChild(buildingIcon);

    // 标签
    const label = createLabel(structure.type, 0.5, 0.8, 0);
    container.addChild(label);

    // 交互
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("click", (event) => {
        event.stopPropagation();
        handleObjectClick(structure.id, event);
    });

    return container;
}

// ==================== 工具函数 ====================
function createLabel(
    text: string,
    fontSize: number,
    x: number,
    y: number
): Text {
    const label = new Text({
        text,
        style: new TextStyle({
            fontSize,
            fill: 0x000000,
            fontFamily: "Courier New, monospace",
            fontWeight: "700",
        }),
    });
    label.anchor.set(0, 0.5);
    label.x = x;
    label.y = y;
    return label;
}

// ==================== 交互事件 ====================
function handlePointerDown(event: any) {
    if (event.button !== 0) return;

    const worldPos = viewport!.toWorld(event.global);

    if (isPlacingBuilding.value && placingBuildingId.value) {
        placeBuilding(worldPos.x, worldPos.y);
        return;
    }

    isDraggingSelection.value = true;
    selectionStart.value = { x: worldPos.x, y: worldPos.y };
    selectionEnd.value = { x: worldPos.x, y: worldPos.y };
}

function handlePointerMove(event: any) {
    const worldPos = viewport!.toWorld(event.global);

    if (isPlacingBuilding.value) {
        drawBuildingPreview(worldPos.x, worldPos.y);
        return;
    }

    if (!isDraggingSelection.value || !selectionStart.value) return;

    selectionEnd.value = { x: worldPos.x, y: worldPos.y };
    drawSelectionBox();
}

function handlePointerUp(event: any) {
    if (
        !isDraggingSelection.value ||
        !selectionStart.value ||
        !selectionEnd.value
    ) {
        isDraggingSelection.value = false;
        return;
    }

    const start = selectionStart.value;
    const end = selectionEnd.value;
    const isClick =
        Math.abs(end.x - start.x) < 0.5 && Math.abs(end.y - start.y) < 0.5;

    if (isClick) {
        if (!event.ctrlKey && !event.metaKey) {
            selectedObjects.value.clear();
            renderGameObjects();
        }
    } else {
        performBoxSelection(start, end, event);
    }

    isDraggingSelection.value = false;
    selectionStart.value = null;
    selectionEnd.value = null;
    if (selectionBox) selectionBox.clear();
}

function handleRightClick(event: any) {
    event.preventDefault();

    if (isPlacingBuilding.value) {
        cancelBuildingPlacement();
        return;
    }

    const worldPos = viewport!.toWorld(event.global);
    const selectedShips = Array.from(selectedObjects.value).filter((id) =>
        ships.value.has(id)
    );

    if (selectedShips.length > 0) {
        selectedShips.forEach((shipId) => {
            const ship = ships.value.get(shipId);
            if (ship) {
                ship.position = { x: worldPos.x, y: worldPos.y, z: 0 };
            }
        });
        renderGameObjects();
    }
}

function performBoxSelection(
    start: { x: number; y: number },
    end: { x: number; y: number },
    event: any
) {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const selected = new Set<string>();

    ships.value.forEach((ship, id) => {
        if (
            ship.position &&
            ship.position.x >= minX &&
            ship.position.x <= maxX &&
            ship.position.y >= minY &&
            ship.position.y <= maxY
        ) {
            selected.add(id);
        }
    });

    structures.value.forEach((structure, id) => {
        if (
            structure.position.x >= minX &&
            structure.position.x <= maxX &&
            structure.position.y >= minY &&
            structure.position.y <= maxY
        ) {
            selected.add(id);
        }
    });

    if (event.ctrlKey || event.metaKey) {
        selected.forEach((id) => selectedObjects.value.add(id));
    } else {
        selectedObjects.value = selected;
    }

    renderGameObjects();
}

function drawSelectionBox() {
    if (!selectionBox || !selectionStart.value || !selectionEnd.value) return;

    selectionBox.clear();
    const start = selectionStart.value;
    const end = selectionEnd.value;
    const width = end.x - start.x;
    const height = end.y - start.y;

    selectionBox.rect(start.x, start.y, width, height);
    selectionBox.fill({ color: 0x050505, alpha: 0.1 });
    selectionBox.rect(start.x, start.y, width, height);
    selectionBox.stroke({ width: 0.1, color: 0x050505 });
}

function handleObjectClick(objectId: string, event?: any) {
    if (event && (event.ctrlKey || event.metaKey)) {
        if (selectedObjects.value.has(objectId)) {
            selectedObjects.value.delete(objectId);
        } else {
            selectedObjects.value.add(objectId);
        }
    } else {
        selectedObjects.value.clear();
        selectedObjects.value.add(objectId);
    }
    renderGameObjects();
}

// ==================== 天体相关 ====================
function selectBody(body: CelestialBody) {
    selectedBody.value = body;
}

function isCenterBody(body: CelestialBody): boolean {
    return props.galaxy?.centerBody.id === body.id;
}

// ==================== 建筑放置 ====================
function startBuildingPlacement(buildingId: string) {
    isPlacingBuilding.value = true;
    placingBuildingId.value = buildingId;
}

function cancelBuildingPlacement() {
    isPlacingBuilding.value = false;
    placingBuildingId.value = null;
    if (buildingPreview) buildingPreview.clear();
}

function drawBuildingPreview(x: number, y: number) {
    if (!buildingPreview) return;

    buildingPreview.clear();
    const gridX = Math.round(x);
    const gridY = Math.round(y);

    buildingPreview.rect(gridX - 0.6, gridY - 0.6, 1.2, 1.2);
    buildingPreview.fill({ color: 0xcccccc, alpha: 0.5 });
    buildingPreview.rect(gridX - 0.6, gridY - 0.6, 1.2, 1.2);
    buildingPreview.stroke({ width: 0.15, color: 0x000000 });
}

function placeBuilding(x: number, y: number) {
    if (!placingBuildingId.value) return;

    const gridX = Math.round(x);
    const gridY = Math.round(y);

    const newStructure: GameStructure = {
        id: `structure_${Date.now()}`,
        type: placingBuildingId.value,
        position: { x: gridX, y: gridY, z: 0 },
        cargo: new Map(),
        cargoCapacity: 500,
        cargoUsed: 0,
        ownerId: "player_1",
    };

    structures.value.set(newStructure.id, newStructure);
    renderGameObjects();
}

// ==================== 单位控制面板 ====================
function getSelectedUnitsInfo() {
    const units: Array<{
        id: string;
        type: "ship" | "structure";
        data: GameShip | GameStructure;
    }> = [];

    selectedObjects.value.forEach((id) => {
        if (ships.value.has(id)) {
            units.push({ id, type: "ship", data: ships.value.get(id)! });
        } else if (structures.value.has(id)) {
            units.push({
                id,
                type: "structure",
                data: structures.value.get(id)!,
            });
        }
    });

    return units;
}

function clearSelection() {
    selectedObjects.value.clear();
    renderGameObjects();
}

function handleCommand(command: string, params: any) {
    console.log("执行命令:", command, params);
}

function handleDemolish(structureId: string) {
    structures.value.delete(structureId);
    selectedObjects.value.delete(structureId);
    renderGameObjects();
}

// ==================== 资源路径 ====================
function getCelestialIconPath(type: CelestialType | string): string {
    const iconMap: Record<string, string> = {
        star: "/assets/icons/celestial/star.svg",
        black_hole: "/assets/icons/celestial/black-hole.svg",
        neutron_star: "/assets/icons/celestial/neutron-star.svg",
        pulsar: "/assets/icons/celestial/pulsar.svg",
        gas_giant: "/assets/icons/celestial/gas-giant.svg",
        ice_giant: "/assets/icons/celestial/gas-giant.svg",
        terrestrial: "/assets/icons/celestial/planet.svg",
        asteroid_belt: "/assets/icons/celestial/asteroid-belt.svg",
        dwarf_planet: "/assets/icons/celestial/planet.svg",
    };
    return iconMap[type] || "/assets/icons/celestial/planet.svg";
}

function getResourceIconPath(resourceType: string): string {
    return `/assets/icons/resources/primary/${resourceType}.svg`;
}

function getCelestialTypeName(type: CelestialType | string): string {
    const names: Record<string, string> = {
        star: "恒星",
        black_hole: "黑洞",
        neutron_star: "中子星",
        pulsar: "脉冲星",
        gas_giant: "气态巨星",
        ice_giant: "冰巨星",
        terrestrial: "类地行星",
        asteroid_belt: "小行星带",
        dwarf_planet: "矮行星",
    };
    return names[type] || "未知天体";
}

// ==================== 清理 ====================
function cleanup() {
    if (app) {
        app.destroy(true, { children: true });
        app = null;
    }
    viewport = null;
    bodiesContainer = null;
    gameObjectsContainer = null;
    selectionBox = null;
}

function goBack() {
    emit("back");
}
</script>

<style scoped>
.galaxy-view-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #eeeeee;
    display: flex;
    flex-direction: column;
}

.view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    background: #ffffff;
    border-bottom: 3px solid #000000;
}

.back-btn {
    padding: 8px 16px;
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

.back-btn:hover {
    background: #000000;
    color: #ffffff;
    box-shadow: 2px 2px 0 #000000;
    transform: translate(-1px, -1px);
}

.view-header h2 {
    margin: 0;
    color: #000000;
    font-size: 20px;
    font-weight: 700;
    font-family: "Courier New", monospace;
}

.header-info {
    color: #666666;
    font-size: 14px;
    font-family: "Courier New", monospace;
}

.view-canvas {
    flex: 1;
    width: 100%;
}

.celestial-list {
    position: absolute;
    left: 20px;
    top: 80px;
    width: 320px;
    max-height: calc(100% - 100px);
    background: #ffffff;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.panel-header {
    padding: 12px 15px;
    background: #000000;
    border-bottom: 3px solid #000000;
}

.panel-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    font-family: "Courier New", monospace;
}

.panel-content {
    padding: 15px;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: calc(100vh - 200px);
}

.body-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
    margin-bottom: 8px;
    background: #ffffff;
    border: 2px solid #cccccc;
    border-radius: 0;
    cursor: pointer;
    transition: all 0.1s;
    overflow: hidden;
}

.body-item:hover {
    background: #eeeeee;
    border-color: #000000;
    box-shadow: 2px 2px 0 #000000;
    transform: translate(-1px, -1px);
}

.body-item.center {
    border-color: #000000;
    border-width: 3px;
    background: #eeeeee;
}

.body-item.selected {
    background: #e8e8e8;
    border-color: #000000;
    border-width: 3px;
}

.body-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.body-icon img {
    width: 24px;
    height: 24px;
    image-rendering: pixelated;
}

.body-details {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.body-name {
    font-size: 14px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 4px;
    font-family: "Courier New", monospace;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.body-type {
    font-size: 12px;
    color: #666666;
    margin-bottom: 4px;
    font-family: "Courier New", monospace;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.body-resources {
    font-size: 11px;
    color: #333333;
    margin-top: 4px;
    font-family: "Courier New", monospace;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.resource-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    background: #f5f5f5;
    border: 1px solid #cccccc;
    border-radius: 2px;
}

.resource-icon {
    width: 14px;
    height: 14px;
    image-rendering: pixelated;
}

.building-menu-panel {
    position: absolute;
    right: 20px;
    top: 80px;
    width: 320px;
    max-height: calc(100% - 100px);
    background: #ffffff;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.celestial-info-panel {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 450px;
    background: #ffffff;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
    font-family: "Courier New", monospace;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: #000000;
    border-bottom: 3px solid #000000;
}

.info-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
}

.close-btn {
    background: #ffffff;
    border: 2px solid #ffffff;
    border-radius: 0;
    padding: 4px 10px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    color: #000000;
    transition: all 0.1s;
}

.close-btn:hover {
    background: #666666;
    border-color: #666666;
    color: #ffffff;
}

.info-content {
    padding: 15px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 8px 0;
    border-bottom: 1px solid #eeeeee;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-weight: 700;
    color: #666666;
    font-size: 13px;
}

.info-value {
    color: #000000;
    font-size: 13px;
}

.info-resources {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
}

.resource-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: #f5f5f5;
    border: 2px solid #000000;
    border-radius: 0;
    font-size: 12px;
    font-weight: 700;
}

::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #eeeeee;
}

::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 0;
    border: 1px solid #000000;
}

::-webkit-scrollbar-thumb:hover {
    background: #999999;
}
</style>
