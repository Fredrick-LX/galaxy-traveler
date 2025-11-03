/**
 * 游戏初始化器
 * 负责初始化游戏世界和创建初始对象
 */

import { GameEngine } from './GameEngine';
import { 
  GameShip, 
  GameResourceNode, 
  GameStructure,
  ShipStatus, 
  ShipCategory,
  PrimaryResourceType,
} from '@galaxy-traveler/shared';

export class GameInitializer {
  private gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  /**
   * 为新玩家初始化游戏对象
   */
  initializePlayerGame(userId: string): void {
    // 创建初始飞船
    const initialShip = this.createInitialShip(userId);
    this.gameEngine.addShip(initialShip);

    // 创建初始资源节点
    const resourceNodes = this.createInitialResourceNodes();
    resourceNodes.forEach(node => this.gameEngine.addResourceNode(node));

    // 创建初始存储容器
    const storage = this.createInitialStorage(userId);
    this.gameEngine.addStructure(storage);

    // 创建玩家状态
    this.gameEngine.setPlayerState({
      userId,
      memory: {},
      lastCodeUpdate: Date.now(),
      ships: [initialShip.instanceId],
      structures: [storage.id],
    });

    console.log(`✅ 已为玩家 ${userId} 初始化游戏`);
  }

  /**
   * 创建初始飞船
   */
  private createInitialShip(userId: string): GameShip {
    const shipId = `ship_${userId}_1`;
    
    return {
      instanceId: shipId,
      shipId: 'engineer_1',
      ownerId: userId,
      currentHealth: 100,
      position: { x: 0, y: 0, z: 0 },
      status: ShipStatus.IDLE,
      cargo: new Map(),
      cargoCapacity: 100,
      logs: [],
    };
  }

  /**
   * 创建初始资源节点
   */
  private createInitialResourceNodes(): GameResourceNode[] {
    return [
      {
        id: 'iron_node_1',
        resourceType: PrimaryResourceType.IRON_ORE,
        position: { x: 10, y: 10, z: 0 },
        amount: 10000,
        currentAmount: 10000,
        regenerationRate: 10, // 每tick再生10单位
        lastHarvestTick: 0,
      },
      {
        id: 'copper_node_1',
        resourceType: PrimaryResourceType.COPPER_ORE,
        position: { x: -10, y: 10, z: 0 },
        amount: 8000,
        currentAmount: 8000,
        regenerationRate: 8,
        lastHarvestTick: 0,
      },
      {
        id: 'energy_crystal_node_1',
        resourceType: PrimaryResourceType.ENERGY_CRYSTAL,
        position: { x: 0, y: 20, z: 0 },
        amount: 5000,
        currentAmount: 5000,
        regenerationRate: 5,
        lastHarvestTick: 0,
      },
    ];
  }

  /**
   * 创建初始存储容器
   */
  private createInitialStorage(userId: string): GameStructure {
    return {
      id: `storage_${userId}_1`,
      type: 'storage',
      position: { x: 0, y: 0, z: 0 },
      ownerId: userId,
      cargo: new Map(),
      cargoCapacity: 1000,
      cargoUsed: 0,
    };
  }

  /**
   * 初始化测试环境
   */
  initializeTestEnvironment(): void {
    console.log('🎮 初始化测试环境...');
    
    // 创建测试资源节点（全局）
    const testNodes = this.createInitialResourceNodes();
    testNodes.forEach(node => {
      // 给每个节点添加不同的位置
      node.position = {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        z: 0,
      };
      this.gameEngine.addResourceNode(node);
    });

    console.log('✅ 测试环境初始化完成');
  }
}

