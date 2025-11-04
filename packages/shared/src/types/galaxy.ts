/**
 * 星系和天体类型定义
 */

// 天体类型
export enum CelestialType {
    STAR = 'star',                    // 恒星
    GAS_GIANT = 'gas_giant',          // 气态巨星
    TERRESTRIAL = 'terrestrial',       // 类地行星
    ASTEROID = 'asteroid',             // 小行星
    ASTEROID_BELT = 'asteroid_belt',   // 小行星带
    NEUTRON_STAR = 'neutron_star',     // 中子星
    PULSAR = 'pulsar',                 // 脉冲星
    BLACK_HOLE = 'black_hole',         // 黑洞
    DWARF_PLANET = 'dwarf_planet',     // 矮行星
    ICE_GIANT = 'ice_giant',           // 冰巨星
}

// 恒星类型
export enum StarType {
    O_TYPE = 'O',  // 蓝色超巨星
    B_TYPE = 'B',  // 蓝白色巨星
    A_TYPE = 'A',  // 白色主序星
    F_TYPE = 'F',  // 黄白色主序星
    G_TYPE = 'G',  // 黄色主序星（太阳类型）
    K_TYPE = 'K',  // 橙色主序星
    M_TYPE = 'M',  // 红矮星
}

// 天体基础属性
export interface CelestialBody {
    id: string;
    name: string;
    type: CelestialType;
    position: {
        x: number;
        y: number;
        z: number;
    };
    mass: number;           // 质量
    radius: number;         // 半径
    temperature?: number;   // 温度
    orbitRadius?: number;   // 轨道半径（围绕中心天体）
    orbitAngle?: number;    // 轨道角度
    resources?: string[];   // 可采集资源类型
}

// 恒星
export interface Star extends CelestialBody {
    type: CelestialType.STAR;
    starType: StarType;
    luminosity: number;     // 光度
}

// 行星
export interface Planet extends CelestialBody {
    type: CelestialType.TERRESTRIAL | CelestialType.GAS_GIANT | CelestialType.ICE_GIANT | CelestialType.DWARF_PLANET;
    atmosphere?: string[];  // 大气成分
    hasRings?: boolean;     // 是否有环
    moons?: CelestialBody[]; // 卫星
}

// 小行星带
export interface AsteroidBelt extends CelestialBody {
    type: CelestialType.ASTEROID_BELT;
    density: number;        // 密度
    asteroidCount: number;  // 小行星数量
}

// 特殊天体（中子星、脉冲星、黑洞）
export interface ExoticCelestial extends CelestialBody {
    type: CelestialType.NEUTRON_STAR | CelestialType.PULSAR | CelestialType.BLACK_HOLE;
    rotationSpeed?: number;  // 旋转速度
    magneticField?: number;  // 磁场强度
}

// 星系类型
export enum GalaxyType {
    SINGLE_STAR = 'single_star',     // 单星系统
    BINARY_STAR = 'binary_star',     // 双星系统
    TRIPLE_STAR = 'triple_star',     // 三星系统
    BLACK_HOLE = 'black_hole',       // 黑洞系统
    NEUTRON_STAR = 'neutron_star',   // 中子星系统
    PULSAR = 'pulsar',               // 脉冲星系统
}

// 星系
export interface Galaxy {
    id: string;
    name: string;
    type: GalaxyType;                    // 星系类型
    position: {
        x: number;
        y: number;
        z: number;
    };
    centerBody: Star | ExoticCelestial; // 主中心天体
    centerBodies?: (Star | ExoticCelestial)[]; // 多星系统的所有中心天体
    bodies: CelestialBody[];             // 所有天体
    connections: string[];               // 连接到其他星系的ID
    controlled?: string;                 // 控制者ID（玩家或NPC）
}

// 星系网络（宇宙拓扑结构）
export interface GalaxyNetwork {
    galaxies: Map<string, Galaxy>;
    connections: Map<string, string[]>; // 星系ID -> 连接的星系ID列表
    seed: number;                        // 随机种子
}

// 星系生成配置
export interface GalaxyGenerationConfig {
    galaxyCount: number;        // 星系数量
    minDistance: number;        // 最小星系间距
    maxDistance: number;        // 最大星系间距
    connectionProbability: number; // 连接概率
    seed?: number;              // 随机种子
}

