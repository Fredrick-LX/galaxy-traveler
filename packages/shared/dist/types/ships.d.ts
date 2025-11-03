/**
 * 船舶类型定义
 */
export declare enum ShipCategory {
    WARSHIP = "warship",// 战舰
    EXPLORER = "explorer",// 探索船
    ENGINEER = "engineer"
}
export declare enum WarshipType {
    DESTROYER = "destroyer",// 驱逐舰
    CRUISER = "cruiser",// 巡洋舰
    BATTLESHIP = "battleship",// 战列舰
    AIRCRAFT_CARRIER = "aircraft_carrier"
}
export declare enum ComponentSlotType {
    WEAPON = "weapon",// 武器槽
    DEFENSE = "defense",// 防御槽
    ENGINE = "engine",// 引擎槽
    UTILITY = "utility"
}
export interface ComponentSlot {
    type: ComponentSlotType;
    size: number;
    count: number;
}
export interface Warship {
    id: string;
    name: string;
    category: ShipCategory.WARSHIP;
    type: WarshipType;
    componentSlots: ComponentSlot[];
    componentCapacity: number;
    baseStats: {
        health: number;
        armor: number;
        speed: number;
    };
}
export type ExplorerLevel = 1 | 2 | 3 | 4 | 5;
export interface ExplorerBonus {
    weaponBonus: number;
    healthBonus: number;
    speedBonus: number;
    scanRange: number;
}
export interface ExplorerShip {
    id: string;
    name: string;
    category: ShipCategory.EXPLORER;
    level: ExplorerLevel;
    bonus: ExplorerBonus;
    baseStats: {
        health: number;
        speed: number;
        cargoCapacity: number;
    };
}
export type EngineerLevel = 1 | 2 | 3 | 4 | 5;
export interface EngineerBonus {
    capacityBonus: number;
    speedBonus: number;
    constructionSpeedBonus: number;
    miningEfficiency: number;
}
export interface EngineerShip {
    id: string;
    name: string;
    category: ShipCategory.ENGINEER;
    level: EngineerLevel;
    bonus: EngineerBonus;
    baseStats: {
        health: number;
        speed: number;
        cargoCapacity: number;
        constructionPower: number;
    };
}
export type Ship = Warship | ExplorerShip | EngineerShip;
export interface ShipInstance {
    instanceId: string;
    shipId: string;
    ownerId: string;
    currentHealth: number;
    position?: {
        x: number;
        y: number;
        z: number;
    };
    status: ShipStatus;
    components?: string[];
}
export declare enum ShipStatus {
    IDLE = "idle",// 空闲
    MOVING = "moving",// 移动中
    MINING = "mining",// 采集中
    CONSTRUCTING = "constructing",// 建造中
    COMBAT = "combat",// 战斗中
    DESTROYED = "destroyed"
}
