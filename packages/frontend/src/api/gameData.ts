/**
 * 游戏数据API服务
 */

import axios from 'axios';
import {
    ShipCategory,
    BuildingCategory,
    ResourceTier
} from '@galaxy-traveler/shared';
import type {
    Ship,
    Warship,
    ExplorerShip,
    EngineerShip,
    Building,
    MiningFacility,
    ProcessingFacility,
    ProcessingRecipe,
    Resource,
    PrimaryResource,
    SecondaryResource,
    TertiaryResource
} from '@galaxy-traveler/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ==================== 船舶相关API ====================

/**
 * 获取所有船舶数据
 */
export async function getAllShips() {
    const response = await axios.get<ApiResponse<{
        warships: Warship[];
        explorers: ExplorerShip[];
        engineers: EngineerShip[];
    }>>(`${API_BASE_URL}/game-data/ships`);
    return response.data;
}

/**
 * 获取特定类别的船舶
 */
export async function getShipsByCategory(category: ShipCategory) {
    const response = await axios.get<ApiResponse<Ship[]>>(
        `${API_BASE_URL}/game-data/ships/${category}`
    );
    return response.data;
}

/**
 * 获取战舰列表
 */
export async function getWarships() {
    const response = await getShipsByCategory(ShipCategory.WARSHIP);
    return response.data as Warship[] | undefined;
}

/**
 * 获取探索船列表
 */
export async function getExplorerShips() {
    const response = await getShipsByCategory(ShipCategory.EXPLORER);
    return response.data as ExplorerShip[] | undefined;
}

/**
 * 获取工程船列表
 */
export async function getEngineerShips() {
    const response = await getShipsByCategory(ShipCategory.ENGINEER);
    return response.data as EngineerShip[] | undefined;
}

/**
 * 获取特定船舶详情
 */
export async function getShipById(category: ShipCategory, id: string) {
    const response = await axios.get<ApiResponse<Ship>>(
        `${API_BASE_URL}/game-data/ships/${category}/${id}`
    );
    return response.data;
}

// ==================== 建筑相关API ====================

/**
 * 获取所有建筑数据
 */
export async function getAllBuildings() {
    const response = await axios.get<ApiResponse<{
        mining: MiningFacility[];
        processing: ProcessingFacility[];
    }>>(`${API_BASE_URL}/game-data/buildings`);
    return response.data;
}

/**
 * 获取特定类别的建筑
 */
export async function getBuildingsByCategory(category: BuildingCategory) {
    const response = await axios.get<ApiResponse<Building[]>>(
        `${API_BASE_URL}/game-data/buildings/${category}`
    );
    return response.data;
}

/**
 * 获取采矿设施列表
 */
export async function getMiningFacilities() {
    const response = await getBuildingsByCategory(BuildingCategory.MINING);
    return response.data as MiningFacility[] | undefined;
}

/**
 * 获取加工设施列表
 */
export async function getProcessingFacilities() {
    const response = await getBuildingsByCategory(BuildingCategory.PROCESSING);
    return response.data as ProcessingFacility[] | undefined;
}

// ==================== 配方相关API ====================

/**
 * 获取所有加工配方
 */
export async function getAllRecipes() {
    const response = await axios.get<ApiResponse<ProcessingRecipe[]>>(
        `${API_BASE_URL}/game-data/recipes`
    );
    return response.data;
}

/**
 * 获取特定配方详情
 */
export async function getRecipeById(id: string) {
    const response = await axios.get<ApiResponse<ProcessingRecipe>>(
        `${API_BASE_URL}/game-data/recipes/${id}`
    );
    return response.data;
}

// ==================== 资源相关API ====================

/**
 * 获取所有资源数据
 */
export async function getAllResources() {
    const response = await axios.get<ApiResponse<{
        primary: PrimaryResource[];
        secondary: SecondaryResource[];
        tertiary: TertiaryResource[];
    }>>(`${API_BASE_URL}/game-data/resources`);
    return response.data;
}

/**
 * 获取特定等级的资源
 */
export async function getResourcesByTier(tier: ResourceTier) {
    const response = await axios.get<ApiResponse<Resource[]>>(
        `${API_BASE_URL}/game-data/resources/tier/${tier}`
    );
    return response.data;
}

/**
 * 获取一产资源列表
 */
export async function getPrimaryResources() {
    const response = await getResourcesByTier(ResourceTier.PRIMARY);
    return response.data as PrimaryResource[] | undefined;
}

/**
 * 获取二产资源列表
 */
export async function getSecondaryResources() {
    const response = await getResourcesByTier(ResourceTier.SECONDARY);
    return response.data as SecondaryResource[] | undefined;
}

/**
 * 获取三产资源列表
 */
export async function getTertiaryResources() {
    const response = await getResourcesByTier(ResourceTier.TERTIARY);
    return response.data as TertiaryResource[] | undefined;
}

/**
 * 获取特定资源详情
 */
export async function getResourceById(id: string) {
    const response = await axios.get<ApiResponse<Resource>>(
        `${API_BASE_URL}/game-data/resources/${id}`
    );
    return response.data;
}

// ==================== 辅助函数 ====================

/**
 * 获取所有游戏数据
 */
export async function getAllGameData() {
    const response = await axios.get<ApiResponse<{
        ships: {
            warships: Warship[];
            explorers: ExplorerShip[];
            engineers: EngineerShip[];
        };
        buildings: {
            mining: MiningFacility[];
            processing: ProcessingFacility[];
        };
        recipes: ProcessingRecipe[];
        resources: {
            primary: PrimaryResource[];
            secondary: SecondaryResource[];
            tertiary: TertiaryResource[];
        };
    }>>(`${API_BASE_URL}/game-data/all`);
    return response.data;
}

