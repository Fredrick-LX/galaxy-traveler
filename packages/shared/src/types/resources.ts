/**
 * 资源类型定义
 */

// 资源生产等级
export enum ResourceTier {
  PRIMARY = 1,    // 一产：直接产出
  SECONDARY = 2,  // 二产：加工一产获得
  TERTIARY = 3,   // 三产：加工一产和二产获得
  QUATERNARY = 4  // 四产：使用三产过程中产出
}

// 一产资源类型
export enum PrimaryResourceType {
  // 矿石类
  IRON_ORE = 'iron_ore',                    // 铁矿石
  COPPER_ORE = 'copper_ore',                // 铜矿石
  TITANIUM_ORE = 'titanium_ore',            // 钛矿石
  RARE_METAL_ORE = 'rare_metal_ore',        // 稀有金属矿石
  
  // 气体类
  HYDROGEN_GAS = 'hydrogen_gas',            // 氢气
  HELIUM_GAS = 'helium_gas',                // 氦气
  NITROGEN_GAS = 'nitrogen_gas',            // 氮气
  
  // 晶体类
  ENERGY_CRYSTAL = 'energy_crystal',        // 能量晶体
  SILICON_CRYSTAL = 'silicon_crystal',      // 硅晶体
  
  // 液体类
  CRUDE_OIL = 'crude_oil',                  // 原油
  WATER = 'water'                           // 水
}

// 二产资源类型
export enum SecondaryResourceType {
  // 金属
  IRON_PLATE = 'iron_plate',                // 铁板
  COPPER_PLATE = 'copper_plate',            // 铜板
  TITANIUM_ALLOY = 'titanium_alloy',        // 钛合金
  RARE_METAL_INGOT = 'rare_metal_ingot',    // 稀有金属锭
  
  // 化学品
  PLASTIC = 'plastic',                      // 塑料
  FUEL = 'fuel',                            // 燃料
  CHEMICAL_REAGENT = 'chemical_reagent',    // 化学试剂
  
  // 电子元件
  BASIC_CIRCUIT = 'basic_circuit',          // 基础电路
  SILICON_WAFER = 'silicon_wafer',          // 硅晶圆
  
  // 能源
  POWER_CELL = 'power_cell'                 // 能量电池
}

// 三产资源类型
export enum TertiaryResourceType {
  // 高级材料
  COMPOSITE_MATERIAL = 'composite_material',     // 复合材料
  SUPERCONDUCTOR = 'superconductor',             // 超导体
  NANO_MATERIAL = 'nano_material',               // 纳米材料
  
  // 高级组件
  ADVANCED_CIRCUIT = 'advanced_circuit',         // 高级电路
  QUANTUM_PROCESSOR = 'quantum_processor',       // 量子处理器
  REACTOR_CORE = 'reactor_core',                 // 反应堆核心
  
  // 装备部件
  WEAPON_COMPONENT = 'weapon_component',         // 武器部件
  ARMOR_PLATE = 'armor_plate',                   // 装甲板
  ENGINE_MODULE = 'engine_module',               // 引擎模块
  SHIELD_GENERATOR = 'shield_generator'          // 护盾发生器
}

// 四产资源类型（使用三产过程中产生的副产品或特殊资源）
export enum QuaternaryResourceType {
  // 研究点数
  RESEARCH_DATA = 'research_data',               // 研究数据
  
  // 稀有资源
  ANTIMATTER = 'antimatter',                     // 反物质
  DARK_MATTER = 'dark_matter',                   // 暗物质
  EXOTIC_PARTICLES = 'exotic_particles',         // 奇异粒子
  
  // 特殊货币
  TECH_POINTS = 'tech_points',                   // 科技点
  STRATEGIC_RESOURCE = 'strategic_resource'      // 战略资源
}

// 资源基础属性
export interface BaseResource {
  id: string;
  name: string;
  tier: ResourceTier;
  description?: string;
  stackSize: number;              // 堆叠上限
  mass: number;                   // 单位质量
  value: number;                  // 基础价值
}

// 一产资源
export interface PrimaryResource extends BaseResource {
  tier: ResourceTier.PRIMARY;
  resourceType: PrimaryResourceType;
  minableBy: ('engineer_ship' | 'mining_facility')[]; // 可被何种方式开采
  abundance: number;              // 丰度（影响产量）
}

// 二产资源
export interface SecondaryResource extends BaseResource {
  tier: ResourceTier.SECONDARY;
  resourceType: SecondaryResourceType;
  requiredFacilityTier: 1;        // 需要的加工设施等级
  productionRecipes: string[];     // 相关的生产配方ID
}

// 三产资源
export interface TertiaryResource extends BaseResource {
  tier: ResourceTier.TERTIARY;
  resourceType: TertiaryResourceType;
  requiredFacilityTier: 2 | 3;    // 需要的加工设施等级
  productionRecipes: string[];     // 相关的生产配方ID
  isStrategic?: boolean;           // 是否为战略资源
}

// 四产资源
export interface QuaternaryResource extends BaseResource {
  tier: ResourceTier.QUATERNARY;
  resourceType: QuaternaryResourceType;
  sourceProcess: string[];         // 产生来源（哪些三产生产过程）
  canTrade: boolean;               // 是否可交易
}

// 资源联合类型
export type Resource = PrimaryResource | SecondaryResource | TertiaryResource | QuaternaryResource;

// 资源实例（玩家拥有的资源）
export interface ResourceInstance {
  resourceId: string;
  ownerId: string;
  amount: number;
  location: ResourceLocation;
}

// 资源位置
export interface ResourceLocation {
  type: 'ship' | 'building' | 'storage' | 'warehouse';
  id: string;                      // 所在船/建筑/仓库的ID
  position?: {
    x: number;
    y: number;
    z: number;
  };
}

// 资源流转记录
export interface ResourceTransaction {
  transactionId: string;
  timestamp: number;
  fromPlayerId?: string;
  toPlayerId?: string;
  resourceId: string;
  amount: number;
  type: TransactionType;
  reason?: string;
}

// 交易类型
export enum TransactionType {
  PRODUCTION = 'production',       // 生产获得
  CONSUMPTION = 'consumption',     // 消耗
  TRADE = 'trade',                 // 交易
  TRANSFER = 'transfer',           // 转移
  DESTRUCTION = 'destruction'      // 摧毁损失
}

