/**
 * 游戏基础数据配置
 * 使用共享类型定义
 */

import {
    Warship,
    WarshipType,
    ShipCategory,
    ComponentSlotType,
    ExplorerShip,
    EngineerShip,
    MiningFacility,
    MiningFacilityType,
    BuildingCategory,
    ProcessingFacility,
    ProcessingFacilityType,
    ProcessingRecipe,
    PrimaryResource,
    PrimaryResourceType,
    ResourceTier,
    SecondaryResource,
    SecondaryResourceType,
    TertiaryResource,
    TertiaryResourceType
} from '@galaxy-traveler/shared';

// ==================== 船舶配置 ====================

// 战舰配置
export const WARSHIPS: Warship[] = [
    {
        id: 'destroyer_mk1',
        name: '驱逐舰 MK1',
        category: ShipCategory.WARSHIP,
        type: WarshipType.DESTROYER,
        componentSlots: [
            { type: ComponentSlotType.WEAPON, size: 2, count: 2 },
            { type: ComponentSlotType.DEFENSE, size: 1, count: 1 },
            { type: ComponentSlotType.ENGINE, size: 2, count: 1 },
            { type: ComponentSlotType.UTILITY, size: 1, count: 2 }
        ],
        componentCapacity: 100,
        baseStats: {
            health: 5000,
            armor: 100,
            speed: 250
        }
    },
    {
        id: 'cruiser_mk1',
        name: '巡洋舰 MK1',
        category: ShipCategory.WARSHIP,
        type: WarshipType.CRUISER,
        componentSlots: [
            { type: ComponentSlotType.WEAPON, size: 3, count: 4 },
            { type: ComponentSlotType.DEFENSE, size: 2, count: 2 },
            { type: ComponentSlotType.ENGINE, size: 2, count: 1 },
            { type: ComponentSlotType.UTILITY, size: 2, count: 3 }
        ],
        componentCapacity: 200,
        baseStats: {
            health: 12000,
            armor: 250,
            speed: 180
        }
    },
    {
        id: 'battleship_mk1',
        name: '战列舰 MK1',
        category: ShipCategory.WARSHIP,
        type: WarshipType.BATTLESHIP,
        componentSlots: [
            { type: ComponentSlotType.WEAPON, size: 4, count: 6 },
            { type: ComponentSlotType.DEFENSE, size: 3, count: 4 },
            { type: ComponentSlotType.ENGINE, size: 3, count: 2 },
            { type: ComponentSlotType.UTILITY, size: 2, count: 4 }
        ],
        componentCapacity: 400,
        baseStats: {
            health: 30000,
            armor: 600,
            speed: 120
        }
    }
];

// 探索船配置
export const EXPLORER_SHIPS: ExplorerShip[] = [
    {
        id: 'explorer_t1',
        name: '探索船 I型',
        category: ShipCategory.EXPLORER,
        level: 1,
        bonus: {
            weaponBonus: 5,
            healthBonus: 10,
            speedBonus: 15,
            scanRange: 1000
        },
        baseStats: {
            health: 3000,
            speed: 200,
            cargoCapacity: 500
        }
    },
    {
        id: 'explorer_t3',
        name: '探索船 III型',
        category: ShipCategory.EXPLORER,
        level: 3,
        bonus: {
            weaponBonus: 15,
            healthBonus: 30,
            speedBonus: 35,
            scanRange: 3000
        },
        baseStats: {
            health: 6000,
            speed: 240,
            cargoCapacity: 1500
        }
    },
    {
        id: 'explorer_t5',
        name: '探索船 V型',
        category: ShipCategory.EXPLORER,
        level: 5,
        bonus: {
            weaponBonus: 35,
            healthBonus: 60,
            speedBonus: 65,
            scanRange: 6000
        },
        baseStats: {
            health: 12000,
            speed: 300,
            cargoCapacity: 3000
        }
    }
];

// 工程船配置
export const ENGINEER_SHIPS: EngineerShip[] = [
    {
        id: 'engineer_t1',
        name: '工程船 I型',
        category: ShipCategory.ENGINEER,
        level: 1,
        bonus: {
            capacityBonus: 10,
            speedBonus: 5,
            constructionSpeedBonus: 10,
            miningEfficiency: 10
        },
        baseStats: {
            health: 2500,
            speed: 150,
            cargoCapacity: 1000,
            constructionPower: 100
        }
    },
    {
        id: 'engineer_t3',
        name: '工程船 III型',
        category: ShipCategory.ENGINEER,
        level: 3,
        bonus: {
            capacityBonus: 30,
            speedBonus: 15,
            constructionSpeedBonus: 30,
            miningEfficiency: 30
        },
        baseStats: {
            health: 5000,
            speed: 180,
            cargoCapacity: 2500,
            constructionPower: 300
        }
    },
    {
        id: 'engineer_t5',
        name: '工程船 V型',
        category: ShipCategory.ENGINEER,
        level: 5,
        bonus: {
            capacityBonus: 60,
            speedBonus: 30,
            constructionSpeedBonus: 60,
            miningEfficiency: 60
        },
        baseStats: {
            health: 10000,
            speed: 220,
            cargoCapacity: 5000,
            constructionPower: 600
        }
    }
];

