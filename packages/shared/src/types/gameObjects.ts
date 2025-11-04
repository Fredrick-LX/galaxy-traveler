/**
 * 游戏运行时对象定义
 */

import { ShipInstance, ShipStatus } from './ships';
import { PrimaryResourceType } from './resources';

// ==================== 基础类型 ====================

// 游戏对象位置
export interface Position {
    x: number;
    y: number;
    z?: number;
}

// 游戏常量
export const GAME_CONSTANTS = {
    // 返回码
    OK: 0,
    ERR_NOT_OWNER: -1,
    ERR_NO_PATH: -2,
    ERR_BUSY: -3,
    ERR_NOT_FOUND: -4,
    ERR_NOT_ENOUGH_RESOURCES: -5,
    ERR_INVALID_TARGET: -6,
    ERR_FULL: -7,
    ERR_NOT_IN_RANGE: -8,
    ERR_INVALID_ARGS: -9,
    ERR_TIRED: -10,
    ERR_NO_BODYPART: -11,
    ERR_RCL_NOT_ENOUGH: -12,

    // 游戏参数
    TICK_DURATION: 1000, // 每tick持续时间（毫秒）
    MAX_CARGO_DISTANCE: 1, // 最大货物操作距离
    MAX_HARVEST_DISTANCE: 1, // 最大采集距离
} as const;

// 货物容器接口
export interface CargoContainer {
    id: string;
    cargo: Map<string, number>; // resourceId -> amount
    cargoCapacity: number;
    cargoUsed: number;
}

// 资源节点
export interface ResourceNode {
    id: string;
    resourceType: PrimaryResourceType;
    position: Position;
    amount: number; // 剩余资源量
    regenerationRate?: number; // 再生速率
}

// ==================== 游戏世界对象 ====================

// 游戏世界
export interface GameWorld {
    tick: number;
    ships: Map<string, GameShip>;
    resourceNodes: Map<string, GameResourceNode>;
    structures: Map<string, GameStructure>;
}

// 运行时飞船对象
export interface GameShip extends ShipInstance {
    cargo: Map<string, number>; // resourceType -> amount
    cargoCapacity: number;
    currentAction?: ShipAction;
    actionProgress?: number;
    path?: Position[];
    logs: string[];
}

// 飞船动作
export interface ShipAction {
    type: 'move' | 'harvest' | 'transfer' | 'withdraw';
    targetId?: string;
    targetPos?: Position;
    resourceType?: string;
    amount?: number;
    startTick: number;
    duration: number; // 需要的tick数
}

// 运行时资源节点
export interface GameResourceNode extends ResourceNode {
    currentAmount: number;
    lastHarvestTick: number;
}

// 运行时建筑/容器
export interface GameStructure extends CargoContainer {
    type: string;
    position: Position;
    ownerId: string;
}

// 玩家游戏状态
export interface PlayerGameState {
    userId: string;
    ships: string[]; // 玩家的飞船ID列表
    structures: string[]; // 玩家的建筑ID列表
}

