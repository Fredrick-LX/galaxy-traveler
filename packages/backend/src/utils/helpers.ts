/**
 * 通用辅助函数
 */

import { Position } from '@galaxy-traveler/shared';

/**
 * 计算两点之间的欧几里得距离
 */
export function calculateDistance(
    pos1: { x: number; y: number; z?: number },
    pos2: { x: number; y: number; z?: number }
): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = (pos1.z || 0) - (pos2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 将 Map 转换为普通对象
 */
export function mapToObject<K extends string | number, V>(map: Map<K, V>): Record<K, V> {
    const obj = {} as Record<K, V>;
    map.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

/**
 * 将对象转换为 Map
 */
export function objectToMap<K extends string | number, V>(obj: Record<K, V>): Map<K, V> {
    const map = new Map<K, V>();
    Object.entries(obj).forEach(([key, value]) => {
        map.set(key as K, value as V);
    });
    return map;
}

/**
 * 限制数值在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * 生成随机整数
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

