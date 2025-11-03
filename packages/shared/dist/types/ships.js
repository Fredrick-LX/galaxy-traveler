/**
 * 船舶类型定义
 */
// 船舶基础类型
export var ShipCategory;
(function (ShipCategory) {
    ShipCategory["WARSHIP"] = "warship";
    ShipCategory["EXPLORER"] = "explorer";
    ShipCategory["ENGINEER"] = "engineer"; // 工程船
})(ShipCategory || (ShipCategory = {}));
// 战舰子类型
export var WarshipType;
(function (WarshipType) {
    WarshipType["DESTROYER"] = "destroyer";
    WarshipType["CRUISER"] = "cruiser";
    WarshipType["BATTLESHIP"] = "battleship";
    WarshipType["AIRCRAFT_CARRIER"] = "aircraft_carrier"; // 航空母舰
})(WarshipType || (WarshipType = {}));
// 部件槽类型
export var ComponentSlotType;
(function (ComponentSlotType) {
    ComponentSlotType["WEAPON"] = "weapon";
    ComponentSlotType["DEFENSE"] = "defense";
    ComponentSlotType["ENGINE"] = "engine";
    ComponentSlotType["UTILITY"] = "utility"; // 功能槽
})(ComponentSlotType || (ComponentSlotType = {}));
// 船舶状态
export var ShipStatus;
(function (ShipStatus) {
    ShipStatus["IDLE"] = "idle";
    ShipStatus["MOVING"] = "moving";
    ShipStatus["MINING"] = "mining";
    ShipStatus["CONSTRUCTING"] = "constructing";
    ShipStatus["COMBAT"] = "combat";
    ShipStatus["DESTROYED"] = "destroyed"; // 已摧毁
})(ShipStatus || (ShipStatus = {}));
