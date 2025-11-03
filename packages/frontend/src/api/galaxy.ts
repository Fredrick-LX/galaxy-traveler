/**
 * 星系API服务
 */

import axios from 'axios';
import type { Galaxy } from '@galaxy-traveler/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface GalaxyNetworkData {
  galaxies: { [id: string]: Galaxy };
  connections: { [id: string]: string[] };
  seed: number;
}

/**
 * 获取星系网络数据
 */
export async function getGalaxyNetwork(seed?: number) {
  const url = seed 
    ? `${API_BASE_URL}/galaxy/network?seed=${seed}` 
    : `${API_BASE_URL}/galaxy/network`;
  
  const response = await axios.get<ApiResponse<GalaxyNetworkData>>(url);
  return response.data;
}

/**
 * 获取单个星系详情
 */
export async function getGalaxyById(id: string) {
  const response = await axios.get<ApiResponse<Galaxy>>(
    `${API_BASE_URL}/galaxy/galaxy/${id}`
  );
  return response.data;
}

/**
 * 重新生成星系网络
 */
export async function regenerateGalaxyNetwork(seed?: number, galaxyCount?: number) {
  const response = await axios.post<ApiResponse<GalaxyNetworkData>>(
    `${API_BASE_URL}/galaxy/regenerate`,
    { seed, galaxyCount }
  );
  return response.data;
}

/**
 * 获取指定区域的星系
 */
export async function getGalaxiesInRegion(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) {
  const response = await axios.get<ApiResponse<{ galaxies: Galaxy[] }>>(
    `${API_BASE_URL}/galaxy/region`,
    {
      params: { minX, maxX, minY, maxY }
    }
  );
  return response.data;
}

