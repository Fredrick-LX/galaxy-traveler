/**
 * 游戏运行时对象定义
 */
// 游戏常量
export const GAME_CONSTANTS = {
    // 返回码
    OK: 0,
    ERR_NOT_OWNER: -1,
    ERR_NO_PATH: -2,
    ERR_BUSY: -3,
    ERR_NOT_FOUND: -4,
    ERR_NOT_ENOUGH_RESOURCES: -5,
    ERR_INVALID_TARGET: -6,
    ERR_FULL: -7,
    ERR_NOT_IN_RANGE: -8,
    ERR_INVALID_ARGS: -9,
    ERR_TIRED: -10,
    ERR_NO_BODYPART: -11,
    ERR_RCL_NOT_ENOUGH: -12,
    // 游戏参数
    TICK_DURATION: 1000, // 每tick持续时间（毫秒）
    MAX_CARGO_DISTANCE: 1, // 最大货物操作距离
    MAX_HARVEST_DISTANCE: 1, // 最大采集距离
};
