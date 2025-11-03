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
import type { Galaxy, CelestialBody, CelestialType } from '@galaxy-traveler/shared';

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
let assetsLoaded = false;

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
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clamp({ direction: 'all' })
      .clampZoom({
        minScale: 2.0,
        maxScale: 15.0
      });

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

  // 动画循环
  app!.ticker.add(() => {
    animateBodies();
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

function cleanup() {
  if (app) {
    app.destroy(true, { children: true });
    app = null;
  }
  viewport = null;
  bodiesContainer = null;
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

