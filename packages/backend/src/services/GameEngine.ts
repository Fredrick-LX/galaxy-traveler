/**
 * 游戏引擎
 * 负责游戏世界的tick更新和状态管理
 */

import { 
  GameWorld, 
  GameShip, 
  GameResourceNode, 
  GameStructure,
  PlayerGameState,
  ShipAction,
  Position, 
  GAME_CONSTANTS,
  TickUpdate,
  ShipStatus,
} from '@galaxy-traveler/shared';

export class GameEngine {
  private world: GameWorld;
  private playerStates: Map<string, PlayerGameState>;
  private isRunning: boolean = false;
  private tickInterval?: NodeJS.Timeout;

  constructor() {
    this.world = {
      tick: 0,
      ships: new Map(),
      resourceNodes: new Map(),
      structures: new Map(),
    };
    this.playerStates = new Map();
  }

  /**
   * 启动游戏引擎
   */
  start(): void {
    if (this.isRunning) {
      console.warn('游戏引擎已在运行');
      return;
    }

    this.isRunning = true;
    console.log('🎮 游戏引擎启动');

    // 每秒执行一次tick
    this.tickInterval = setInterval(() => {
      this.processTick();
    }, GAME_CONSTANTS.TICK_DURATION);
  }

  /**
   * 停止游戏引擎
   */
  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = undefined;
    }
    this.isRunning = false;
    console.log('🎮 游戏引擎停止');
  }

  /**
   * 处理一个游戏tick
   */
  private processTick(): void {
    this.world.tick++;
    const currentTick = this.world.tick;

    // 1. 处理所有飞船的动作
    for (const [shipId, ship] of this.world.ships) {
      this.processShipAction(ship, currentTick);
    }

    // 2. 资源节点再生
    this.regenerateResources(currentTick);

    // 3. 清理已完成的动作
    this.cleanupCompletedActions(currentTick);

    // 4. 发送tick更新给所有玩家
    this.broadcastTickUpdate(currentTick);
  }

  /**
   * 处理飞船动作
   */
  private processShipAction(ship: GameShip, currentTick: number): void {
    if (!ship.currentAction) {
      ship.status = ShipStatus.IDLE;
      return;
    }

    const action = ship.currentAction;
    const elapsed = currentTick - action.startTick;

    // 动作进度
    ship.actionProgress = Math.min(elapsed / action.duration, 1);

    // 检查动作是否完成
    if (elapsed >= action.duration) {
      this.completeShipAction(ship, action);
      ship.currentAction = undefined;
      ship.actionProgress = undefined;
    }
  }

  /**
   * 完成飞船动作
   */
  private completeShipAction(ship: GameShip, action: ShipAction): void {
    switch (action.type) {
      case 'move':
        if (action.targetPos) {
          ship.position = {
            x: action.targetPos.x,
            y: action.targetPos.y,
            z: action.targetPos.z || 0,
          };
          ship.logs.push(`移动到 (${action.targetPos.x}, ${action.targetPos.y})`);
        }
        ship.status = ShipStatus.IDLE;
        break;

      case 'harvest':
        if (action.targetId) {
          const resource = this.world.resourceNodes.get(action.targetId);
          if (resource && action.amount) {
            const harvested = Math.min(action.amount, resource.currentAmount);
            resource.currentAmount -= harvested;
            
            const resourceType = resource.resourceType;
            const current = ship.cargo.get(resourceType) || 0;
            ship.cargo.set(resourceType, current + harvested);
            
            ship.logs.push(`采集了 ${harvested} ${resourceType}`);
          }
        }
        ship.status = ShipStatus.IDLE;
        break;

      case 'transfer':
      case 'withdraw':
        // 转移资源逻辑
        if (action.targetId && action.resourceType && action.amount) {
          const target = this.world.structures.get(action.targetId);
          if (target) {
            if (action.type === 'transfer') {
              // 从飞船转移到容器
              const current = ship.cargo.get(action.resourceType) || 0;
              const amount = Math.min(action.amount, current);
              ship.cargo.set(action.resourceType, current - amount);
              
              const targetAmount = target.cargo.get(action.resourceType) || 0;
              target.cargo.set(action.resourceType, targetAmount + amount);
              
              ship.logs.push(`转移 ${amount} ${action.resourceType} 到 ${target.id}`);
            } else {
              // 从容器提取到飞船
              const targetAmount = target.cargo.get(action.resourceType) || 0;
              const amount = Math.min(action.amount, targetAmount);
              target.cargo.set(action.resourceType, targetAmount - amount);
              
              const current = ship.cargo.get(action.resourceType) || 0;
              ship.cargo.set(action.resourceType, current + amount);
              
              ship.logs.push(`提取 ${amount} ${action.resourceType} 从 ${target.id}`);
            }
          }
        }
        ship.status = ShipStatus.IDLE;
        break;
    }
  }

  /**
   * 资源再生
   */
  private regenerateResources(currentTick: number): void {
    for (const [nodeId, node] of this.world.resourceNodes) {
      if (node.regenerationRate && node.currentAmount < node.amount) {
        node.currentAmount = Math.min(
          node.currentAmount + node.regenerationRate,
          node.amount
        );
      }
    }
  }

  /**
   * 清理已完成的动作
   */
  private cleanupCompletedActions(currentTick: number): void {
    for (const ship of this.world.ships.values()) {
      // 清理旧日志（保留最近100条）
      if (ship.logs.length > 100) {
        ship.logs = ship.logs.slice(-100);
      }
    }
  }

  /**
   * 广播tick更新
   */
  private broadcastTickUpdate(tick: number): void {
    const update: TickUpdate = {
      tick,
      timestamp: Date.now(),
      ships: {},
      logs: [],
    };

    for (const [shipId, ship] of this.world.ships) {
      update.ships[shipId] = {
        position: ship.position || { x: 0, y: 0, z: 0 },
        cargo: Object.fromEntries(ship.cargo),
        status: ship.status,
        health: ship.currentHealth,
      };
      
      if (ship.logs.length > 0) {
        update.logs.push(...ship.logs.map(log => `[${shipId}] ${log}`));
        ship.logs = []; // 清空日志
      }
    }

    // TODO: 通过Socket.io发送更新
    // this.io.emit('tick-update', update);
  }

  /**
   * 执行飞船命令
   */
  executeShipCommand(
    shipId: string,
    command: 'moveTo' | 'harvest' | 'transfer' | 'withdraw',
    params: any
  ): number {
    const ship = this.world.ships.get(shipId);
    if (!ship) {
      return GAME_CONSTANTS.ERR_NOT_FOUND;
    }

    if (ship.currentAction) {
      return GAME_CONSTANTS.ERR_BUSY;
    }

    switch (command) {
      case 'moveTo':
        return this.commandMoveTo(ship, params);
      case 'harvest':
        return this.commandHarvest(ship, params);
      case 'transfer':
        return this.commandTransfer(ship, params);
      case 'withdraw':
        return this.commandWithdraw(ship, params);
      default:
        return GAME_CONSTANTS.ERR_INVALID_ARGS;
    }
  }

  /**
   * 移动命令
   */
  private commandMoveTo(ship: GameShip, params: { target: Position }): number {
    const { target } = params;
    if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
      return GAME_CONSTANTS.ERR_INVALID_ARGS;
    }

    // 计算距离和所需时间
    const distance = this.calculateDistance(ship.position!, target);
    const duration = Math.ceil(distance / 10); // 假设速度为10单位/tick

    ship.currentAction = {
      type: 'move',
      targetPos: target,
      startTick: this.world.tick,
      duration: Math.max(1, duration),
    };

    ship.status = ShipStatus.MOVING;
    return GAME_CONSTANTS.OK;
  }

  /**
   * 采集命令
   */
  private commandHarvest(ship: GameShip, params: { targetId: string }): number {
    const { targetId } = params;
    const resource = this.world.resourceNodes.get(targetId);
    
    if (!resource) {
      return GAME_CONSTANTS.ERR_NOT_FOUND;
    }

    // 检查距离
    const distance = this.calculateDistance(ship.position!, resource.position);
    if (distance > GAME_CONSTANTS.MAX_HARVEST_DISTANCE) {
      return GAME_CONSTANTS.ERR_NOT_IN_RANGE;
    }

    // 计算采集量（假设每tick采集10单位）
    const harvestAmount = 10;
    const freeCapacity = ship.cargoCapacity - this.getCargoUsed(ship);
    
    if (freeCapacity <= 0) {
      return GAME_CONSTANTS.ERR_FULL;
    }

    ship.currentAction = {
      type: 'harvest',
      targetId,
      amount: Math.min(harvestAmount, freeCapacity),
      startTick: this.world.tick,
      duration: 2, // 采集需要2个tick
    };

    ship.status = ShipStatus.MINING;
    return GAME_CONSTANTS.OK;
  }

  /**
   * 转移命令
   */
  private commandTransfer(
    ship: GameShip,
    params: { targetId: string; resourceType: string; amount?: number }
  ): number {
    const { targetId, resourceType, amount } = params;
    const target = this.world.structures.get(targetId);
    
    if (!target) {
      return GAME_CONSTANTS.ERR_NOT_FOUND;
    }

    const distance = this.calculateDistance(ship.position!, target.position);
    if (distance > GAME_CONSTANTS.MAX_CARGO_DISTANCE) {
      return GAME_CONSTANTS.ERR_NOT_IN_RANGE;
    }

    const available = ship.cargo.get(resourceType) || 0;
    const transferAmount = amount ? Math.min(amount, available) : available;

    if (transferAmount <= 0) {
      return GAME_CONSTANTS.ERR_NOT_ENOUGH_RESOURCES;
    }

    ship.currentAction = {
      type: 'transfer',
      targetId,
      resourceType,
      amount: transferAmount,
      startTick: this.world.tick,
      duration: 1,
    };

    return GAME_CONSTANTS.OK;
  }

  /**
   * 提取命令
   */
  private commandWithdraw(
    ship: GameShip,
    params: { targetId: string; resourceType: string; amount?: number }
  ): number {
    const { targetId, resourceType, amount } = params;
    const target = this.world.structures.get(targetId);
    
    if (!target) {
      return GAME_CONSTANTS.ERR_NOT_FOUND;
    }

    const distance = this.calculateDistance(ship.position!, target.position);
    if (distance > GAME_CONSTANTS.MAX_CARGO_DISTANCE) {
      return GAME_CONSTANTS.ERR_NOT_IN_RANGE;
    }

    const available = target.cargo.get(resourceType) || 0;
    const freeCapacity = ship.cargoCapacity - this.getCargoUsed(ship);
    const withdrawAmount = amount 
      ? Math.min(amount, available, freeCapacity)
      : Math.min(available, freeCapacity);

    if (withdrawAmount <= 0) {
      return GAME_CONSTANTS.ERR_NOT_ENOUGH_RESOURCES;
    }

    ship.currentAction = {
      type: 'withdraw',
      targetId,
      resourceType,
      amount: withdrawAmount,
      startTick: this.world.tick,
      duration: 1,
    };

    return GAME_CONSTANTS.OK;
  }

  /**
   * 计算两点距离
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = (pos1.z || 0) - (pos2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * 获取飞船已使用的货物容量
   */
  private getCargoUsed(ship: GameShip): number {
    let total = 0;
    for (const amount of ship.cargo.values()) {
      total += amount;
    }
    return total;
  }

  /**
   * 获取游戏世界状态
   */
  getWorld(): GameWorld {
    return this.world;
  }

  /**
   * 添加飞船到游戏世界
   */
  addShip(ship: GameShip): void {
    this.world.ships.set(ship.instanceId, ship);
  }

  /**
   * 添加资源节点
   */
  addResourceNode(node: GameResourceNode): void {
    this.world.resourceNodes.set(node.id, node);
  }

  /**
   * 添加建筑
   */
  addStructure(structure: GameStructure): void {
    this.world.structures.set(structure.id, structure);
  }

  /**
   * 获取玩家状态
   */
  getPlayerState(userId: string): PlayerGameState | undefined {
    return this.playerStates.get(userId);
  }

  /**
   * 设置玩家状态
   */
  setPlayerState(state: PlayerGameState): void {
    this.playerStates.set(state.userId, state);
  }
}

// 单例模式
let gameEngineInstance: GameEngine | null = null;

export function getGameEngine(): GameEngine {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine();
  }
  return gameEngineInstance;
}

