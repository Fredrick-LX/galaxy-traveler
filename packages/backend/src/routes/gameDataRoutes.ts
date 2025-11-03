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

const router = Router();

// 获取所有游戏数据
router.get('/all', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: GAME_DATA
  });
});

// 获取所有船舶
router.get('/ships', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: GAME_DATA.ships
  });
});

// 获取特定类别的船舶
router.get('/ships/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  
  let ships;
  switch (category) {
    case ShipCategory.WARSHIP:
      ships = GAME_DATA.ships.warships;
      break;
    case ShipCategory.EXPLORER:
      ships = GAME_DATA.ships.explorers;
      break;
    case ShipCategory.ENGINEER:
      ships = GAME_DATA.ships.engineers;
      break;
    default:
      return res.status(400).json({
        success: false,
        error: '无效的船舶类别'
      });
  }
  
  res.json({
    success: true,
    data: ships
  });
});

// 获取特定船舶
router.get('/ships/:category/:id', (req: Request, res: Response) => {
  const { category, id } = req.params;
  
  let ships;
  switch (category) {
    case ShipCategory.WARSHIP:
      ships = GAME_DATA.ships.warships;
      break;
    case ShipCategory.EXPLORER:
      ships = GAME_DATA.ships.explorers;
      break;
    case ShipCategory.ENGINEER:
      ships = GAME_DATA.ships.engineers;
      break;
    default:
      return res.status(400).json({
        success: false,
        error: '无效的船舶类别'
      });
  }
  
  const ship = ships.find(s => s.id === id);
  if (!ship) {
    return res.status(404).json({
      success: false,
      error: '船舶不存在'
    });
  }
  
  res.json({
    success: true,
    data: ship
  });
});

// 获取所有建筑
router.get('/buildings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: GAME_DATA.buildings
  });
});

// 获取特定类别的建筑
router.get('/buildings/:category', (req: Request, res: Response) => {
  const { category } = req.params;
  
  let buildings;
  switch (category) {
    case BuildingCategory.MINING:
      buildings = GAME_DATA.buildings.mining;
      break;
    case BuildingCategory.PROCESSING:
      buildings = GAME_DATA.buildings.processing;
      break;
    default:
      return res.status(400).json({
        success: false,
        error: '无效的建筑类别'
      });
  }
  
  res.json({
    success: true,
    data: buildings
  });
});

// 获取所有加工配方
router.get('/recipes', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: GAME_DATA.recipes
  });
});

// 获取特定配方
router.get('/recipes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const recipe = GAME_DATA.recipes.find(r => r.recipeId === id);
  
  if (!recipe) {
    return res.status(404).json({
      success: false,
      error: '配方不存在'
    });
  }
  
  res.json({
    success: true,
    data: recipe
  });
});

// 获取所有资源
router.get('/resources', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: GAME_DATA.resources
  });
});

// 获取特定等级的资源
router.get('/resources/tier/:tier', (req: Request, res: Response) => {
  const tier = parseInt(req.params.tier);
  
  let resources;
  switch (tier) {
    case ResourceTier.PRIMARY:
      resources = GAME_DATA.resources.primary;
      break;
    case ResourceTier.SECONDARY:
      resources = GAME_DATA.resources.secondary;
      break;
    case ResourceTier.TERTIARY:
      resources = GAME_DATA.resources.tertiary;
      break;
    default:
      return res.status(400).json({
        success: false,
        error: '无效的资源等级'
      });
  }
  
  res.json({
    success: true,
    data: resources
  });
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
    return res.status(404).json({
      success: false,
      error: '资源不存在'
    });
  }
  
  res.json({
    success: true,
    data: resource
  });
});

export default router;

