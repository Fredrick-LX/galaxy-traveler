/**
 * 船舶类型定义
 */

// 船舶基础类型
export enum ShipCategory {
  WARSHIP = 'warship',          // 战舰
  EXPLORER = 'explorer',         // 探索船
  ENGINEER = 'engineer'          // 工程船
}

// 战舰子类型
export enum WarshipType {
  DESTROYER = 'destroyer',           // 驱逐舰
  CRUISER = 'cruiser',              // 巡洋舰
  BATTLESHIP = 'battleship',        // 战列舰
  AIRCRAFT_CARRIER = 'aircraft_carrier' // 航空母舰
}

// 部件槽类型
export enum ComponentSlotType {
  WEAPON = 'weapon',          // 武器槽
  DEFENSE = 'defense',        // 防御槽
  ENGINE = 'engine',          // 引擎槽
  UTILITY = 'utility'         // 功能槽
}

// 部件槽定义
export interface ComponentSlot {
  type: ComponentSlotType;
  size: number;              // 槽位大小
  count: number;             // 槽位数量
}

// 战舰属性
export interface Warship {
  id: string;
  name: string;
  category: ShipCategory.WARSHIP;
  type: WarshipType;
  componentSlots: ComponentSlot[];  // 部件槽配置
  componentCapacity: number;        // 部件总容量
  baseStats: {
    health: number;                 // 基础生命值
    armor: number;                  // 基础装甲
    speed: number;                  // 基础速度
  };
}

// 探索船等级
export type ExplorerLevel = 1 | 2 | 3 | 4 | 5;

// 探索船加成
export interface ExplorerBonus {
  weaponBonus: number;      // 武器加成 (百分比)
  healthBonus: number;      // 生命加成 (百分比)
  speedBonus: number;       // 速度加成 (百分比)
  scanRange: number;        // 扫描范围
}

// 探索船属性
export interface ExplorerShip {
  id: string;
  name: string;
  category: ShipCategory.EXPLORER;
  level: ExplorerLevel;
  bonus: ExplorerBonus;
  baseStats: {
    health: number;
    speed: number;
    cargoCapacity: number;  // 货物容量
  };
}

// 工程船等级
export type EngineerLevel = 1 | 2 | 3 | 4 | 5;

// 工程船加成
export interface EngineerBonus {
  capacityBonus: number;          // 容量加成 (百分比)
  speedBonus: number;             // 速度加成 (百分比)
  constructionSpeedBonus: number; // 建设速度加成 (百分比)
  miningEfficiency: number;       // 采集效率加成 (百分比)
}

// 工程船属性
export interface EngineerShip {
  id: string;
  name: string;
  category: ShipCategory.ENGINEER;
  level: EngineerLevel;
  bonus: EngineerBonus;
  baseStats: {
    health: number;
    speed: number;
    cargoCapacity: number;        // 货物容量
    constructionPower: number;    // 建造能力
  };
}

// 船舶联合类型
export type Ship = Warship | ExplorerShip | EngineerShip;

// 船舶实例（玩家拥有的船）
export interface ShipInstance {
  instanceId: string;
  shipId: string;              // 关联的船舶模板ID
  ownerId: string;             // 拥有者ID
  currentHealth: number;       // 当前生命值
  position?: {
    x: number;
    y: number;
    z: number;
  };
  status: ShipStatus;
  components?: string[];       // 已装备的部件ID列表（战舰用）
}

// 船舶状态
export enum ShipStatus {
  IDLE = 'idle',               // 空闲
  MOVING = 'moving',           // 移动中
  MINING = 'mining',           // 采集中
  CONSTRUCTING = 'constructing', // 建造中
  COMBAT = 'combat',           // 战斗中
  DESTROYED = 'destroyed'      // 已摧毁
}

