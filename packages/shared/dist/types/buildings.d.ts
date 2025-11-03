/**
 * 建筑类型定义
 */
export declare enum BuildingCategory {
    MINING = "mining",// 采矿设施
    PROCESSING = "processing",// 加工设施
    CONSTRUCTION = "construction"
}
export declare enum MiningFacilityType {
    ORE_EXTRACTOR = "ore_extractor",// 矿石提取器
    GAS_HARVESTER = "gas_harvester",// 气体采集器
    CRYSTAL_MINER = "crystal_miner",// 晶体采矿机
    LIQUID_PUMP = "liquid_pump",// 液体泵
    ADVANCED_MINING_COMPLEX = "advanced_mining_complex"
}
export declare enum ProcessingFacilityType {
    BASIC_REFINERY = "basic_refinery",// 基础精炼厂
    ADVANCED_REFINERY = "advanced_refinery",// 高级精炼厂
    CHEMICAL_PLANT = "chemical_plant",// 化工厂
    ASSEMBLY_PLANT = "assembly_plant",// 组装厂
    HIGH_TECH_FABRICATOR = "high_tech_fabricator"
}
export declare enum ConstructionFacilityType {
    SHIPYARD = "shipyard",// 船坞
    COMPONENT_FACTORY = "component_factory",// 部件工厂
    STRUCTURE_CONSTRUCTOR = "structure_constructor",// 结构建造器
    REPAIR_STATION = "repair_station",// 维修站
    RESEARCH_LAB = "research_lab"
}
export interface BaseBuilding {
    id: string;
    name: string;
    category: BuildingCategory;
    level: number;
    buildCost: ResourceCost[];
    buildTime: number;
    powerConsumption: number;
    maxHealth: number;
    description?: string;
}
export interface ResourceCost {
    resourceId: string;
    amount: number;
}
export interface MiningFacility extends BaseBuilding {
    category: BuildingCategory.MINING;
    facilityType: MiningFacilityType;
    outputResource: string;
    outputRate: number;
    workersRequired: number;
    miningRange?: number;
}
export interface ProcessingRecipe {
    recipeId: string;
    name: string;
    inputs: ResourceCost[];
    outputs: ResourceCost[];
    processingTime: number;
    tier: 1 | 2 | 3;
}
export interface ProcessingFacility extends BaseBuilding {
    category: BuildingCategory.PROCESSING;
    facilityType: ProcessingFacilityType;
    supportedRecipes: string[];
    processingSlots: number;
    efficiencyBonus: number;
    tier: 1 | 2 | 3;
}
export interface ConstructionQueueItem {
    itemType: 'ship' | 'component' | 'building';
    itemId: string;
    quantity: number;
    remainingTime: number;
}
export interface ConstructionFacility extends BaseBuilding {
    category: BuildingCategory.CONSTRUCTION;
    facilityType: ConstructionFacilityType;
    constructionQueue: ConstructionQueueItem[];
    queueSize: number;
    constructionSpeedMultiplier: number;
    supportedTypes: string[];
}
export type Building = MiningFacility | ProcessingFacility | ConstructionFacility;
export interface BuildingInstance {
    instanceId: string;
    buildingId: string;
    ownerId: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    currentHealth: number;
    status: BuildingStatus;
    constructionProgress?: number;
    activeRecipe?: string;
    storageContent?: Map<string, number>;
}
export declare enum BuildingStatus {
    CONSTRUCTING = "constructing",// 建造中
    IDLE = "idle",// 空闲
    ACTIVE = "active",// 运行中
    PAUSED = "paused",// 暂停
    DAMAGED = "damaged",// 损坏
    DESTROYED = "destroyed"
}
