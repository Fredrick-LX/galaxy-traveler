/**
 * 建筑类型定义
 */
// 建筑基础类型
export var BuildingCategory;
(function (BuildingCategory) {
    BuildingCategory["MINING"] = "mining";
    BuildingCategory["PROCESSING"] = "processing";
    BuildingCategory["CONSTRUCTION"] = "construction"; // 建造设施
})(BuildingCategory || (BuildingCategory = {}));
// 采矿设施子类型
export var MiningFacilityType;
(function (MiningFacilityType) {
    MiningFacilityType["ORE_EXTRACTOR"] = "ore_extractor";
    MiningFacilityType["GAS_HARVESTER"] = "gas_harvester";
    MiningFacilityType["CRYSTAL_MINER"] = "crystal_miner";
    MiningFacilityType["LIQUID_PUMP"] = "liquid_pump";
    MiningFacilityType["ADVANCED_MINING_COMPLEX"] = "advanced_mining_complex"; // 高级采矿综合体
})(MiningFacilityType || (MiningFacilityType = {}));
// 加工设施子类型
export var ProcessingFacilityType;
(function (ProcessingFacilityType) {
    ProcessingFacilityType["BASIC_REFINERY"] = "basic_refinery";
    ProcessingFacilityType["ADVANCED_REFINERY"] = "advanced_refinery";
    ProcessingFacilityType["CHEMICAL_PLANT"] = "chemical_plant";
    ProcessingFacilityType["ASSEMBLY_PLANT"] = "assembly_plant";
    ProcessingFacilityType["HIGH_TECH_FABRICATOR"] = "high_tech_fabricator"; // 高科技制造厂
})(ProcessingFacilityType || (ProcessingFacilityType = {}));
// 建造设施子类型
export var ConstructionFacilityType;
(function (ConstructionFacilityType) {
    ConstructionFacilityType["SHIPYARD"] = "shipyard";
    ConstructionFacilityType["COMPONENT_FACTORY"] = "component_factory";
    ConstructionFacilityType["STRUCTURE_CONSTRUCTOR"] = "structure_constructor";
    ConstructionFacilityType["REPAIR_STATION"] = "repair_station";
    ConstructionFacilityType["RESEARCH_LAB"] = "research_lab"; // 研究实验室
})(ConstructionFacilityType || (ConstructionFacilityType = {}));
// 建筑状态
export var BuildingStatus;
(function (BuildingStatus) {
    BuildingStatus["CONSTRUCTING"] = "constructing";
    BuildingStatus["IDLE"] = "idle";
    BuildingStatus["ACTIVE"] = "active";
    BuildingStatus["PAUSED"] = "paused";
    BuildingStatus["DAMAGED"] = "damaged";
    BuildingStatus["DESTROYED"] = "destroyed"; // 已摧毁
})(BuildingStatus || (BuildingStatus = {}));
