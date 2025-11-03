/**
 * 游戏运行时对象定义
 */

import { Position, CargoContainer, ResourceNode } from './gameApi';
import { ShipInstance, ShipStatus } from './ships';
import { PrimaryResourceType } from './resources';

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
  memory: { [key: string]: any };
  lastCodeUpdate: number;
  ships: string[]; // 玩家的飞船ID列表
  structures: string[]; // 玩家的建筑ID列表
}

