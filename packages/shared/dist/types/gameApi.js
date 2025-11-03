/**
 * 游戏API类型定义
 * 提供给玩家编写代码时使用的API接口
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
// 查找类型常量
export var FIND;
(function (FIND) {
    FIND[FIND["MY_SHIPS"] = 101] = "MY_SHIPS";
    FIND[FIND["HOSTILE_SHIPS"] = 102] = "HOSTILE_SHIPS";
    FIND[FIND["RESOURCES"] = 103] = "RESOURCES";
    FIND[FIND["STRUCTURES"] = 104] = "STRUCTURES";
    FIND[FIND["MY_STRUCTURES"] = 105] = "MY_STRUCTURES";
    FIND[FIND["HOSTILE_STRUCTURES"] = 106] = "HOSTILE_STRUCTURES";
})(FIND || (FIND = {}));
