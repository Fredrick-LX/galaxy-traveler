/**
 * 游戏运行时对象定义
 */
import { Position, CargoContainer, ResourceNode } from './gameApi';
import { ShipInstance } from './ships';
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
    memory: {
        [key: string]: any;
    };
    lastCodeUpdate: number;
    ships: string[];
    structures: string[];
}
