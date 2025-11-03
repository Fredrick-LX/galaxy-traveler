/**
 * 资源类型定义
 */
// 资源生产等级
export var ResourceTier;
(function (ResourceTier) {
    ResourceTier[ResourceTier["PRIMARY"] = 1] = "PRIMARY";
    ResourceTier[ResourceTier["SECONDARY"] = 2] = "SECONDARY";
    ResourceTier[ResourceTier["TERTIARY"] = 3] = "TERTIARY";
    ResourceTier[ResourceTier["QUATERNARY"] = 4] = "QUATERNARY"; // 四产：使用三产过程中产出
})(ResourceTier || (ResourceTier = {}));
// 一产资源类型
export var PrimaryResourceType;
(function (PrimaryResourceType) {
    // 矿石类
    PrimaryResourceType["IRON_ORE"] = "iron_ore";
    PrimaryResourceType["COPPER_ORE"] = "copper_ore";
    PrimaryResourceType["TITANIUM_ORE"] = "titanium_ore";
    PrimaryResourceType["RARE_METAL_ORE"] = "rare_metal_ore";
    // 气体类
    PrimaryResourceType["HYDROGEN_GAS"] = "hydrogen_gas";
    PrimaryResourceType["HELIUM_GAS"] = "helium_gas";
    PrimaryResourceType["NITROGEN_GAS"] = "nitrogen_gas";
    // 晶体类
    PrimaryResourceType["ENERGY_CRYSTAL"] = "energy_crystal";
    PrimaryResourceType["SILICON_CRYSTAL"] = "silicon_crystal";
    // 液体类
    PrimaryResourceType["CRUDE_OIL"] = "crude_oil";
    PrimaryResourceType["WATER"] = "water"; // 水
})(PrimaryResourceType || (PrimaryResourceType = {}));
// 二产资源类型
export var SecondaryResourceType;
(function (SecondaryResourceType) {
    // 金属
    SecondaryResourceType["IRON_PLATE"] = "iron_plate";
    SecondaryResourceType["COPPER_PLATE"] = "copper_plate";
    SecondaryResourceType["TITANIUM_ALLOY"] = "titanium_alloy";
    SecondaryResourceType["RARE_METAL_INGOT"] = "rare_metal_ingot";
    // 化学品
    SecondaryResourceType["PLASTIC"] = "plastic";
    SecondaryResourceType["FUEL"] = "fuel";
    SecondaryResourceType["CHEMICAL_REAGENT"] = "chemical_reagent";
    // 电子元件
    SecondaryResourceType["BASIC_CIRCUIT"] = "basic_circuit";
    SecondaryResourceType["SILICON_WAFER"] = "silicon_wafer";
    // 能源
    SecondaryResourceType["POWER_CELL"] = "power_cell"; // 能量电池
})(SecondaryResourceType || (SecondaryResourceType = {}));
// 三产资源类型
export var TertiaryResourceType;
(function (TertiaryResourceType) {
    // 高级材料
    TertiaryResourceType["COMPOSITE_MATERIAL"] = "composite_material";
    TertiaryResourceType["SUPERCONDUCTOR"] = "superconductor";
    TertiaryResourceType["NANO_MATERIAL"] = "nano_material";
    // 高级组件
    TertiaryResourceType["ADVANCED_CIRCUIT"] = "advanced_circuit";
    TertiaryResourceType["QUANTUM_PROCESSOR"] = "quantum_processor";
    TertiaryResourceType["REACTOR_CORE"] = "reactor_core";
    // 装备部件
    TertiaryResourceType["WEAPON_COMPONENT"] = "weapon_component";
    TertiaryResourceType["ARMOR_PLATE"] = "armor_plate";
    TertiaryResourceType["ENGINE_MODULE"] = "engine_module";
    TertiaryResourceType["SHIELD_GENERATOR"] = "shield_generator"; // 护盾发生器
})(TertiaryResourceType || (TertiaryResourceType = {}));
// 四产资源类型（使用三产过程中产生的副产品或特殊资源）
export var QuaternaryResourceType;
(function (QuaternaryResourceType) {
    // 研究点数
    QuaternaryResourceType["RESEARCH_DATA"] = "research_data";
    // 稀有资源
    QuaternaryResourceType["ANTIMATTER"] = "antimatter";
    QuaternaryResourceType["DARK_MATTER"] = "dark_matter";
    QuaternaryResourceType["EXOTIC_PARTICLES"] = "exotic_particles";
    // 特殊货币
    QuaternaryResourceType["TECH_POINTS"] = "tech_points";
    QuaternaryResourceType["STRATEGIC_RESOURCE"] = "strategic_resource"; // 战略资源
})(QuaternaryResourceType || (QuaternaryResourceType = {}));
// 交易类型
export var TransactionType;
(function (TransactionType) {
    TransactionType["PRODUCTION"] = "production";
    TransactionType["CONSUMPTION"] = "consumption";
    TransactionType["TRADE"] = "trade";
    TransactionType["TRANSFER"] = "transfer";
    TransactionType["DESTRUCTION"] = "destruction"; // 摧毁损失
})(TransactionType || (TransactionType = {}));
