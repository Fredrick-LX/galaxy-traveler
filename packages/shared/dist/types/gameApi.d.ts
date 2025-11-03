/**
 * 游戏API类型定义
 * 提供给玩家编写代码时使用的API接口
 */
import { PrimaryResourceType } from './resources';
export interface Position {
    x: number;
    y: number;
    z?: number;
}
export type MoveTarget = Position | {
    pos: Position;
} | string;
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
export interface ShipAPI {
    id: string;
    name?: string;
    pos: Position;
    store: {
        getUsedCapacity(resourceType?: string): number;
        getFreeCapacity(resourceType?: string): number;
        getCapacity(resourceType?: string): number;
    };
    moveTo(x: number, y: number, z?: number): number;
    moveTo(target: MoveTarget): number;
    harvest(target: ResourceNode | string): number;
    withdraw(target: CargoContainer | string, resourceType: string, amount?: number): number;
    transfer(target: CargoContainer | string, resourceType: string, amount?: number): number;
    say(message: string): number;
    getActiveBodyparts(type?: string): number;
}
export interface FindOptions {
    filter?: ((obj: any) => boolean) | object;
    algorithm?: 'astar' | 'dijkstra';
}
export interface Game {
    time: number;
    ships: {
        [id: string]: ShipAPI;
    };
    resources: {
        [id: string]: ResourceNode;
    };
    structures: {
        [id: string]: CargoContainer;
    };
    getObjectById<T = any>(id: string): T | null;
    notify(message: string, groupInterval?: number): void;
}
export interface Room {
    name: string;
    find<T = any>(type: number, opts?: FindOptions): T[];
    findPath(fromPos: Position, toPos: Position, opts?: any): Position[];
    lookAt(x: number, y: number): any[];
    lookAt(target: Position): any[];
    getPositionAt(x: number, y: number): Position | null;
}
export declare enum FIND {
    MY_SHIPS = 101,
    HOSTILE_SHIPS = 102,
    RESOURCES = 103,
    STRUCTURES = 104,
    MY_STRUCTURES = 105,
    HOSTILE_STRUCTURES = 106
}
export interface Memory {
    [key: string]: any;
}
export interface GameContext {
    Game: Game;
    Memory: Memory;
}
export interface CodeExecutionResult {
    success: boolean;
    error?: string;
    logs: string[];
    cpuUsed: number;
    tickProcessed: number;
}
export interface PlayerCode {
    userId: string;
    code: string;
    createdAt: number;
    updatedAt: number;
    isActive: boolean;
}
export interface TickUpdate {
    tick: number;
    timestamp: number;
    ships: {
        [shipId: string]: {
            position: Position;
            cargo: {
                [resourceType: string]: number;
            };
            status: string;
            health: number;
        };
    };
    logs: string[];
}