// ==================== 建筑配置 ====================

// 采矿设施配置
export const MINING_FACILITIES: MiningFacility[] = [
    {
        id: 'ore_extractor_basic',
        name: '基础矿石提取器',
        category: BuildingCategory.MINING,
        facilityType: MiningFacilityType.ORE_EXTRACTOR,
        level: 1,
        buildCost: [
            { resourceId: 'iron_plate', amount: 50 },
            { resourceId: 'copper_plate', amount: 30 }
        ],
        buildTime: 300,
        powerConsumption: 10,
        maxHealth: 5000,
        outputResource: 'iron_ore',
        outputRate: 100,
        workersRequired: 2,
        miningRange: 500
    },
    {
        id: 'gas_harvester_basic',
        name: '基础气体采集器',
        category: BuildingCategory.MINING,
        facilityType: MiningFacilityType.GAS_HARVESTER,
        level: 1,
        buildCost: [
            { resourceId: 'iron_plate', amount: 40 },
            { resourceId: 'copper_plate', amount: 40 },
            { resourceId: 'basic_circuit', amount: 10 }
        ],
        buildTime: 400,
        powerConsumption: 15,
        maxHealth: 4000,
        outputResource: 'hydrogen_gas',
        outputRate: 80,
        workersRequired: 1,
        miningRange: 1000
    }
];

// 加工设施配置
export const PROCESSING_FACILITIES: ProcessingFacility[] = [
    {
        id: 'basic_refinery',
        name: '基础精炼厂',
        category: BuildingCategory.PROCESSING,
        facilityType: ProcessingFacilityType.BASIC_REFINERY,
        level: 1,
        buildCost: [
            { resourceId: 'iron_plate', amount: 100 },
            { resourceId: 'copper_plate', amount: 50 }
        ],
        buildTime: 600,
        powerConsumption: 20,
        maxHealth: 8000,
        supportedRecipes: ['iron_ore_to_plate', 'copper_ore_to_plate'],
        processingSlots: 2,
        efficiencyBonus: 0,
        tier: 1
    },
    {
        id: 'advanced_refinery',
        name: '高级精炼厂',
        category: BuildingCategory.PROCESSING,
        facilityType: ProcessingFacilityType.ADVANCED_REFINERY,
        level: 2,
        buildCost: [
            { resourceId: 'iron_plate', amount: 200 },
            { resourceId: 'titanium_alloy', amount: 100 },
            { resourceId: 'basic_circuit', amount: 50 }
        ],
        buildTime: 1200,
        powerConsumption: 40,
        maxHealth: 15000,
        supportedRecipes: ['titanium_ore_to_alloy', 'rare_metal_processing'],
        processingSlots: 3,
        efficiencyBonus: 20,
        tier: 2
    },
    {
        id: 'chemical_plant',
        name: '化工厂',
        category: BuildingCategory.PROCESSING,
        facilityType: ProcessingFacilityType.CHEMICAL_PLANT,
        level: 1,
        buildCost: [
            { resourceId: 'iron_plate', amount: 150 },
            { resourceId: 'copper_plate', amount: 100 },
            { resourceId: 'basic_circuit', amount: 30 }
        ],
        buildTime: 900,
        powerConsumption: 30,
        maxHealth: 10000,
        supportedRecipes: ['plastic_production', 'fuel_production', 'chemical_reagent'],
        processingSlots: 2,
        efficiencyBonus: 0,
        tier: 1
    }
];

// 加工配方配置
export const PROCESSING_RECIPES: ProcessingRecipe[] = [
    {
        recipeId: 'iron_ore_to_plate',
        name: '铁板精炼',
        inputs: [{ resourceId: 'iron_ore', amount: 10 }],
        outputs: [{ resourceId: 'iron_plate', amount: 5 }],
        processingTime: 30,
        tier: 1
    },
    {
        recipeId: 'copper_ore_to_plate',
        name: '铜板精炼',
        inputs: [{ resourceId: 'copper_ore', amount: 10 }],
        outputs: [{ resourceId: 'copper_plate', amount: 5 }],
        processingTime: 30,
        tier: 1
    },
    {
        recipeId: 'plastic_production',
        name: '塑料生产',
        inputs: [
            { resourceId: 'crude_oil', amount: 20 },
            { resourceId: 'hydrogen_gas', amount: 10 }
        ],
        outputs: [{ resourceId: 'plastic', amount: 10 }],
        processingTime: 60,
        tier: 1
    },
    {
        recipeId: 'basic_circuit_production',
        name: '基础电路生产',
        inputs: [
            { resourceId: 'copper_plate', amount: 5 },
            { resourceId: 'iron_plate', amount: 2 },
            { resourceId: 'plastic', amount: 3 }
        ],
        outputs: [{ resourceId: 'basic_circuit', amount: 2 }],
        processingTime: 90,
        tier: 2
    }
];

// ==================== 资源配置 ====================

