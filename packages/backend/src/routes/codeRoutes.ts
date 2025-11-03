/**
 * 代码相关的API路由
 */

import { Router } from 'express';
import { getGameEngine } from '@/services/GameEngine';
import { CodeExecutor } from '@/services/CodeExecutor';
import { verifyToken } from '@/utils/jwt';
import type { Request, Response } from 'express';

const router = Router();
const gameEngine = getGameEngine();
const codeExecutor = new CodeExecutor(gameEngine);

// 中间件：验证JWT token
const authMiddleware = async (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    (req as any).userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的认证令牌' });
  }
};

/**
 * 提交代码
 */
router.post('/submit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: '无效的代码' });
    }

    // 保存用户代码到数据库
    // TODO: 实现数据库存储

    res.json({
      success: true,
      message: '代码提交成功',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('提交代码失败:', error);
    res.status(500).json({ error: '提交代码失败' });
  }
});

/**
 * 获取当前代码
 */
router.get('/current', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // 从数据库获取用户代码
    // TODO: 实现数据库读取

    res.json({
      code: '// 你的代码将在这里显示\n',
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('获取代码失败:', error);
    res.status(500).json({ error: '获取代码失败' });
  }
});

/**
 * 测试执行代码（手动触发）
 */
router.post('/test', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: '无效的代码' });
    }

    // 执行代码
    const result = codeExecutor.executePlayerCode(userId, code);

    res.json({
      success: result.success,
      error: result.error,
      logs: result.logs,
      cpuUsed: result.cpuUsed,
      tick: result.tickProcessed,
    });
  } catch (error) {
    console.error('测试代码失败:', error);
    res.status(500).json({ error: '测试代码失败' });
  }
});

/**
 * 获取游戏状态
 */
router.get('/game-state', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const world = gameEngine.getWorld();
    const playerState = gameEngine.getPlayerState(userId);

    if (!playerState) {
      return res.status(404).json({ error: '未找到玩家状态' });
    }

    // 获取玩家的飞船
    const ships = playerState.ships.map((shipId: string) => {
      const ship = world.ships.get(shipId);
      if (!ship) return null;
      
      return {
        id: ship.instanceId,
        shipId: ship.shipId,
        position: ship.position,
        status: ship.status,
        health: ship.currentHealth,
        cargo: Object.fromEntries(ship.cargo),
        cargoCapacity: ship.cargoCapacity,
      };
    }).filter((s: any) => s !== null);

    // 获取所有资源节点
    const resources = Array.from(world.resourceNodes.values()).map((node: any) => ({
      id: node.id,
      type: node.resourceType,
      position: node.position,
      amount: node.currentAmount,
    }));

    res.json({
      tick: world.tick,
      ships,
      resources,
      memory: playerState.memory,
    });
  } catch (error) {
    console.error('获取游戏状态失败:', error);
    res.status(500).json({ error: '获取游戏状态失败' });
  }
});

/**
 * 清空内存
 */
router.post('/clear-memory', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    codeExecutor.clearUserMemory(userId);

    res.json({
      success: true,
      message: '内存已清空',
    });
  } catch (error) {
    console.error('清空内存失败:', error);
    res.status(500).json({ error: '清空内存失败' });
  }
});

export default router;

