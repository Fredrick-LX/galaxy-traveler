/**
 * 星系相关的API路由
 */

import { Router } from 'express';
import { GalaxyGenerator } from '@/services/GalaxyGenerator';
import { getGameEngine } from '@/services/GameEngine';
import { verifyToken } from '@/utils/jwt';
import { serializeGalaxyNetwork } from '@/utils/serializers';
import type { Request, Response } from 'express';
import type { GameShip, ShipStatus } from '@galaxy-traveler/shared';

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
        const serialized = serializeGalaxyNetwork(network.galaxies, network.connections);
        cachedGalaxyNetwork = {
            ...serialized,
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

        // 转换 Map 为普通对象以便序列化
        const serialized = serializeGalaxyNetwork(network.galaxies, network.connections);
        cachedGalaxyNetwork = {
            ...serialized,
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

/**
 * 选择起始星系并创建探索船
 */
router.post('/select-starting-galaxy', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: '未授权' });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return res.status(401).json({ success: false, error: '无效的token' });
        }

        const { galaxyId } = req.body;
        if (!galaxyId) {
            return res.status(400).json({ success: false, error: '缺少星系ID' });
        }

        const userId = payload.userId;
        const gameEngine = getGameEngine();

        // 检查玩家是否已经有起始星系
        const playerState = gameEngine.getPlayerState(userId);
        if (playerState && playerState.ships.length > 0) {
            return res.status(400).json({
                success: false,
                error: '您已经有起始星系和飞船了'
            });
        }

        // 获取选中的星系信息
        // 使用galaxyId来确定位置（简化版，实际应从缓存获取）
        const position = { x: 0, y: 0, z: 0 }; // 临时位置，实际应从网络数据获取
        const galaxy = galaxyGenerator.generateGalaxy(galaxyId, position, true);
        const startPosition = {
            x: 25, // 星系中心坐标
            y: 25,
            z: 0,
        };

        // 创建1级探索船
        const explorerShip: GameShip = {
            instanceId: `ship_${userId}_explorer_1`,
            shipId: 'explorer_1',
            ownerId: userId,
            currentHealth: 100,
            position: startPosition,
            status: 'idle' as ShipStatus,
            cargo: new Map(),
            cargoCapacity: 200, // 1级探索船容量
            logs: [],
        };

        // 添加飞船到游戏引擎
        gameEngine.addShip(explorerShip);

        // 更新或创建玩家状态
        gameEngine.setPlayerState({
            userId,
            ships: [explorerShip.instanceId],
            structures: [],
        });

        console.log(`✅ 玩家 ${userId} 选择了起始星系 ${galaxyId}，创建了探索船`);

        res.json({
            success: true,
            data: {
                galaxyId,
                ship: {
                    instanceId: explorerShip.instanceId,
                    shipId: explorerShip.shipId,
                    position: explorerShip.position,
                    cargoCapacity: explorerShip.cargoCapacity,
                },
            },
        });
    } catch (error) {
        console.error('选择起始星系失败:', error);
        res.status(500).json({
            success: false,
            error: '选择起始星系失败',
        });
    }
});

export default router;

