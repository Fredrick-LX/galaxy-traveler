/**
 * 游戏数据API路由
 */

import { Router, Request, Response } from 'express';
import { GAME_DATA } from '../config/gameData';
import {
    ShipCategory,
    BuildingCategory,
    ResourceTier
} from '@galaxy-traveler/shared';
import { sendSuccess, sendError } from '@/utils/routeHelpers';

const router = Router();

// 获取所有游戏数据
router.get('/all', (_req: Request, res: Response) => {
    sendSuccess(res, GAME_DATA);
});

// 获取所有船舶
router.get('/ships', (_req: Request, res: Response) => {
    sendSuccess(res, GAME_DATA.ships);
});

// 获取特定类别的船舶
router.get('/ships/:category', (req: Request, res: Response) => {
    const { category } = req.params;

    const categoryMap: Record<string, any> = {
        [ShipCategory.WARSHIP]: GAME_DATA.ships.warships,
        [ShipCategory.EXPLORER]: GAME_DATA.ships.explorers,
        [ShipCategory.ENGINEER]: GAME_DATA.ships.engineers,
    };

    const ships = categoryMap[category];
    if (!ships) {
        return sendError(res, '无效的船舶类别');
    }

    sendSuccess(res, ships);
});

// 获取特定船舶
router.get('/ships/:category/:id', (req: Request, res: Response) => {
    const { category, id } = req.params;

    const categoryMap: Record<string, any> = {
        [ShipCategory.WARSHIP]: GAME_DATA.ships.warships,
        [ShipCategory.EXPLORER]: GAME_DATA.ships.explorers,
        [ShipCategory.ENGINEER]: GAME_DATA.ships.engineers,
    };

    const ships = categoryMap[category];
    if (!ships) {
        return sendError(res, '无效的船舶类别');
    }

    const ship = ships.find((s: any) => s.id === id);
    if (!ship) {
        return sendError(res, '船舶不存在', 404);
    }

    sendSuccess(res, ship);
});

// 获取所有建筑
router.get('/buildings', (_req: Request, res: Response) => {
    sendSuccess(res, GAME_DATA.buildings);
});

// 获取特定类别的建筑
router.get('/buildings/:category', (req: Request, res: Response) => {
    const { category } = req.params;

    const categoryMap: Record<string, any> = {
        [BuildingCategory.MINING]: GAME_DATA.buildings.mining,
        [BuildingCategory.PROCESSING]: GAME_DATA.buildings.processing,
    };

    const buildings = categoryMap[category];
    if (!buildings) {
        return sendError(res, '无效的建筑类别');
    }

    sendSuccess(res, buildings);
});

// 获取所有加工配方
router.get('/recipes', (_req: Request, res: Response) => {
    sendSuccess(res, GAME_DATA.recipes);
});

// 获取特定配方
router.get('/recipes/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const recipe = GAME_DATA.recipes.find(r => r.recipeId === id);

    if (!recipe) {
        return sendError(res, '配方不存在', 404);
    }

    sendSuccess(res, recipe);
});

// 获取所有资源
router.get('/resources', (_req: Request, res: Response) => {
    sendSuccess(res, GAME_DATA.resources);
});

// 获取特定等级的资源
router.get('/resources/tier/:tier', (req: Request, res: Response) => {
    const tier = parseInt(req.params.tier);

    const tierMap: Record<number, any> = {
        [ResourceTier.PRIMARY]: GAME_DATA.resources.primary,
        [ResourceTier.SECONDARY]: GAME_DATA.resources.secondary,
        [ResourceTier.TERTIARY]: GAME_DATA.resources.tertiary,
    };

    const resources = tierMap[tier];
    if (!resources) {
        return sendError(res, '无效的资源等级');
    }

    sendSuccess(res, resources);
});

// 获取特定资源
router.get('/resources/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    const allResources = [
        ...GAME_DATA.resources.primary,
        ...GAME_DATA.resources.secondary,
        ...GAME_DATA.resources.tertiary
    ];

    const resource = allResources.find(r => r.id === id);

    if (!resource) {
        return sendError(res, '资源不存在', 404);
    }

    sendSuccess(res, resource);
});

export default router;

