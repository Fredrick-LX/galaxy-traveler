<template>
  <div class="building-menu" :class="{ 'expanded': isExpanded }">
    <!-- 切换按钮 -->
    <button @click="toggleMenu" class="menu-toggle">
      {{ isExpanded ? '◀' : '▶' }} 建造
    </button>

    <!-- 建造菜单内容 -->
    <div v-if="isExpanded" class="menu-content">
      <div class="menu-header">
        <h3>建造菜单</h3>
      </div>

      <!-- 建筑分类 -->
      <div class="building-categories">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="selectedCategory = category.id"
          class="category-btn"
          :class="{ 'active': selectedCategory === category.id }"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 建筑列表 -->
      <div class="building-list">
        <div 
          v-for="building in filteredBuildings" 
          :key="building.id"
          @click="selectBuilding(building)"
          class="building-item"
          :class="{ 'selected': selectedBuilding?.id === building.id }"
        >
          <div class="building-icon">
            <img :src="building.icon" :alt="building.name" />
          </div>
          <div class="building-info">
            <div class="building-name">{{ building.name }}</div>
            <div class="building-desc">{{ building.description }}</div>
            <div class="building-cost">
              <span 
                v-for="cost in building.cost" 
                :key="cost.resource"
                class="cost-item"
              >
                {{ cost.resource }}: {{ cost.amount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前选中建筑详情 -->
      <div v-if="selectedBuilding" class="selected-building-info">
        <h4>{{ selectedBuilding.name }}</h4>
        <p>{{ selectedBuilding.description }}</p>
        <div class="action-btns">
          <button @click="startPlacement" class="place-btn">
            放置建筑
          </button>
          <button @click="cancelSelection" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface BuildingInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  cost: Array<{ resource: string; amount: number }>;
}

const emit = defineEmits<{
  placeBuilding: [buildingId: string];
}>();

const isExpanded = ref(false);
const selectedCategory = ref('mining');
const selectedBuilding = ref<BuildingInfo | null>(null);

const categories = [
  { id: 'mining', name: '采矿设施' },
  { id: 'processing', name: '加工设施' },
  { id: 'construction', name: '建造设施' },
];

// 建筑数据（示例）
const buildings = ref<BuildingInfo[]>([
  {
    id: 'ore_extractor',
    name: '矿石提取器',
    description: '采集铁、铜、钛等矿石',
    category: 'mining',
    icon: '/assets/icons/buildings/ore_extractor.svg',
    cost: [
      { resource: '铁板', amount: 50 },
      { resource: '铜板', amount: 30 },
    ],
  },
  {
    id: 'gas_harvester',
    name: '气体采集器',
    description: '采集氢气、氦气等气体',
    category: 'mining',
    icon: '/assets/icons/buildings/gas_harvester.svg',
    cost: [
      { resource: '铁板', amount: 40 },
      { resource: '塑料', amount: 20 },
    ],
  },
  {
    id: 'crystal_miner',
    name: '晶体采矿机',
    description: '采集能量晶体等稀有资源',
    category: 'mining',
    icon: '/assets/icons/buildings/crystal_miner.svg',
    cost: [
      { resource: '钛合金', amount: 30 },
      { resource: '高级电路', amount: 10 },
    ],
  },
  {
    id: 'basic_refinery',
    name: '基础精炼厂',
    description: '加工一级资源为二级资源',
    category: 'processing',
    icon: '/assets/icons/buildings/basic_refinery.svg',
    cost: [
      { resource: '铁板', amount: 80 },
      { resource: '基础电路', amount: 20 },
    ],
  },
  {
    id: 'chemical_plant',
    name: '化工厂',
    description: '生产化学品和塑料',
    category: 'processing',
    icon: '/assets/icons/buildings/chemical_plant.svg',
    cost: [
      { resource: '铁板', amount: 60 },
      { resource: '塑料', amount: 40 },
    ],
  },
  {
    id: 'shipyard',
    name: '船坞',
    description: '建造各类船舶',
    category: 'construction',
    icon: '/assets/icons/buildings/shipyard.svg',
    cost: [
      { resource: '钛合金', amount: 100 },
      { resource: '高级电路', amount: 50 },
    ],
  },
  {
    id: 'repair_station',
    name: '维修站',
    description: '修复损坏的船舶和建筑',
    category: 'construction',
    icon: '/assets/icons/buildings/repair_station.svg',
    cost: [
      { resource: '铁板', amount: 70 },
      { resource: '基础电路', amount: 30 },
    ],
  },
]);

const filteredBuildings = computed(() => {
  return buildings.value.filter(b => b.category === selectedCategory.value);
});

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

function selectBuilding(building: BuildingInfo) {
  selectedBuilding.value = building;
}

function startPlacement() {
  if (selectedBuilding.value) {
    emit('placeBuilding', selectedBuilding.value.id);
    // 不关闭菜单，允许连续放置
  }
}

function cancelSelection() {
  selectedBuilding.value = null;
}
</script>

<style scoped>
.building-menu {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  font-family: 'Courier New', monospace;
  transition: all 0.3s;
}

.menu-toggle {
  padding: 12px 16px;
  background: #FFFFFF;
  border: 3px solid #000000;
  border-radius: 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.1s;
}

.menu-toggle:hover {
  background: #000000;
  color: #FFFFFF;
  box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.3);
  transform: translate(-1px, -1px);
}

