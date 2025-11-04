/**
 * 星系和天体类型定义
 */
// 星系常量配置
export const GALAXY_CONSTANTS = {
    SIDE_LENGTH: 30, // 单个星系的边长（gu）
    MAX_RADIUS: 11.25, // 最大轨道半径（SIDE_LENGTH * 0.75 / 2）
};
// 天体类型
export var CelestialType;
(function (CelestialType) {
    CelestialType["STAR"] = "star";
    CelestialType["GAS_GIANT"] = "gas_giant";
    CelestialType["TERRESTRIAL"] = "terrestrial";
    CelestialType["ASTEROID"] = "asteroid";
    CelestialType["ASTEROID_BELT"] = "asteroid_belt";
    CelestialType["NEUTRON_STAR"] = "neutron_star";
    CelestialType["PULSAR"] = "pulsar";
    CelestialType["BLACK_HOLE"] = "black_hole";
    CelestialType["DWARF_PLANET"] = "dwarf_planet";
    CelestialType["ICE_GIANT"] = "ice_giant";
})(CelestialType || (CelestialType = {}));
// 恒星类型
export var StarType;
(function (StarType) {
    StarType["O_TYPE"] = "O";
    StarType["B_TYPE"] = "B";
    StarType["A_TYPE"] = "A";
    StarType["F_TYPE"] = "F";
    StarType["G_TYPE"] = "G";
    StarType["K_TYPE"] = "K";
    StarType["M_TYPE"] = "M";
})(StarType || (StarType = {}));
// 星系类型
export var GalaxyType;
(function (GalaxyType) {
    GalaxyType["SINGLE_STAR"] = "single_star";
    GalaxyType["BINARY_STAR"] = "binary_star";
    GalaxyType["TRIPLE_STAR"] = "triple_star";
    GalaxyType["BLACK_HOLE"] = "black_hole";
    GalaxyType["NEUTRON_STAR"] = "neutron_star";
    GalaxyType["PULSAR"] = "pulsar";
})(GalaxyType || (GalaxyType = {}));
