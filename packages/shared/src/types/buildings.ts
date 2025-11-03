/**
 * 建筑类型定义
 */

// 建筑基础类型
export enum BuildingCategory {
  MINING = 'mining',           // 采矿设施
  PROCESSING = 'processing',   // 加工设施
  CONSTRUCTION = 'construction' // 建造设施
}

// 采矿设施子类型
export enum MiningFacilityType {
  ORE_EXTRACTOR = 'ore_extractor',           // 矿石提取器
  GAS_HARVESTER = 'gas_harvester',           // 气体采集器
  CRYSTAL_MINER = 'crystal_miner',           // 晶体采矿机
  LIQUID_PUMP = 'liquid_pump',               // 液体泵
  ADVANCED_MINING_COMPLEX = 'advanced_mining_complex' // 高级采矿综合体
}

// 加工设施子类型
export enum ProcessingFacilityType {
  BASIC_REFINERY = 'basic_refinery',         // 基础精炼厂
  ADVANCED_REFINERY = 'advanced_refinery',   // 高级精炼厂
  CHEMICAL_PLANT = 'chemical_plant',         // 化工厂
  ASSEMBLY_PLANT = 'assembly_plant',         // 组装厂
  HIGH_TECH_FABRICATOR = 'high_tech_fabricator' // 高科技制造厂
}

// 建造设施子类型
export enum ConstructionFacilityType {
  SHIPYARD = 'shipyard',                     // 船坞
  COMPONENT_FACTORY = 'component_factory',   // 部件工厂
  STRUCTURE_CONSTRUCTOR = 'structure_constructor', // 结构建造器
  REPAIR_STATION = 'repair_station',         // 维修站
  RESEARCH_LAB = 'research_lab'              // 研究实验室
}

// 建筑基础属性
export interface BaseBuilding {
  id: string;
  name: string;
  category: BuildingCategory;
  level: number;                    // 建筑等级
  buildCost: ResourceCost[];        // 建造成本
  buildTime: number;                // 建造时间（秒）
  powerConsumption: number;         // 能源消耗
  maxHealth: number;                // 最大生命值
  description?: string;             // 描述
}

// 资源成本
export interface ResourceCost {
  resourceId: string;
  amount: number;
}

// 采矿设施
export interface MiningFacility extends BaseBuilding {
  category: BuildingCategory.MINING;
  facilityType: MiningFacilityType;
  outputResource: string;           // 产出资源ID
  outputRate: number;               // 产出速率（单位/小时）
  workersRequired: number;          // 所需工人数
  miningRange?: number;             // 采矿范围
}

// 加工配方
export interface ProcessingRecipe {
  recipeId: string;
  name: string;
  inputs: ResourceCost[];           // 输入资源
  outputs: ResourceCost[];          // 输出资源
  processingTime: number;           // 加工时间（秒）
  tier: 1 | 2 | 3;                  // 加工等级（对应一产->二产、二产->三产等）
}

// 加工设施
export interface ProcessingFacility extends BaseBuilding {
  category: BuildingCategory.PROCESSING;
  facilityType: ProcessingFacilityType;
  supportedRecipes: string[];       // 支持的配方ID列表
  processingSlots: number;          // 同时加工槽位数
  efficiencyBonus: number;          // 效率加成（百分比）
  tier: 1 | 2 | 3;                  // 设施等级（决定能加工的配方等级）
}

// 建造队列项
export interface ConstructionQueueItem {
  itemType: 'ship' | 'component' | 'building';
  itemId: string;
  quantity: number;
  remainingTime: number;
}

// 建造设施
export interface ConstructionFacility extends BaseBuilding {
  category: BuildingCategory.CONSTRUCTION;
  facilityType: ConstructionFacilityType;
  constructionQueue: ConstructionQueueItem[];
  queueSize: number;                // 队列容量
  constructionSpeedMultiplier: number; // 建造速度倍率
  supportedTypes: string[];         // 支持建造的类型
}

// 建筑联合类型
export type Building = MiningFacility | ProcessingFacility | ConstructionFacility;

// 建筑实例（玩家建造的建筑）
export interface BuildingInstance {
  instanceId: string;
  buildingId: string;               // 关联的建筑模板ID
  ownerId: string;                  // 拥有者ID
  position: {
    x: number;
    y: number;
    z: number;
  };
  currentHealth: number;            // 当前生命值
  status: BuildingStatus;
  constructionProgress?: number;    // 建造进度（0-100）
  activeRecipe?: string;            // 当前激活的配方ID（加工设施用）
  storageContent?: Map<string, number>; // 存储内容（资源ID -> 数量）
}

// 建筑状态
export enum BuildingStatus {
  CONSTRUCTING = 'constructing',    // 建造中
  IDLE = 'idle',                    // 空闲
  ACTIVE = 'active',                // 运行中
  PAUSED = 'paused',                // 暂停
  DAMAGED = 'damaged',              // 损坏
  DESTROYED = 'destroyed'           // 已摧毁
}