// 一产资源配置
export const PRIMARY_RESOURCES: PrimaryResource[] = [
    {
        id: 'iron_ore',
        name: '铁矿石',
        tier: ResourceTier.PRIMARY,
        resourceType: PrimaryResourceType.IRON_ORE,
        stackSize: 1000,
        mass: 1,
        value: 1,
        minableBy: ['engineer_ship', 'mining_facility'],
        abundance: 100
    },
    {
        id: 'copper_ore',
        name: '铜矿石',
        tier: ResourceTier.PRIMARY,
        resourceType: PrimaryResourceType.COPPER_ORE,
        stackSize: 1000,
        mass: 1,
        value: 2,
        minableBy: ['engineer_ship', 'mining_facility'],
        abundance: 80
    },
    {
        id: 'titanium_ore',
        name: '钛矿石',
        tier: ResourceTier.PRIMARY,
        resourceType: PrimaryResourceType.TITANIUM_ORE,
        stackSize: 500,
        mass: 1.5,
        value: 5,
        minableBy: ['engineer_ship', 'mining_facility'],
        abundance: 30
    },
    {
        id: 'hydrogen_gas',
        name: '氢气',
        tier: ResourceTier.PRIMARY,
        resourceType: PrimaryResourceType.HYDROGEN_GAS,
        stackSize: 500,
        mass: 0.1,
        value: 3,
        minableBy: ['mining_facility'],
        abundance: 60
    },
    {
        id: 'energy_crystal',
        name: '能量晶体',
        tier: ResourceTier.PRIMARY,
        resourceType: PrimaryResourceType.ENERGY_CRYSTAL,
        stackSize: 200,
        mass: 2,
        value: 10,
        minableBy: ['mining_facility'],
        abundance: 15
    }
];

// 二产资源配置
export const SECONDARY_RESOURCES: SecondaryResource[] = [
    {
        id: 'iron_plate',
        name: '铁板',
        tier: ResourceTier.SECONDARY,
        resourceType: SecondaryResourceType.IRON_PLATE,
        stackSize: 500,
        mass: 2,
        value: 3,
        requiredFacilityTier: 1,
        productionRecipes: ['iron_ore_to_plate']
    },
    {
        id: 'copper_plate',
        name: '铜板',
        tier: ResourceTier.SECONDARY,
        resourceType: SecondaryResourceType.COPPER_PLATE,
        stackSize: 500,
        mass: 2,
        value: 5,
        requiredFacilityTier: 1,
        productionRecipes: ['copper_ore_to_plate']
    },
    {
        id: 'titanium_alloy',
        name: '钛合金',
        tier: ResourceTier.SECONDARY,
        resourceType: SecondaryResourceType.TITANIUM_ALLOY,
        stackSize: 200,
        mass: 3,
        value: 15,
        requiredFacilityTier: 1,
        productionRecipes: ['titanium_ore_to_alloy']
    },
    {
        id: 'plastic',
        name: '塑料',
        tier: ResourceTier.SECONDARY,
        resourceType: SecondaryResourceType.PLASTIC,
        stackSize: 300,
        mass: 0.5,
        value: 8,
        requiredFacilityTier: 1,
        productionRecipes: ['plastic_production']
    },
    {
        id: 'basic_circuit',
        name: '基础电路',
        tier: ResourceTier.SECONDARY,
        resourceType: SecondaryResourceType.BASIC_CIRCUIT,
        stackSize: 200,
        mass: 1,
        value: 20,
        requiredFacilityTier: 1,
        productionRecipes: ['basic_circuit_production']
    }
];

// 三产资源配置
export const TERTIARY_RESOURCES: TertiaryResource[] = [
    {
        id: 'composite_material',
        name: '复合材料',
        tier: ResourceTier.TERTIARY,
        resourceType: TertiaryResourceType.COMPOSITE_MATERIAL,
        stackSize: 100,
        mass: 5,
        value: 50,
        requiredFacilityTier: 2,
        productionRecipes: ['composite_material_production']
    },
    {
        id: 'advanced_circuit',
        name: '高级电路',
        tier: ResourceTier.TERTIARY,
        resourceType: TertiaryResourceType.ADVANCED_CIRCUIT,
        stackSize: 100,
        mass: 2,
        value: 80,
        requiredFacilityTier: 2,
        productionRecipes: ['advanced_circuit_production']
    },
    {
        id: 'weapon_component',
        name: '武器部件',
        tier: ResourceTier.TERTIARY,
        resourceType: TertiaryResourceType.WEAPON_COMPONENT,
        stackSize: 50,
        mass: 10,
        value: 200,
        requiredFacilityTier: 3,
        productionRecipes: ['weapon_component_production'],
        isStrategic: true
    }
];

// 导出所有配置
export const GAME_DATA = {
    ships: {
        warships: WARSHIPS,
        explorers: EXPLORER_SHIPS,
        engineers: ENGINEER_SHIPS
    },
    buildings: {
        mining: MINING_FACILITIES,
        processing: PROCESSING_FACILITIES
    },
    recipes: PROCESSING_RECIPES,
    resources: {
        primary: PRIMARY_RESOURCES,
        secondary: SECONDARY_RESOURCES,
        tertiary: TERTIARY_RESOURCES
    }
};