.building-menu.expanded .menu-toggle {
  border-bottom: none;
  box-shadow: none;
}

.menu-content {
  background: #FFFFFF;
  border: 3px solid #000000;
  border-top: none;
  max-width: 350px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.menu-header {
  padding: 12px 16px;
  background: #EEEEEE;
  border-bottom: 2px solid #000000;
}

.menu-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #000000;
}

.building-categories {
  display: flex;
  border-bottom: 2px solid #000000;
}

.category-btn {
  flex: 1;
  padding: 10px;
  background: #FFFFFF;
  border: none;
  border-right: 2px solid #000000;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #666666;
  transition: all 0.1s;
}

.category-btn:last-child {
  border-right: none;
}

.category-btn:hover {
  background: #F5F5F5;
}

.category-btn.active {
  background: #000000;
  color: #FFFFFF;
}

.building-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.building-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  margin-bottom: 8px;
  background: #FFFFFF;
  border: 2px solid #CCCCCC;
  cursor: pointer;
  transition: all 0.1s;
}

.building-item:hover {
  border-color: #000000;
  background: #F5F5F5;
}

.building-item.selected {
  border-color: #000000;
  border-width: 3px;
  background: #E6F7FF;
}

.building-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EEEEEE;
  border: 2px solid #000000;
}

.building-icon img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.building-info {
  flex: 1;
  min-width: 0;
}

.building-name {
  font-size: 13px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
}

.building-desc {
  font-size: 11px;
  color: #666666;
  margin-bottom: 6px;
}

.building-cost {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cost-item {
  font-size: 10px;
  padding: 2px 6px;
  background: #FFE7BA;
  border: 1px solid #FFA940;
  color: #D46B08;
}

.selected-building-info {
  padding: 12px 16px;
  background: #F5F5F5;
  border-top: 2px solid #000000;
}

.selected-building-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 700;
  color: #000000;
}

.selected-building-info p {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #666666;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.place-btn,
.cancel-btn {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #000000;
  border-radius: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  transition: all 0.1s;
}

.place-btn {
  background: #52C41A;
  color: #FFFFFF;
}

.place-btn:hover {
  background: #389E0D;
  box-shadow: 2px 2px 0 #000000;
  transform: translate(-1px, -1px);
}

.cancel-btn {
  background: #FFFFFF;
  color: #000000;
}

.cancel-btn:hover {
  background: #000000;
  color: #FFFFFF;
  box-shadow: 2px 2px 0 #000000;
  transform: translate(-1px, -1px);
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

