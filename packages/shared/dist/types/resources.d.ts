/**
 * 资源类型定义
 */
export declare enum ResourceTier {
    PRIMARY = 1,// 一产：直接产出
    SECONDARY = 2,// 二产：加工一产获得
    TERTIARY = 3,// 三产：加工一产和二产获得
    QUATERNARY = 4
}
export declare enum PrimaryResourceType {
    IRON_ORE = "iron_ore",// 铁矿石
    COPPER_ORE = "copper_ore",// 铜矿石
    TITANIUM_ORE = "titanium_ore",// 钛矿石
    RARE_METAL_ORE = "rare_metal_ore",// 稀有金属矿石
    HYDROGEN_GAS = "hydrogen_gas",// 氢气
    HELIUM_GAS = "helium_gas",// 氦气
    NITROGEN_GAS = "nitrogen_gas",// 氮气
    ENERGY_CRYSTAL = "energy_crystal",// 能量晶体
    SILICON_CRYSTAL = "silicon_crystal",// 硅晶体
    CRUDE_OIL = "crude_oil",// 原油
    WATER = "water"
}
export declare enum SecondaryResourceType {
    IRON_PLATE = "iron_plate",// 铁板
    COPPER_PLATE = "copper_plate",// 铜板
    TITANIUM_ALLOY = "titanium_alloy",// 钛合金
    RARE_METAL_INGOT = "rare_metal_ingot",// 稀有金属锭
    PLASTIC = "plastic",// 塑料
    FUEL = "fuel",// 燃料
    CHEMICAL_REAGENT = "chemical_reagent",// 化学试剂
    BASIC_CIRCUIT = "basic_circuit",// 基础电路
    SILICON_WAFER = "silicon_wafer",// 硅晶圆
    POWER_CELL = "power_cell"
}
export declare enum TertiaryResourceType {
    COMPOSITE_MATERIAL = "composite_material",// 复合材料
    SUPERCONDUCTOR = "superconductor",// 超导体
    NANO_MATERIAL = "nano_material",// 纳米材料
    ADVANCED_CIRCUIT = "advanced_circuit",// 高级电路
    QUANTUM_PROCESSOR = "quantum_processor",// 量子处理器
    REACTOR_CORE = "reactor_core",// 反应堆核心
    WEAPON_COMPONENT = "weapon_component",// 武器部件
    ARMOR_PLATE = "armor_plate",// 装甲板
    ENGINE_MODULE = "engine_module",// 引擎模块
    SHIELD_GENERATOR = "shield_generator"
}
export declare enum QuaternaryResourceType {
    RESEARCH_DATA = "research_data",// 研究数据
    ANTIMATTER = "antimatter",// 反物质
    DARK_MATTER = "dark_matter",// 暗物质
    EXOTIC_PARTICLES = "exotic_particles",// 奇异粒子
    TECH_POINTS = "tech_points",// 科技点
    STRATEGIC_RESOURCE = "strategic_resource"
}
export interface BaseResource {
    id: string;
    name: string;
    tier: ResourceTier;
    description?: string;
    stackSize: number;
    mass: number;
    value: number;
}
export interface PrimaryResource extends BaseResource {
    tier: ResourceTier.PRIMARY;
    resourceType: PrimaryResourceType;
    minableBy: ('engineer_ship' | 'mining_facility')[];
    abundance: number;
}
export interface SecondaryResource extends BaseResource {
    tier: ResourceTier.SECONDARY;
    resourceType: SecondaryResourceType;
    requiredFacilityTier: 1;
    productionRecipes: string[];
}
export interface TertiaryResource extends BaseResource {
    tier: ResourceTier.TERTIARY;
    resourceType: TertiaryResourceType;
    requiredFacilityTier: 2 | 3;
    productionRecipes: string[];
    isStrategic?: boolean;
}
export interface QuaternaryResource extends BaseResource {
    tier: ResourceTier.QUATERNARY;
    resourceType: QuaternaryResourceType;
    sourceProcess: string[];
    canTrade: boolean;
}
export type Resource = PrimaryResource | SecondaryResource | TertiaryResource | QuaternaryResource;
export interface ResourceInstance {
    resourceId: string;
    ownerId: string;
    amount: number;
    location: ResourceLocation;
}
export interface ResourceLocation {
    type: 'ship' | 'building' | 'storage' | 'warehouse';
    id: string;
    position?: {
        x: number;
        y: number;
        z: number;
    };
}
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
export declare enum TransactionType {
    PRODUCTION = "production",// 生产获得
    CONSUMPTION = "consumption",// 消耗
    TRADE = "trade",// 交易
    TRANSFER = "transfer",// 转移
    DESTRUCTION = "destruction"
}
