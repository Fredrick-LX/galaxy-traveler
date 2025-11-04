/**
 * 数据库初始化
 */

import { Level } from 'level';
import path from 'path';

// 数据库路径
const DB_PATH = path.join(process.cwd(), 'data', 'GT_DB');

// 数据库前缀，格式化玩家数据
const DB_PREFIX = {
    USER_NAME: 'name:',
    USER_EMAIL: 'email:',
    USER_PASSWORD: 'password:',
    USER_UUID: 'uuid:',
    USER_DATA: 'data:',
};

// 创建数据库实例（使用 utf8 编码，手动序列化）
const db = new Level(DB_PATH, { valueEncoding: 'utf8' });

/**
 * @description 序列化数据
 * @param data 数据
 * @returns 序列化后的数据
 */
function serialize<T>(data: T): string {
    return JSON.stringify(data);
}

/**
 * @description 反序列化数据
 * @param data 数据
 * @returns 反序列化后的数据
 */
function deserialize<T>(data: string): T {
    // 处理 undefined 或空字符串的情况
    if (!data || data === 'undefined' || data === 'null') {
        throw new Error('INVALID_DATA');
    }
    return JSON.parse(data) as T;
}

/**
 * @description 插入数据到数据库
 * @param key 键
 * @param data 数据
 * @returns 是否插入成功
 */
async function putData<T>(key: string, data: T): Promise<boolean> {
    try {
        // 防止插入 undefined 或 null
        if (data === undefined || data === null) {
            console.error('尝试插入无效数据:', key);
            return false;
        }

        const serializedData = serialize(data);
        await db.put(key, serializedData);
        return true;
    } catch (error) {
        console.error('插入数据失败:', error);
        return false;
    }
}

/**
 * @description 从数据库获取数据
 * @param key 键
 * @returns 数据
 */
async function getData<T>(key: string): Promise<T | null> {
    try {
        const data = await db.get(key);

        // 检查数据是否有效
        if (!data || data === 'undefined' || data === 'null') {
            return null;
        }

        return deserialize<T>(data);
    } catch (error: any) {
        // 键不存在时返回 null，不打印错误
        if (error.notFound || error.code === 'LEVEL_NOT_FOUND' || error.type === 'NotFoundError') {
            return null;
        }
        // 处理无效数据
        if (error.message === 'INVALID_DATA') {
            return null;
        }
        console.error('获取数据失败:', error);
        return null;
    }
}

/**
 * @description 更新数据库中的数据
 * @param key 键
 * @param partialData 部分数据
 * @param mergeFunction 合并函数
 * @returns 是否更新成功
 */
async function updateData<T>(
    key: string,
    partialData: Partial<T>,
    mergeFunction?: (oldData: T, newData: Partial<T>) => T
): Promise<boolean> {
    try {
        // 获取当前数据
        const currentData = await getData<T>(key);
        if (currentData === null) {
            throw new Error(`未找到键为 ${key} 的数据`);
        }

        // 使用提供的合并函数或默认合并逻辑来合并数据
        const mergedData = mergeFunction
            ? mergeFunction(currentData, partialData)
            : { ...currentData, ...partialData };

        // 序列化合并后的数据并存储
        const serializedData = serialize(mergedData);
        await db.put(key, serializedData);
        return true;
    } catch (error) {
        console.error('更新数据失败:', error);
        return false;
    }
}

/**
 * @description 根据前缀获取所有匹配的键
 * @param prefix 前缀
 * @returns 键列表
 */
async function getKeys(prefix: string): Promise<string[] | null> {
    try {
        const keys: string[] = [];
        const stream = db.keys({ gte: prefix, lt: prefix + '\uffff' });
        for await (const key of stream) {
            keys.push(key);
        }
        return keys;
    } catch (error) {
        console.error('获取键列表失败:', error);
        return null;
    }
}

/**
 * @description 初始化数据库
 */
async function initDatabase(): Promise<void> {
    try {
        // 检查数据库是否已经打开
        if (db.status === 'open') {
            console.log('✅ LevelDB 数据库已经打开');
            return;
        }

        await db.open();
        console.log('✅ LevelDB 数据库已初始化');
    } catch (error: any) {
        if (error.code === 'LEVEL_LOCKED') {
            console.error('❌ 数据库被锁定，可能有其他进程正在使用');
            console.error('   请确保没有其他后端实例正在运行');
        } else {
            console.error('❌ 数据库初始化失败:', error);
        }
        throw error;
    }
}

/**
 * @description 关闭数据库
 */
async function closeDatabase(): Promise<void> {
    try {
        // 检查数据库状态
        if (db.status === 'closed' || db.status === 'closing') {
            console.log('⚠️ 数据库已经关闭或正在关闭');
            return;
        }

        if (db.status !== 'open') {
            console.log('⚠️ 数据库未打开，无需关闭');
            return;
        }

        await db.close();
        console.log('✅ LevelDB 数据库已关闭');
    } catch (error: any) {
        // 如果数据库已经关闭，不报错
        if (error.code === 'LEVEL_DATABASE_NOT_OPEN') {
            console.log('⚠️ 数据库已经关闭');
            return;
        }
        console.error('❌ 关闭数据库失败:', error);
        throw error;
    }
}

export {
    DB_PREFIX,
    db,
    putData,
    getData,
    updateData,
    getKeys,
    initDatabase,
    closeDatabase
};