/**
 * 游戏运行时对象定义
 */
import { ShipInstance } from './ships';
import { PrimaryResourceType } from './resources';
export interface Position {
    x: number;
    y: number;
    z?: number;
}
export declare const GAME_CONSTANTS: {
    readonly OK: 0;
    readonly ERR_NOT_OWNER: -1;
    readonly ERR_NO_PATH: -2;
    readonly ERR_BUSY: -3;
    readonly ERR_NOT_FOUND: -4;
    readonly ERR_NOT_ENOUGH_RESOURCES: -5;
    readonly ERR_INVALID_TARGET: -6;
    readonly ERR_FULL: -7;
    readonly ERR_NOT_IN_RANGE: -8;
    readonly ERR_INVALID_ARGS: -9;
    readonly ERR_TIRED: -10;
    readonly ERR_NO_BODYPART: -11;
    readonly ERR_RCL_NOT_ENOUGH: -12;
    readonly TICK_DURATION: 1000;
    readonly MAX_CARGO_DISTANCE: 1;
    readonly MAX_HARVEST_DISTANCE: 1;
};
export interface CargoContainer {
    id: string;
    cargo: Map<string, number>;
    cargoCapacity: number;
    cargoUsed: number;
}
export interface ResourceNode {
    id: string;
    resourceType: PrimaryResourceType;
    position: Position;
    amount: number;
    regenerationRate?: number;
}
export interface GameWorld {
    tick: number;
    ships: Map<string, GameShip>;
    resourceNodes: Map<string, GameResourceNode>;
    structures: Map<string, GameStructure>;
}
export interface GameShip extends ShipInstance {
    cargo: Map<string, number>;
    cargoCapacity: number;
    currentAction?: ShipAction;
    actionProgress?: number;
    path?: Position[];
    logs: string[];
}
export interface ShipAction {
    type: 'move' | 'harvest' | 'transfer' | 'withdraw';
    targetId?: string;
    targetPos?: Position;
    resourceType?: string;
    amount?: number;
    startTick: number;
    duration: number;
}
export interface GameResourceNode extends ResourceNode {
    currentAmount: number;
    lastHarvestTick: number;
}
export interface GameStructure extends CargoContainer {
    type: string;
    position: Position;
    ownerId: string;
}
export interface PlayerGameState {
    userId: string;
    ships: string[];
    structures: string[];
}
