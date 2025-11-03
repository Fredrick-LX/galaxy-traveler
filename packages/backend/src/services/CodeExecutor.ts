/**
 * 代码执行器
 * 负责在沙箱环境中执行玩家代码
 */

import { VM } from 'vm2';
import { GameEngine } from './GameEngine';
import {
  Game,
  ShipAPI,
  Position,
  MoveTarget,
  GAME_CONSTANTS,
  CodeExecutionResult,
  Memory,
  GameShip,
} from '@galaxy-traveler/shared';

export class CodeExecutor {
  private gameEngine: GameEngine;
  private userMemories: Map<string, Memory>;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
    this.userMemories = new Map();
  }

  /**
   * 执行玩家代码
   */
  executePlayerCode(userId: string, code: string): CodeExecutionResult {
    const startTime = Date.now();
    const logs: string[] = [];
    
    try {
      // 创建游戏上下文
      const game = this.createGameContext(userId, logs);
      const memory = this.getUserMemory(userId);

      // 创建VM沙箱
      const vm = new VM({
        timeout: 5000, // 5秒超时
        sandbox: {
          Game: game,
          Memory: memory,
          console: {
            log: (...args: any[]) => {
              logs.push(args.map(a => String(a)).join(' '));
            },
          },
          // 添加一些安全的全局对象
          Math,
          JSON,
          Object,
          Array,
          String,
          Number,
          Boolean,
        },
      });

      // 执行代码
      vm.run(code);

      const cpuUsed = Date.now() - startTime;

      return {
        success: true,
        logs,
        cpuUsed,
        tickProcessed: this.gameEngine.getWorld().tick,
      };
    } catch (error) {
      const cpuUsed = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs,
        cpuUsed,
        tickProcessed: this.gameEngine.getWorld().tick,
      };
    }
  }

  /**
   * 创建游戏上下文
   */
  private createGameContext(userId: string, logs: string[]): Game {
    const world = this.gameEngine.getWorld();
    const playerState = this.gameEngine.getPlayerState(userId);
    
    // 创建飞船API对象
    const ships: { [id: string]: ShipAPI } = {};
    
    if (playerState) {
      for (const shipId of playerState.ships) {
        const ship = world.ships.get(shipId);
        if (ship) {
          ships[shipId] = this.createShipAPI(ship, logs);
        }
      }
    }

    // 创建资源节点对象
    const resources: any = {};
    for (const [id, node] of world.resourceNodes) {
      resources[id] = {
        id: node.id,
        resourceType: node.resourceType,
        position: node.position,
        amount: node.currentAmount,
      };
    }

    // 创建建筑对象
    const structures: any = {};
    for (const [id, structure] of world.structures) {
      structures[id] = {
        id: structure.id,
        type: structure.type,
        position: structure.position,
        cargo: Object.fromEntries(structure.cargo),
        cargoCapacity: structure.cargoCapacity,
      };
    }

    return {
      time: world.tick,
      ships,
      resources,
      structures,
      
      getObjectById: <T = any>(id: string): T | null => {
        return (ships[id] as any) || resources[id] || structures[id] || null;
      },
      
      notify: (message: string, groupInterval?: number) => {
        logs.push(`[通知] ${message}`);
      },
    };
  }

  /**
   * 创建飞船API
   */
  private createShipAPI(ship: GameShip, logs: string[]): ShipAPI {
    const self = this;
    
    return {
      id: ship.instanceId,
      name: ship.instanceId,
      pos: ship.position || { x: 0, y: 0, z: 0 },
      
      store: {
        getUsedCapacity(resourceType?: string): number {
          if (resourceType) {
            return ship.cargo.get(resourceType) || 0;
          }
          let total = 0;
          for (const amount of ship.cargo.values()) {
            total += amount;
          }
          return total;
        },
        
        getFreeCapacity(resourceType?: string): number {
          const used = this.getUsedCapacity(resourceType);
          return ship.cargoCapacity - used;
        },
        
        getCapacity(resourceType?: string): number {
          return ship.cargoCapacity;
        },
      },
      
      moveTo: function(targetOrX: any, y?: number, z?: number): number {
        let targetPos: Position;
        
        if (typeof targetOrX === 'number' && typeof y === 'number') {
          // moveTo(x, y, z?)
          targetPos = { x: targetOrX, y, z: z || 0 };
        } else if (typeof targetOrX === 'string') {
          // moveTo(objectId)
          const obj = self.gameEngine.getWorld().resourceNodes.get(targetOrX) 
                   || self.gameEngine.getWorld().structures.get(targetOrX);
          if (!obj) {
            return GAME_CONSTANTS.ERR_NOT_FOUND;
          }
          targetPos = obj.position;
        } else if (targetOrX && typeof targetOrX === 'object') {
          // moveTo(target) 或 moveTo({ pos: ... })
          targetPos = (targetOrX as any).pos || targetOrX;
        } else {
          return GAME_CONSTANTS.ERR_INVALID_ARGS;
        }
        
        return self.gameEngine.executeShipCommand(ship.instanceId, 'moveTo', {
          target: targetPos,
        });
      },
      
      harvest: function(target: any): number {
        let targetId: string;
        
        if (typeof target === 'string') {
          targetId = target;
        } else if (target && typeof target === 'object' && target.id) {
          targetId = target.id;
        } else {
          return GAME_CONSTANTS.ERR_INVALID_ARGS;
        }
        
        return self.gameEngine.executeShipCommand(ship.instanceId, 'harvest', {
          targetId,
        });
      },
      
      withdraw: function(target: any, resourceType: string, amount?: number): number {
        let targetId: string;
        
        if (typeof target === 'string') {
          targetId = target;
        } else if (target && typeof target === 'object' && target.id) {
          targetId = target.id;
        } else {
          return GAME_CONSTANTS.ERR_INVALID_ARGS;
        }
        
        return self.gameEngine.executeShipCommand(ship.instanceId, 'withdraw', {
          targetId,
          resourceType,
          amount,
        });
      },
      
      transfer: function(target: any, resourceType: string, amount?: number): number {
        let targetId: string;
        
        if (typeof target === 'string') {
          targetId = target;
        } else if (target && typeof target === 'object' && target.id) {
          targetId = target.id;
        } else {
          return GAME_CONSTANTS.ERR_INVALID_ARGS;
        }
        
        return self.gameEngine.executeShipCommand(ship.instanceId, 'transfer', {
          targetId,
          resourceType,
          amount,
        });
      },
      
      say: function(message: string): number {
        logs.push(`[${ship.instanceId}] 说: ${message}`);
        return GAME_CONSTANTS.OK;
      },
      
      getActiveBodyparts: function(type?: string): number {
        // 简化版本，后续可以扩展
        return 1;
      },
    };
  }

  /**
   * 获取用户内存
   */
  private getUserMemory(userId: string): Memory {
    if (!this.userMemories.has(userId)) {
      this.userMemories.set(userId, {});
    }
    return this.userMemories.get(userId)!;
  }

  /**
   * 清空用户内存
   */
  clearUserMemory(userId: string): void {
    this.userMemories.delete(userId);
  }
}

