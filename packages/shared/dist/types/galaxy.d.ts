/**
 * 星系和天体类型定义
 */
export declare const GALAXY_CONSTANTS: {
    readonly SIDE_LENGTH: 30;
    readonly MAX_RADIUS: 11.25;
};
export declare enum CelestialType {
    STAR = "star",// 恒星
    GAS_GIANT = "gas_giant",// 气态巨星
    TERRESTRIAL = "terrestrial",// 类地行星
    ASTEROID = "asteroid",// 小行星
    ASTEROID_BELT = "asteroid_belt",// 小行星带
    NEUTRON_STAR = "neutron_star",// 中子星
    PULSAR = "pulsar",// 脉冲星
    BLACK_HOLE = "black_hole",// 黑洞
    DWARF_PLANET = "dwarf_planet",// 矮行星
    ICE_GIANT = "ice_giant"
}
export declare enum StarType {
    O_TYPE = "O",// 蓝色超巨星
    B_TYPE = "B",// 蓝白色巨星
    A_TYPE = "A",// 白色主序星
    F_TYPE = "F",// 黄白色主序星
    G_TYPE = "G",// 黄色主序星（太阳类型）
    K_TYPE = "K",// 橙色主序星
    M_TYPE = "M"
}
export interface CelestialBody {
    id: string;
    name: string;
    type: CelestialType;
    position: {
        x: number;
        y: number;
        z: number;
    };
    mass: number;
    radius: number;
    temperature?: number;
    orbitRadius?: number;
    orbitAngle?: number;
    resources?: string[];
}
export interface Star extends CelestialBody {
    type: CelestialType.STAR;
    starType: StarType;
    luminosity: number;
}
export interface Planet extends CelestialBody {
    type: CelestialType.TERRESTRIAL | CelestialType.GAS_GIANT | CelestialType.ICE_GIANT | CelestialType.DWARF_PLANET;
    atmosphere?: string[];
    hasRings?: boolean;
    moons?: CelestialBody[];
}
export interface AsteroidBelt extends CelestialBody {
    type: CelestialType.ASTEROID_BELT;
    density: number;
    asteroidCount: number;
}
export interface ExoticCelestial extends CelestialBody {
    type: CelestialType.NEUTRON_STAR | CelestialType.PULSAR | CelestialType.BLACK_HOLE;
    rotationSpeed?: number;
    magneticField?: number;
}
export declare enum GalaxyType {
    SINGLE_STAR = "single_star",// 单星系统
    BINARY_STAR = "binary_star",// 双星系统
    TRIPLE_STAR = "triple_star",// 三星系统
    BLACK_HOLE = "black_hole",// 黑洞系统
    NEUTRON_STAR = "neutron_star",// 中子星系统
    PULSAR = "pulsar"
}
export interface Galaxy {
    id: string;
    name: string;
    type: GalaxyType;
    position: {
        x: number;
        y: number;
        z: number;
    };
    centerBody: Star | ExoticCelestial;
    centerBodies?: (Star | ExoticCelestial)[];
    bodies: CelestialBody[];
    connections: string[];
    controlled?: string;
}
export interface GalaxyNetwork {
    galaxies: Map<string, Galaxy>;
    connections: Map<string, string[]>;
    seed: number;
}
export interface GalaxyGenerationConfig {
    galaxyCount: number;
    minDistance: number;
    maxDistance: number;
    connectionProbability: number;
    seed?: number;
}
