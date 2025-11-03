/**
 * 游戏API类型定义
 * 提供给玩家编写代码时使用的API接口
 */

import { ShipInstance } from './ships';
import { ResourceInstance, PrimaryResourceType } from './resources';

// 游戏对象位置
export interface Position {
  x: number;
  y: number;
  z?: number;
}

// 目标类型（可以是坐标或对象）
export type MoveTarget = Position | { pos: Position } | string;

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

// 飞船控制API
export interface ShipAPI {
  // 基础属性
  id: string;
  name?: string;
  pos: Position;
  
  // 货物相关
  store: {
    getUsedCapacity(resourceType?: string): number;
    getFreeCapacity(resourceType?: string): number;
    getCapacity(resourceType?: string): number;
  };
  
  // 移动命令
  moveTo(x: number, y: number, z?: number): number;
  moveTo(target: MoveTarget): number;
  
  // 采集命令
  harvest(target: ResourceNode | string): number;
  
  // 存取物品命令
  withdraw(target: CargoContainer | string, resourceType: string, amount?: number): number;
  transfer(target: CargoContainer | string, resourceType: string, amount?: number): number;
  
  // 信息查询
  say(message: string): number;
  getActiveBodyparts(type?: string): number;
}

// 游戏对象查找选项
export interface FindOptions {
  filter?: ((obj: any) => boolean) | object;
  algorithm?: 'astar' | 'dijkstra';
}

// 游戏主对象
export interface Game {
  // 时间
  time: number; // 当前游戏tick
  
  // 玩家相关
  ships: { [id: string]: ShipAPI };
  
  // 资源节点
  resources: { [id: string]: ResourceNode };
  
  // 存储容器
  structures: { [id: string]: CargoContainer };
  
  // 工具函数
  getObjectById<T = any>(id: string): T | null;
  notify(message: string, groupInterval?: number): void;
}

// 房间对象
export interface Room {
  name: string;
  
  // 查找对象
  find<T = any>(type: number, opts?: FindOptions): T[];
  findPath(fromPos: Position, toPos: Position, opts?: any): Position[];
  
  // 视野
  lookAt(x: number, y: number): any[];
  lookAt(target: Position): any[];
  
  // 位置工具
  getPositionAt(x: number, y: number): Position | null;
}

// 查找类型常量
export enum FIND {
  MY_SHIPS = 101,
  HOSTILE_SHIPS = 102,
  RESOURCES = 103,
  STRUCTURES = 104,
  MY_STRUCTURES = 105,
  HOSTILE_STRUCTURES = 106,
}

// 用户代码内存接口
export interface Memory {
  [key: string]: any;
}

// 全局游戏上下文（用户代码中可用）
export interface GameContext {
  Game: Game;
  Memory: Memory;
  // 添加其他全局对象...
}

// 代码执行结果
export interface CodeExecutionResult {
  success: boolean;
  error?: string;
  logs: string[];
  cpuUsed: number;
  tickProcessed: number;
}

// 玩家代码提交
export interface PlayerCode {
  userId: string;
  code: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

// Tick更新数据
export interface TickUpdate {
  tick: number;
  timestamp: number;
  ships: {
    [shipId: string]: {
      position: Position;
      cargo: { [resourceType: string]: number };
      status: string;
      health: number;
    };
  };
  logs: string[];
}

