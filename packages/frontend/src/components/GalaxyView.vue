<template>
  <div class="galaxy-view-container">
    <div class="view-header">
      <button @click="goBack" class="back-btn">← 返回星系地图</button>
      <h2>{{ galaxy?.name || '加载中...' }}</h2>
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

    <!-- 建造菜单 -->
    <BuildingMenu 
      @place-building="startBuildingPlacement"
    />

    <div class="celestial-list">
      <h3>天体列表</h3>
      <div class="body-item" v-for="body in sortedBodies" :key="body.id"
           :class="{ 'center': isCenterBody(body) }"
           @click="focusOnBody(body)">
        <div class="body-icon">
          <img :src="getCelestialIconPath(body.type)" :alt="getCelestialTypeName(body.type)" />
        </div>
        <div class="body-details">
          <div class="body-name">{{ body.name }}</div>
          <div class="body-type">{{ getCelestialTypeName(body.type) }}</div>
          <div v-if="body.resources && body.resources.length > 0" class="body-resources">
            资源: {{ body.resources.join(', ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Application, Graphics, Container, Text, TextStyle, Sprite, Assets } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import type { Galaxy, CelestialBody, CelestialType, GameShip, GameResourceNode, GameStructure } from '@galaxy-traveler/shared';
import UnitControlPanel from './UnitControlPanel.vue';
import BuildingMenu from './BuildingMenu.vue';

const props = defineProps<{
  galaxy: Galaxy
}>();

const emit = defineEmits<{
  back: []
}>();

const viewCanvas = ref<HTMLDivElement | null>(null);

let app: Application | null = null;
let viewport: Viewport | null = null;
let bodiesContainer: Container | null = null;
let gameObjectsContainer: Container | null = null;
let assetsLoaded = false;

// 游戏对象数据（模拟数据，后续从后端获取）
const ships = ref<Map<string, GameShip>>(new Map());
const resourceNodes = ref<Map<string, GameResourceNode>>(new Map());
const structures = ref<Map<string, GameStructure>>(new Map());

// 选中的对象
const selectedObjects = ref<Set<string>>(new Set());

// 框选相关
const isDraggingSelection = ref(false);
const selectionStart = ref<{ x: number; y: number } | null>(null);
const selectionEnd = ref<{ x: number; y: number } | null>(null);
let selectionBox: Graphics | null = null;

// 建筑放置相关
const isPlacingBuilding = ref(false);
const placingBuildingId = ref<string | null>(null);
let buildingPreview: Graphics | null = null;

const sortedBodies = computed(() => {
  if (!props.galaxy) return [];
  return [...props.galaxy.bodies].sort((a, b) => {
    const aOrbit = a.orbitRadius || 0;
    const bOrbit = b.orbitRadius || 0;
    return aOrbit - bOrbit;
  });
});

onMounted(async () => {
  await initializeView();
});

onUnmounted(() => {
  cleanup();
});

async function initializeView() {
  if (!viewCanvas.value || !props.galaxy) return;

  try {
    // 预加载所有图标资源
    if (!assetsLoaded) {
      await loadAssets();
      assetsLoaded = true;
    }

    app = new Application();
    await app.init({
      width: viewCanvas.value.clientWidth,
      height: viewCanvas.value.clientHeight,
      backgroundColor: 0xFFFFFF,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    viewCanvas.value.appendChild(app.canvas);

    // 创建 viewport (坐标系统: 50x50，中心在25,25)
    viewport = new Viewport({
      screenWidth: viewCanvas.value.clientWidth,
      screenHeight: viewCanvas.value.clientHeight,
      worldWidth: 50,
      worldHeight: 50,
      events: app.renderer.events,
    });

    app.stage.addChild(viewport);

    // 启用拖拽和缩放
    viewport
      .drag({
        mouseButtons: 'middle' // 只用中键拖拽地图
      })
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: 'all' })
      .clampZoom({
        minScale: 2.0,
        maxScale: 15.0
      });

    // 添加框选图层
    selectionBox = new Graphics();
    viewport.addChild(selectionBox);

    // 添加建筑预览图层
    buildingPreview = new Graphics();
    viewport.addChild(buildingPreview);

    // 设置viewport交互
    viewport.eventMode = 'static';
    
    // 左键框选/放置
    viewport.on('pointerdown', handlePointerDown);
    viewport.on('pointermove', handlePointerMove);
    viewport.on('pointerup', handlePointerUp);
    
    // 右键命令/取消
    viewport.on('rightclick', handleRightClick);

    // 绘制星系视图
    renderGalaxyView();
    
    // 居中视图到(0,0) - 中心点在(25,25)
    viewport.moveCenter(25, 25);
    viewport.setZoom(Math.min(viewCanvas.value.clientWidth, viewCanvas.value.clientHeight) / 50);
  } catch (error) {
    console.error('初始化星系视图失败:', error);
  }
}

async function loadAssets() {
  try {
    // 定义所有需要加载的天体图标
    const assets = [
      { alias: 'celestial-star', src: '/assets/icons/celestial/star.svg' },
      { alias: 'celestial-black-hole', src: '/assets/icons/celestial/black-hole.svg' },
      { alias: 'celestial-neutron-star', src: '/assets/icons/celestial/neutron-star.svg' },
      { alias: 'celestial-pulsar', src: '/assets/icons/celestial/pulsar.svg' },
      { alias: 'celestial-gas-giant', src: '/assets/icons/celestial/gas-giant.svg' },
      { alias: 'celestial-planet', src: '/assets/icons/celestial/planet.svg' },
      { alias: 'celestial-asteroid-belt', src: '/assets/icons/celestial/asteroid-belt.svg' },
    ];

    // 批量加载所有资源
    await Assets.load(assets.map(asset => asset.src));
  } catch (error) {
    console.error('加载天体图标资源失败:', error);
  }
}

function renderGalaxyView() {
  if (!viewport || !props.galaxy) return;

  // 绘制网格
  const gridLayer = new Container();
  viewport.addChild(gridLayer);
  drawGrid(gridLayer);

  // 绘制天体容器
  bodiesContainer = new Container();
  viewport.addChild(bodiesContainer);

  // 绘制天体（不再绘制轨道）
  props.galaxy.bodies.forEach(body => {
    const node = createBodyNode(body);
    bodiesContainer!.addChild(node);
  });

  // 绘制游戏对象容器
  gameObjectsContainer = new Container();
  viewport.addChild(gameObjectsContainer);

  // 初始化测试数据
  initializeTestGameObjects();
  
  // 渲染游戏对象
  renderGameObjects();

  // 动画循环
  app!.ticker.add(() => {
    animateBodies();
    updateGameObjects();
  });
}

function drawGrid(container: Container) {
  const grid = new Graphics();
  
  // 绘制垂直线 (50x50网格)
  for (let x = 0; x <= 50; x += 1) {
    const isMainLine = x % 10 === 0;
    const lineWidth = isMainLine ? 0.05 : 0.02;
    const lineColor = isMainLine ? 0x000000 : 0xCCCCCC;
    const lineAlpha = isMainLine ? 0.5 : 0.3;
    
    grid.moveTo(x, 0);
    grid.lineTo(x, 50);
    grid.stroke({ width: lineWidth, color: lineColor, alpha: lineAlpha });
  }
  
  // 绘制水平线
  for (let y = 0; y <= 50; y += 1) {
    const isMainLine = y % 10 === 0;
    const lineWidth = isMainLine ? 0.05 : 0.02;
    const lineColor = isMainLine ? 0x000000 : 0xCCCCCC;
    const lineAlpha = isMainLine ? 0.5 : 0.3;
    
    grid.moveTo(0, y);
    grid.lineTo(50, y);
    grid.stroke({ width: lineWidth, color: lineColor, alpha: lineAlpha });
  }
  
  // 绘制中心轴线（更加明显） - 中心在(25,25)
  grid.moveTo(25, 0);
  grid.lineTo(25, 50);
  grid.stroke({ width: 0.1, color: 0xFF0000, alpha: 0.5 });
  
  grid.moveTo(0, 25);
  grid.lineTo(50, 25);
  grid.stroke({ width: 0.1, color: 0xFF0000, alpha: 0.5 });
  
  container.addChild(grid);
}

function createBodyNode(body: CelestialBody): Container {
  const container = new Container();
  
  // 计算位置（坐标系统：中心在(25,25)，即坐标0,0）
  if (body.orbitRadius) {
    const angle = body.orbitAngle || 0;
    container.x = 25 + Math.cos(angle) * body.orbitRadius;
    container.y = 25 + Math.sin(angle) * body.orbitRadius;
  } else {
    // 中心天体在(25,25)
    container.x = 25;
    container.y = 25;
  }

  // 使用SVG图标
  const iconPath = getCelestialIconPath(body.type);
  const size = getBodySize(body);
  
  // 创建图标精灵
  const icon = Sprite.from(iconPath);
  icon.anchor.set(0.5);
  icon.width = size;
  icon.height = size;
  
  container.addChild(icon);

  // 名称标签
  const label = new Text({
    text: body.name,
    style: new TextStyle({
      fontSize: 0.8,
      fill: 0x000000,
      fontFamily: 'Courier New, monospace',
      fontWeight: '700',
    }),
  });
  label.anchor.set(0, 0.5);
  label.x = size / 2 + 0.3;
  label.y = 0;
  container.addChild(label);

  container.eventMode = 'static';
  container.cursor = 'pointer';

  return container;
}

function getBodySize(body: CelestialBody): number {
  switch (body.type) {
    case 'star':
    case 'black_hole':
    case 'neutron_star':
    case 'pulsar':
      return 2.5;
    case 'gas_giant':
    case 'ice_giant':
      return 1.8;
    case 'terrestrial':
      return 1.2;
    case 'asteroid_belt':
      return 1.0;
    default:
      return 1.0;
  }
}

function animateBodies() {
  // 简单的轨道动画
  // 可以在这里添加天体的轨道运动
}

// 初始化测试游戏对象数据
function initializeTestGameObjects() {
  // 创建测试飞船
  const testShip: GameShip = {
    instanceId: 'ship_1',
    shipId: 'engineer_1',
    ownerId: 'player_1',
    currentHealth: 100,
    position: { x: 25, y: 22, z: 0 },
    status: 'idle' as any,
    cargo: new Map(),
    cargoCapacity: 100,
    logs: [],
  };
  ships.value.set(testShip.instanceId, testShip);

  // 创建测试资源节点
  const testResource: GameResourceNode = {
    id: 'resource_iron_1',
    resourceType: 'iron_ore' as any,
    position: { x: 28, y: 25, z: 0 },
    amount: 1000,
    currentAmount: 1000,
    lastHarvestTick: 0,
  };
  resourceNodes.value.set(testResource.id, testResource);

  // 创建测试建筑
  const testStructure: GameStructure = {
    id: 'storage_1',
    type: 'storage',
    position: { x: 22, y: 25, z: 0 },
    cargo: new Map(),
    cargoCapacity: 500,
    cargoUsed: 0,
    ownerId: 'player_1',
  };
  structures.value.set(testStructure.id, testStructure);
}

// 渲染游戏对象
function renderGameObjects() {
  if (!gameObjectsContainer) return;

  // 清空容器
  gameObjectsContainer.removeChildren();

  // 渲染资源节点
  resourceNodes.value.forEach(node => {
    const sprite = createResourceNode(node);
    gameObjectsContainer!.addChild(sprite);
  });

  // 渲染建筑
  structures.value.forEach(structure => {
    const sprite = createStructure(structure);
    gameObjectsContainer!.addChild(sprite);
  });

  // 渲染飞船
  ships.value.forEach(ship => {
    const sprite = createShip(ship);
    gameObjectsContainer!.addChild(sprite);
  });
}

// 创建飞船精灵
function createShip(ship: GameShip): Container {
  const container = new Container();
  container.x = ship.position!.x;
  container.y = ship.position!.y;

  // 飞船图标
  const graphics = new Graphics();
  const isSelected = selectedObjects.value.has(ship.instanceId);
  
  // 绘制选中框
  if (isSelected) {
    graphics.circle(0, 0, 0.8);
    graphics.fill({ color: 0x00FFFF, alpha: 0.3 });
    graphics.circle(0, 0, 0.8);
    graphics.stroke({ width: 0.1, color: 0x00FFFF });
  }

  // 绘制飞船主体
  graphics.circle(0, 0, 0.5);
  graphics.fill({ color: 0x4444FF });
  graphics.circle(0, 0, 0.5);
  graphics.stroke({ width: 0.1, color: 0x000000 });

  container.addChild(graphics);

  // 飞船ID标签
  const label = new Text({
    text: ship.instanceId,
    style: new TextStyle({
      fontSize: 0.5,
      fill: 0x000000,
      fontFamily: 'Courier New, monospace',
      fontWeight: '700',
    }),
  });
  label.anchor.set(0, 0.5);
  label.x = 0.7;
  label.y = 0;
  container.addChild(label);

  // 添加交互
  container.eventMode = 'static';
  container.cursor = 'pointer';
  container.on('click', () => {
    handleObjectClick(ship.instanceId);
  });

  return container;
}

// 创建资源节点精灵
function createResourceNode(node: GameResourceNode): Container {
  const container = new Container();
  container.x = node.position.x;
  container.y = node.position.y;

  const graphics = new Graphics();
  
  // 绘制资源节点
  graphics.rect(-0.4, -0.4, 0.8, 0.8);
  graphics.fill({ color: 0xFF8800 });
  graphics.rect(-0.4, -0.4, 0.8, 0.8);
  graphics.stroke({ width: 0.1, color: 0x000000 });

  container.addChild(graphics);

  // 资源标签
  const label = new Text({
    text: node.resourceType,
    style: new TextStyle({
      fontSize: 0.4,
      fill: 0x000000,
      fontFamily: 'Courier New, monospace',
      fontWeight: '700',
    }),
  });
  label.anchor.set(0, 0.5);
  label.x = 0.6;
  label.y = 0;
  container.addChild(label);

  // 添加交互
  container.eventMode = 'static';
  container.cursor = 'pointer';
  container.on('click', () => {
    console.log('点击资源节点:', node.id);
  });

  return container;
}

// 创建建筑精灵
function createStructure(structure: GameStructure): Container {
  const container = new Container();
  container.x = structure.position.x;
  container.y = structure.position.y;

  const graphics = new Graphics();
  const isSelected = selectedObjects.value.has(structure.id);

  // 绘制选中框
  if (isSelected) {
    graphics.rect(-0.9, -0.9, 1.8, 1.8);
    graphics.fill({ color: 0x00FF00, alpha: 0.3 });
    graphics.rect(-0.9, -0.9, 1.8, 1.8);
    graphics.stroke({ width: 0.1, color: 0x00FF00 });
  }

  // 绘制建筑主体
  graphics.rect(-0.6, -0.6, 1.2, 1.2);
  graphics.fill({ color: 0x888888 });
  graphics.rect(-0.6, -0.6, 1.2, 1.2);
  graphics.stroke({ width: 0.15, color: 0x000000 });

  container.addChild(graphics);

  // 建筑标签
  const label = new Text({
    text: structure.type,
    style: new TextStyle({
      fontSize: 0.5,
      fill: 0x000000,
      fontFamily: 'Courier New, monospace',
      fontWeight: '700',
    }),
  });
  label.anchor.set(0, 0.5);
  label.x = 0.8;
  label.y = 0;
  container.addChild(label);

  // 添加交互
  container.eventMode = 'static';
  container.cursor = 'pointer';
  container.on('click', () => {
    handleObjectClick(structure.id);
  });

  return container;
}

// 更新游戏对象
function updateGameObjects() {
  // 这里会接收后端更新并重新渲染对象
  // 暂时保持静态
}

// 处理对象点击
function handleObjectClick(objectId: string, event?: MouseEvent) {
  console.log('选中对象:', objectId);
  
  // 按住Ctrl多选
  if (event && (event.ctrlKey || event.metaKey)) {
    if (selectedObjects.value.has(objectId)) {
      selectedObjects.value.delete(objectId);
    } else {
      selectedObjects.value.add(objectId);
    }
  } else {
    // 单选
    selectedObjects.value.clear();
    selectedObjects.value.add(objectId);
  }
  
  // 重新渲染以显示选中状态
  renderGameObjects();
}

// 鼠标按下 - 开始框选或放置建筑
function handlePointerDown(event: any) {
  if (event.button !== 0) return; // 只处理左键
  
  const worldPos = viewport!.toWorld(event.global);
  
  // 如果正在放置建筑，点击确认放置
  if (isPlacingBuilding.value && placingBuildingId.value) {
    placeBuilding(worldPos.x, worldPos.y);
    return;
  }
  
  // 否则开始框选
  isDraggingSelection.value = true;
  selectionStart.value = { x: worldPos.x, y: worldPos.y };
  selectionEnd.value = { x: worldPos.x, y: worldPos.y };
}

// 鼠标移动 - 更新框选框或建筑预览
function handlePointerMove(event: any) {
  const worldPos = viewport!.toWorld(event.global);
  
  // 如果正在放置建筑，显示预览
  if (isPlacingBuilding.value) {
    drawBuildingPreview(worldPos.x, worldPos.y);
    return;
  }
  
  // 否则处理框选
  if (!isDraggingSelection.value || !selectionStart.value) return;
  
  selectionEnd.value = { x: worldPos.x, y: worldPos.y };
  
  // 绘制框选框
  drawSelectionBox();
}

// 鼠标松开 - 完成框选
function handlePointerUp(event: any) {
  if (!isDraggingSelection.value || !selectionStart.value || !selectionEnd.value) {
    isDraggingSelection.value = false;
    return;
  }
  
  const start = selectionStart.value;
  const end = selectionEnd.value;
  
  // 计算框选矩形
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);
  
  // 如果是点击（框选范围很小），则取消选择
  const isClick = Math.abs(end.x - start.x) < 0.5 && Math.abs(end.y - start.y) < 0.5;
  
  if (isClick) {
    // 点击空白处取消选择
    if (!event.ctrlKey && !event.metaKey) {
      selectedObjects.value.clear();
      renderGameObjects();
    }
  } else {
    // 框选飞船和建筑
    const selected = new Set<string>();
    
    ships.value.forEach((ship, id) => {
      if (ship.position &&
          ship.position.x >= minX && ship.position.x <= maxX &&
          ship.position.y >= minY && ship.position.y <= maxY) {
        selected.add(id);
      }
    });
    
    structures.value.forEach((structure, id) => {
      if (structure.position.x >= minX && structure.position.x <= maxX &&
          structure.position.y >= minY && structure.position.y <= maxY) {
        selected.add(id);
      }
    });
    
    // 更新选中对象
    if (event.ctrlKey || event.metaKey) {
      // Ctrl多选
      selected.forEach(id => selectedObjects.value.add(id));
    } else {
      selectedObjects.value = selected;
    }
    
    renderGameObjects();
  }
  
  // 清除框选状态
  isDraggingSelection.value = false;
  selectionStart.value = null;
  selectionEnd.value = null;
  if (selectionBox) {
    selectionBox.clear();
  }
}

// 绘制框选框
function drawSelectionBox() {
  if (!selectionBox || !selectionStart.value || !selectionEnd.value) return;
  
  selectionBox.clear();
  
  const start = selectionStart.value;
  const end = selectionEnd.value;
  const width = end.x - start.x;
  const height = end.y - start.y;
  
  selectionBox.rect(start.x, start.y, width, height);
  selectionBox.fill({ color: 0x00FF00, alpha: 0.1 });
  selectionBox.rect(start.x, start.y, width, height);
  selectionBox.stroke({ width: 0.1, color: 0x00FF00 });
}

// 右键命令或取消
function handleRightClick(event: any) {
  event.preventDefault();
  
  // 如果正在放置建筑，右键取消
  if (isPlacingBuilding.value) {
    cancelBuildingPlacement();
    return;
  }
  
  const worldPos = viewport!.toWorld(event.global);
  console.log('右键点击:', worldPos);
  
  // 如果有选中的飞船，下达移动命令
  const selectedShips = Array.from(selectedObjects.value).filter(id => ships.value.has(id));
  
  if (selectedShips.length > 0) {
    console.log(`命令 ${selectedShips.length} 艘飞船移动到 (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)})`);
    
    // TODO: 发送移动命令到后端
    selectedShips.forEach(shipId => {
      const ship = ships.value.get(shipId);
      if (ship) {
        // 临时：直接更新位置（后续通过后端处理）
        ship.position = { x: worldPos.x, y: worldPos.y, z: 0 };
      }
    });
    
    renderGameObjects();
  }
}

function getCelestialIconPath(type: CelestialType | string): string {
  const iconMap: Record<string, string> = {
    'star': '/assets/icons/celestial/star.svg',
    'black_hole': '/assets/icons/celestial/black-hole.svg',
    'neutron_star': '/assets/icons/celestial/neutron-star.svg',
    'pulsar': '/assets/icons/celestial/pulsar.svg',
    'gas_giant': '/assets/icons/celestial/gas-giant.svg',
    'ice_giant': '/assets/icons/celestial/gas-giant.svg',
    'terrestrial': '/assets/icons/celestial/planet.svg',
    'asteroid_belt': '/assets/icons/celestial/asteroid-belt.svg',
    'dwarf_planet': '/assets/icons/celestial/planet.svg',
  };
  return iconMap[type] || '/assets/icons/celestial/planet.svg';
}

function getCelestialTypeName(type: CelestialType | string): string {
  const names: Record<string, string> = {
    'star': '恒星',
    'black_hole': '黑洞',
    'neutron_star': '中子星',
    'pulsar': '脉冲星',
    'gas_giant': '气态巨星',
    'ice_giant': '冰巨星',
    'terrestrial': '类地行星',
    'asteroid_belt': '小行星带',
    'dwarf_planet': '矮行星',
  };
  return names[type] || '未知天体';
}

function isCenterBody(body: CelestialBody): boolean {
  return props.galaxy?.centerBody.id === body.id;
}

function focusOnBody(body: CelestialBody) {
  console.log('聚焦到天体:', body.name);
  // 可以添加相机动画到天体
}

function goBack() {
  emit('back');
}

// 获取选中单位信息
function getSelectedUnitsInfo() {
  const units: Array<{ id: string; type: 'ship' | 'structure'; data: GameShip | GameStructure }> = [];
  
  selectedObjects.value.forEach(id => {
    if (ships.value.has(id)) {
      units.push({
        id,
        type: 'ship',
        data: ships.value.get(id)!,
      });
    } else if (structures.value.has(id)) {
      units.push({
        id,
        type: 'structure',
        data: structures.value.get(id)!,
      });
    }
  });
  
  return units;
}

// 清空选择
function clearSelection() {
  selectedObjects.value.clear();
  renderGameObjects();
}

// 处理命令
function handleCommand(command: string, params: any) {
  console.log('执行命令:', command, params);
  // TODO: 发送命令到后端
}

// 处理拆除建筑
function handleDemolish(structureId: string) {
  console.log('拆除建筑:', structureId);
  // TODO: 发送拆除命令到后端
  structures.value.delete(structureId);
  selectedObjects.value.delete(structureId);
  renderGameObjects();
}

// 开始建筑放置
function startBuildingPlacement(buildingId: string) {
  console.log('开始放置建筑:', buildingId);
  isPlacingBuilding.value = true;
  placingBuildingId.value = buildingId;
}

// 取消建筑放置
function cancelBuildingPlacement() {
  console.log('取消建筑放置');
  isPlacingBuilding.value = false;
  placingBuildingId.value = null;
  if (buildingPreview) {
    buildingPreview.clear();
  }
}

// 绘制建筑预览
function drawBuildingPreview(x: number, y: number) {
  if (!buildingPreview) return;
  
  buildingPreview.clear();
  
  // 对齐到网格
  const gridX = Math.round(x);
  const gridY = Math.round(y);
  
  // 绘制半透明建筑预览
  buildingPreview.rect(gridX - 0.6, gridY - 0.6, 1.2, 1.2);
  buildingPreview.fill({ color: 0x00FF00, alpha: 0.3 });
  buildingPreview.rect(gridX - 0.6, gridY - 0.6, 1.2, 1.2);
  buildingPreview.stroke({ width: 0.15, color: 0x00FF00 });
}

// 放置建筑
function placeBuilding(x: number, y: number) {
  if (!placingBuildingId.value) return;
  
  // 对齐到网格
  const gridX = Math.round(x);
  const gridY = Math.round(y);
  
  console.log(`放置建筑 ${placingBuildingId.value} 在 (${gridX}, ${gridY})`);
  
  // 创建新建筑
  const newStructure: GameStructure = {
    id: `structure_${Date.now()}`,
    type: placingBuildingId.value,
    position: { x: gridX, y: gridY, z: 0 },
    cargo: new Map(),
    cargoCapacity: 500,
    cargoUsed: 0,
    ownerId: 'player_1',
  };
  
  structures.value.set(newStructure.id, newStructure);
  
  // TODO: 发送建造命令到后端
  
  // 渲染新建筑
  renderGameObjects();
  
  // 不取消放置模式，允许连续放置
  // cancelBuildingPlacement();
}

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
</script>

<style scoped>
.galaxy-view-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #EEEEEE;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #FFFFFF;
  border-bottom: 3px solid #000000;
}

.back-btn {
  padding: 8px 16px;
  background: #FFFFFF;
  border: 2px solid #000000;
  border-radius: 0;
  color: #000000;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  transition: all 0.1s;
}

.back-btn:hover {
  background: #000000;
  color: #FFFFFF;
  box-shadow: 2px 2px 0 #000000;
  transform: translate(-1px, -1px);
}

.view-header h2 {
  margin: 0;
  color: #000000;
  font-size: 20px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.header-info {
  color: #666666;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

.view-canvas {
  flex: 1;
  width: 100%;
}

.celestial-list {
  position: absolute;
  left: 20px;
  top: 80px;
  width: 280px;
  max-height: calc(100% - 100px);
  background: #FFFFFF;
  border: 3px solid #000000;
  border-radius: 0;
  padding: 15px;
  overflow-y: auto;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
}

.celestial-list h3 {
  margin: 0 0 12px 0;
  color: #000000;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  border-bottom: 2px solid #000000;
  padding-bottom: 8px;
}

.body-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: #FFFFFF;
  border: 2px solid #CCCCCC;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.1s;
}

.body-item:hover {
  background: #EEEEEE;
  border-color: #000000;
  box-shadow: 2px 2px 0 #000000;
  transform: translate(-1px, -1px);
}

.body-item.center {
  border-color: #000000;
  border-width: 3px;
  background: #EEEEEE;
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
}

.body-name {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.body-type {
  font-size: 12px;
  color: #666666;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.body-resources {
  font-size: 11px;
  color: #333333;
  margin-top: 4px;
  font-family: 'Courier New', monospace;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #EEEEEE;
}

::-webkit-scrollbar-thumb {
  background: #CCCCCC;
  border-radius: 0;
  border: 1px solid #000000;
}

::-webkit-scrollbar-thumb:hover {
  background: #999999;
}
</style>

