/**
 * 星系相关的API路由
 */

import { Router } from 'express';
import { GalaxyGenerator } from '@/services/GalaxyGenerator';
import type { Request, Response } from 'express';

const router = Router();

// 全局星系生成器实例（使用固定种子确保一致性）
const UNIVERSE_SEED = 12345678;
let galaxyGenerator = new GalaxyGenerator(UNIVERSE_SEED);
let cachedGalaxyNetwork: any = null;

/**
 * 获取星系网络数据
 */
router.get('/network', async (req: Request, res: Response) => {
  try {
    // 如果已缓存，直接返回
    if (cachedGalaxyNetwork) {
      return res.json({
        success: true,
        data: cachedGalaxyNetwork,
      });
    }

    // 生成新的星系网络
    const seed = parseInt(req.query.seed as string) || Date.now();
    galaxyGenerator = new GalaxyGenerator(seed);
    
    const network = galaxyGenerator.generateGalaxyNetwork({
      galaxyCount: 50,
      minDistance: 100,
      maxDistance: 500,
      connectionProbability: 0.15,
      seed,
    });

    // 转换 Map 为普通对象以便序列化
    const galaxiesObj: any = {};
    network.galaxies.forEach((galaxy, id) => {
      galaxiesObj[id] = galaxy;
    });

    const connectionsObj: any = {};
    network.connections.forEach((conns, id) => {
      connectionsObj[id] = conns;
    });

    cachedGalaxyNetwork = {
      galaxies: galaxiesObj,
      connections: connectionsObj,
      seed: network.seed,
    };

    res.json({
      success: true,
      data: cachedGalaxyNetwork,
    });
  } catch (error) {
    console.error('获取星系网络失败:', error);
    res.status(500).json({ 
      success: false,
      error: '获取星系网络失败' 
    });
  }
});

/**
 * 获取单个星系详情
 */
router.get('/galaxy/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!cachedGalaxyNetwork) {
      return res.status(404).json({
        success: false,
        error: '星系网络未初始化',
      });
    }

    const galaxy = cachedGalaxyNetwork.galaxies[id];
    if (!galaxy) {
      return res.status(404).json({
        success: false,
        error: '星系不存在',
      });
    }

    res.json({
      success: true,
      data: galaxy,
    });
  } catch (error) {
    console.error('获取星系详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取星系详情失败',
    });
  }
});

/**
 * 重新生成星系网络
 */
router.post('/regenerate', async (req: Request, res: Response) => {
  try {
    const { seed, galaxyCount } = req.body;
    
    const tempGenerator = new GalaxyGenerator(seed);
    const network = tempGenerator.generateGalaxyNetwork({
      galaxyCount: galaxyCount || 50,
      minDistance: 100,
      maxDistance: 500,
      connectionProbability: 0.15,
      seed,
    });

    const galaxiesObj: any = {};
    network.galaxies.forEach((galaxy, id) => {
      galaxiesObj[id] = galaxy;
    });

    const connectionsObj: any = {};
    network.connections.forEach((conns, id) => {
      connectionsObj[id] = conns;
    });

    cachedGalaxyNetwork = {
      galaxies: galaxiesObj,
      connections: connectionsObj,
      seed: network.seed,
    };

    res.json({
      success: true,
      data: cachedGalaxyNetwork,
    });
  } catch (error) {
    console.error('重新生成星系网络失败:', error);
    res.status(500).json({
      success: false,
      error: '重新生成星系网络失败',
    });
  }
});

/**
 * 获取指定区域的星系
 */
router.get('/region', async (req: Request, res: Response) => {
  try {
    const { minX, maxX, minY, maxY } = req.query;
    
    if (!minX || !maxX || !minY || !maxY) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
      });
    }

    const galaxies = galaxyGenerator.generateGalaxiesInRegion(
      parseFloat(minX as string),
      parseFloat(maxX as string),
      parseFloat(minY as string),
      parseFloat(maxY as string)
    );

    res.json({
      success: true,
      data: { galaxies },
    });
  } catch (error) {
    console.error('获取区域星系失败:', error);
    res.status(500).json({
      success: false,
      error: '获取区域星系失败',
    });
  }
});

export default router;

