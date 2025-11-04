/**
 * 星系生成器
 * 使用 simplex-noise 和 alea 生成伪随机星系网络
 */

import { createNoise3D } from 'simplex-noise';
import alea from 'alea';
import { calculateDistance } from '@/utils/helpers';
import {
    Galaxy,
    GalaxyNetwork,
    GalaxyGenerationConfig,
    GalaxyType,
    CelestialBody,
    CelestialType,
    Star,
    StarType,
    Planet,
    AsteroidBelt,
    ExoticCelestial,
    GALAXY_CONSTANTS,
} from '@galaxy-traveler/shared';

export class GalaxyGenerator {
    private noise3D: ReturnType<typeof createNoise3D>;
    private rng: ReturnType<typeof alea>;
    private seed: number;

    constructor(seed?: number) {
        this.seed = seed || Date.now();
        this.rng = alea(this.seed);
        this.noise3D = createNoise3D(this.rng);
    }

    /**
     * 为指定坐标创建一个确定性的RNG
     */
    private createLocalRng(x: number, y: number): ReturnType<typeof alea> {
        // 使用主种子和坐标创建确定性种子
        const localSeed = this.seed + x * 73856093 + y * 19349663;
        return alea(localSeed);
    }

    /**
     * 生成指定区域内的星系
     * @param minX 区域最小X坐标
     * @param maxX 区域最大X坐标
     * @param minY 区域最小Y坐标
     * @param maxY 区域最大Y坐标
     * @param density 星系密度（每100x100单位的星系数量）
     */
    generateGalaxiesInRegion(
        minX: number,
        maxX: number,
        minY: number,
        maxY: number,
        density: number = 0.8
    ): Galaxy[] {
        const galaxies: Galaxy[] = [];
        const gridSize = 150; // 网格大小

        // 计算覆盖该区域的所有网格
        const startGridX = Math.floor(minX / gridSize);
        const endGridX = Math.ceil(maxX / gridSize);
        const startGridY = Math.floor(minY / gridSize);
        const endGridY = Math.ceil(maxY / gridSize);

        // 遍历每个网格
        for (let gridX = startGridX; gridX <= endGridX; gridX++) {
            for (let gridY = startGridY; gridY <= endGridY; gridY++) {
                // 为这个网格创建确定性RNG
                const localRng = this.createLocalRng(gridX, gridY);

                // 使用噪声决定这个网格是否有星系
                const noiseValue = this.noise3D(gridX * 0.1, gridY * 0.1, 0);
                const hasGalaxy = (noiseValue + 1) / 2 < density;

                if (hasGalaxy) {
                    // 在网格内生成星系位置（确定性）
                    const offsetX = localRng() * gridSize;
                    const offsetY = localRng() * gridSize;
                    const x = gridX * gridSize + offsetX;
                    const y = gridY * gridSize + offsetY;
                    const z = (localRng() - 0.5) * 50;

                    // 生成星系ID（基于网格坐标）
                    const id = `galaxy_${gridX}_${gridY}`;

                    // 检查是否在请求的区域内
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                        const galaxy = this.generateGalaxyAtPosition(
                            id,
                            { x, y, z },
                            gridX,
                            gridY,
                            false
                        );
                        galaxies.push(galaxy);
                    }
                }
            }
        }

        return galaxies;
    }

    /**
     * 在指定位置生成单个星系（使用位置确定性种子）
     */
    private generateGalaxyAtPosition(
        id: string,
        position: { x: number; y: number; z: number },
        gridX: number,
        gridY: number,
        isStarting: boolean
    ): Galaxy {
        // 创建该位置的确定性RNG
        const localRng = this.createLocalRng(gridX, gridY);
        const noise = this.noise3D(position.x * 0.01, position.y * 0.01, position.z * 0.01);

        // 使用本地RNG生成星系
        const rand = localRng();

        // 决定星系类型
        let galaxyType: GalaxyType;
        let centerBodies: (Star | ExoticCelestial)[] = [];

        if (rand < 0.02) {
            galaxyType = GalaxyType.BLACK_HOLE;
            centerBodies.push(this.generateBlackHole(id, localRng));
        } else if (rand < 0.04) {
            galaxyType = GalaxyType.NEUTRON_STAR;
            centerBodies.push(this.generateNeutronStar(id, localRng));
        } else if (rand < 0.05) {
            galaxyType = GalaxyType.PULSAR;
            centerBodies.push(this.generatePulsar(id, localRng));
        } else if (rand < 0.20) {
            galaxyType = GalaxyType.BINARY_STAR;
            centerBodies.push(this.generateStar(`${id}_star_a`, noise, localRng));
            centerBodies.push(this.generateStar(`${id}_star_b`, noise + 0.5, localRng));
            // 调整双星位置，使它们在中心附近分布
            centerBodies[0].position = { x: -1, y: 0, z: 0 };
            centerBodies[1].position = { x: 1, y: 0, z: 0 };
        } else if (rand < 0.25) {
            galaxyType = GalaxyType.TRIPLE_STAR;
            centerBodies.push(this.generateStar(`${id}_star_a`, noise, localRng));
            centerBodies.push(this.generateStar(`${id}_star_b`, noise + 0.3, localRng));
            centerBodies.push(this.generateStar(`${id}_star_c`, noise + 0.6, localRng));
            // 调整三星位置，形成三角形分布
            centerBodies[0].position = { x: 0, y: -1.2, z: 0 };
            centerBodies[1].position = { x: -1, y: 0.6, z: 0 };
            centerBodies[2].position = { x: 1, y: 0.6, z: 0 };
        } else {
            galaxyType = GalaxyType.SINGLE_STAR;
            centerBodies.push(this.generateStar(id, noise, localRng));
        }

        const centerBody = centerBodies[0];
        const bodies: CelestialBody[] = [...centerBodies];

        // 根据星系类型和中心天体数量决定天体数量
        let bodyCount: number;
        if (galaxyType === GalaxyType.NEUTRON_STAR || galaxyType === GalaxyType.PULSAR) {
            // 中子星和脉冲星系统天体较少
            bodyCount = Math.floor(2 + localRng() * 4); // 2-5个天体
        } else if (galaxyType === GalaxyType.BLACK_HOLE) {
            // 黑洞系统天体数量适中
            bodyCount = Math.floor(3 + localRng() * 5); // 3-7个天体
        } else if (galaxyType === GalaxyType.TRIPLE_STAR) {
            // 三星系统天体较少（中心天体多）
            bodyCount = Math.floor(4 + localRng() * 5); // 4-8个天体
        } else if (galaxyType === GalaxyType.BINARY_STAR) {
            // 双星系统天体适中
            bodyCount = Math.floor(5 + localRng() * 6); // 5-10个天体
        } else {
            // 单星系统天体最多
            bodyCount = Math.floor(6 + localRng() * 8); // 6-13个天体
        }

        // 生成围绕中心的天体
        for (let i = 0; i < bodyCount; i++) {
            const body = this.generateOrbitalBody(id, i, centerBody, localRng, galaxyType);
            if (body) {
                bodies.push(body);
            }
        }

        return {
            id,
            name: this.generateGalaxyName(id, localRng),
            type: galaxyType,
            position,
            centerBody,
            centerBodies: centerBodies.length > 1 ? centerBodies : undefined,
            bodies,
            connections: [],
            controlled: isStarting ? 'player_start' : undefined,
        };
    }

    /**
     * 生成星系网络
     */
    generateGalaxyNetwork(config: GalaxyGenerationConfig): GalaxyNetwork {
        const galaxies = new Map<string, Galaxy>();
        const connections = new Map<string, string[]>();

        // 1. 生成星系位置（稀疏拓扑）
        const positions = this.generateGalaxyPositions(config);

        // 2. 为每个位置创建星系
        positions.forEach((pos, index) => {
            const galaxy = this.generateGalaxy(
                `galaxy_${index}`,
                pos,
                index === 0 // 第一个星系为玩家起始点
            );
            galaxies.set(galaxy.id, galaxy);
            connections.set(galaxy.id, []);
        });

        // 3. 建立星系间连接
        this.createGalaxyConnections(galaxies, connections, config);

        console.log(`✨ 生成了 ${galaxies.size} 个星系`);

        return {
            galaxies,
            connections,
            seed: this.seed,
        };
    }

    /**
     * 生成星系位置（稀疏分布）
     */
    private generateGalaxyPositions(config: GalaxyGenerationConfig): Array<{ x: number; y: number; z: number }> {
        const positions: Array<{ x: number; y: number; z: number }> = [];
        const { galaxyCount, minDistance } = config;
        const gridSize = Math.ceil(Math.sqrt(galaxyCount)) * 2;
        const cellSize = minDistance * 1.5;

        for (let i = 0; i < galaxyCount; i++) {
            let attempts = 0;
            let validPosition = false;
            let pos = { x: 0, y: 0, z: 0 };

            while (!validPosition && attempts < 100) {
                // 使用噪声生成位置
                const angle = this.rng() * Math.PI * 2;
                const radius = this.rng() * gridSize * cellSize;
                const height = (this.rng() - 0.5) * cellSize * 0.5;

                pos = {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    z: height,
                };

                // 检查与其他星系的距离
                validPosition = positions.every(existingPos => {
                    const dx = pos.x - existingPos.x;
                    const dy = pos.y - existingPos.y;
                    const dz = pos.z - existingPos.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    return distance >= minDistance;
                });

                attempts++;
            }

            if (validPosition) {
                positions.push(pos);
            }
        }

        return positions;
    }

    /**
     * 生成单个星系
     */
    public generateGalaxy(
        id: string,
        position: { x: number; y: number; z: number },
        isStarting: boolean
    ): Galaxy {
        const noise = this.noise3D(position.x * 0.01, position.y * 0.01, position.z * 0.01);
        const rand = this.rng();

        // 决定星系类型
        let galaxyType: GalaxyType;
        let centerBodies: (Star | ExoticCelestial)[] = [];

        if (rand < 0.02) {
            galaxyType = GalaxyType.BLACK_HOLE;
            centerBodies.push(this.generateBlackHole(id));
        } else if (rand < 0.04) {
            galaxyType = GalaxyType.NEUTRON_STAR;
            centerBodies.push(this.generateNeutronStar(id));
        } else if (rand < 0.05) {
            galaxyType = GalaxyType.PULSAR;
            centerBodies.push(this.generatePulsar(id));
        } else if (rand < 0.20) {
            // 15% 概率双星系统
            galaxyType = GalaxyType.BINARY_STAR;
            centerBodies.push(this.generateStar(`${id}_star_a`, noise));
            centerBodies.push(this.generateStar(`${id}_star_b`, noise + 0.5));
            // 调整双星位置，使它们在中心附近分布
            centerBodies[0].position = { x: -1, y: 0, z: 0 };
            centerBodies[1].position = { x: 1, y: 0, z: 0 };
        } else if (rand < 0.25) {
            // 5% 概率三星系统
            galaxyType = GalaxyType.TRIPLE_STAR;
            centerBodies.push(this.generateStar(`${id}_star_a`, noise));
            centerBodies.push(this.generateStar(`${id}_star_b`, noise + 0.3));
            centerBodies.push(this.generateStar(`${id}_star_c`, noise + 0.6));
            // 调整三星位置，形成三角形分布
            centerBodies[0].position = { x: 0, y: -1.2, z: 0 };
            centerBodies[1].position = { x: -1, y: 0.6, z: 0 };
            centerBodies[2].position = { x: 1, y: 0.6, z: 0 };
        } else {
            // 单星系统
            galaxyType = GalaxyType.SINGLE_STAR;
            centerBodies.push(this.generateStar(id, noise));
        }

        const centerBody = centerBodies[0];
        const bodies: CelestialBody[] = [...centerBodies];

        // 根据星系类型和中心天体数量决定天体数量
        let bodyCount: number;
        if (galaxyType === GalaxyType.NEUTRON_STAR || galaxyType === GalaxyType.PULSAR) {
            // 中子星和脉冲星系统天体较少
            bodyCount = Math.floor(2 + this.rng() * 4); // 2-5个天体
        } else if (galaxyType === GalaxyType.BLACK_HOLE) {
            // 黑洞系统天体数量适中
            bodyCount = Math.floor(3 + this.rng() * 5); // 3-7个天体
        } else if (galaxyType === GalaxyType.TRIPLE_STAR) {
            // 三星系统天体较少（中心天体多）
            bodyCount = Math.floor(4 + this.rng() * 5); // 4-8个天体
        } else if (galaxyType === GalaxyType.BINARY_STAR) {
            // 双星系统天体适中
            bodyCount = Math.floor(5 + this.rng() * 6); // 5-10个天体
        } else {
            // 单星系统天体最多
            bodyCount = Math.floor(6 + this.rng() * 8); // 6-13个天体
        }

        // 生成围绕中心的天体
        for (let i = 0; i < bodyCount; i++) {
            const body = this.generateOrbitalBody(id, i, centerBody);
            if (body) {
                bodies.push(body);
            }
        }

        return {
            id,
            name: this.generateGalaxyName(id),
            type: galaxyType,
            position,
            centerBody,
            centerBodies: centerBodies.length > 1 ? centerBodies : undefined,
            bodies,
            connections: [],
            controlled: isStarting ? 'player_start' : undefined,
        };
    }


    /**
     * 生成恒星
     */
    private generateStar(galaxyId: string, noise: number, rng?: ReturnType<typeof alea>): Star {
        const localRng = rng || this.rng;
        const starTypes = [
            { type: StarType.M_TYPE, prob: 0.7, temp: 3000, radius: 0.3, lum: 0.04 },
            { type: StarType.K_TYPE, prob: 0.85, temp: 4500, radius: 0.7, lum: 0.3 },
            { type: StarType.G_TYPE, prob: 0.92, temp: 5800, radius: 1.0, lum: 1.0 },
            { type: StarType.F_TYPE, prob: 0.96, temp: 7000, radius: 1.3, lum: 2.5 },
            { type: StarType.A_TYPE, prob: 0.98, temp: 9000, radius: 1.7, lum: 8.0 },
            { type: StarType.B_TYPE, prob: 0.995, temp: 15000, radius: 4.0, lum: 100 },
            { type: StarType.O_TYPE, prob: 1.0, temp: 30000, radius: 10.0, lum: 1000 },
        ];

        const rand = localRng();
        const starType = starTypes.find(st => rand < st.prob) || starTypes[0];

        return {
            id: `${galaxyId}_star`,
            name: `${this.generateStarName(localRng)}`,
            type: CelestialType.STAR,
            starType: starType.type,
            position: { x: 0, y: 0, z: 0 },
            mass: starType.radius * starType.radius * 100, // 质量单位: gu
            radius: starType.radius * 10, // 半径单位: gu (简化为10倍关系)
            temperature: starType.temp, // 温度单位: gK
            luminosity: starType.lum, // 光度单位: gL (galaxy luminosity)
        };
    }

    /**
     * 生成轨道天体 - 使用均匀圆环分布
     */
    private generateOrbitalBody(galaxyId: string, index: number, center: Star | ExoticCelestial, rng?: ReturnType<typeof alea>, galaxyType?: GalaxyType): CelestialBody | null {
        const localRng = rng || this.rng;
        
        // 使用统一的星系常量配置
        const maxRadius = GALAXY_CONSTANTS.MAX_RADIUS;
        const minRadius = 2;  // 最小轨道半径
        
        // 将轨道空间划分为多个圈层，每个圈层宽度约1.5-2gu
        const orbitLayerWidth = 1.5 + localRng() * 0.5; // 1.5-2gu
        const layerIndex = Math.floor(index / 2); // 每个圈层放置2个天体
        
        // 计算轨道半径：基础半径 + 圈层偏移 + 随机扰动
        let orbitRadius = minRadius + layerIndex * orbitLayerWidth;
        orbitRadius += (localRng() - 0.5) * orbitLayerWidth * 0.4; // 添加±20%随机扰动
        orbitRadius = Math.min(orbitRadius, maxRadius); // 限制最大半径
        orbitRadius = Math.max(orbitRadius, minRadius); // 确保不小于最小半径
        
        // 在圆环上均匀分布角度，添加随机偏移避免过于规则
        // 同一圈层的天体尽量均匀分布
        const angleInLayer = index % 2;
        const baseAngle = angleInLayer * Math.PI + localRng() * Math.PI * 0.8;
        const orbitAngle = baseAngle + (localRng() - 0.5) * Math.PI * 0.3; // 添加随机偏移
        
        const rand = localRng();

        // 黑洞系统增加小行星带概率
        const asteroidProb = galaxyType === GalaxyType.BLACK_HOLE ? 0.25 : 0.1;

        if (rand < asteroidProb) {
            return this.generateAsteroidBelt(galaxyId, index, orbitRadius, orbitAngle, localRng);
        } else if (orbitRadius < 5) {
            // 内层区域：类地行星
            return this.generateTerrestrialPlanet(galaxyId, index, orbitRadius, orbitAngle, localRng);
        } else if (orbitRadius < 9) {
            // 中层区域：气态巨星和类地行星混合
            return rand < 0.6
                ? this.generateGasGiant(galaxyId, index, orbitRadius, orbitAngle, localRng)
                : this.generateTerrestrialPlanet(galaxyId, index, orbitRadius, orbitAngle, localRng);
        } else {
            // 外层区域：冰巨星
            return this.generateIceGiant(galaxyId, index, orbitRadius, orbitAngle, localRng);
        }
    }

    /**
     * 生成类地行星
     */
    private generateTerrestrialPlanet(
        galaxyId: string,
        index: number,
        orbitRadius: number,
        orbitAngle: number,
        rng?: ReturnType<typeof alea>
    ): Planet {
        const localRng = rng || this.rng;
        const resources = this.selectPlanetResources(['iron_ore', 'copper_ore', 'titanium_ore', 'silicon_crystal'], localRng);

        return {
            id: `${galaxyId}_planet_${index}`,
            name: `${this.generatePlanetName(localRng)} ${index + 1}`,
            type: CelestialType.TERRESTRIAL,
            position: {
                x: Math.round(Math.cos(orbitAngle) * orbitRadius),
                y: Math.round(Math.sin(orbitAngle) * orbitRadius),
                z: Math.round((localRng() - 0.5) * 0.2 * 100) / 100, // z轴保留2位小数
            },
            mass: 0.5 + localRng() * 1.5, // 质量单位: gu (galaxy unit)
            radius: 0.5 + localRng() * 0.8, // 半径单位: gu
            temperature: 200 + localRng() * 300, // 温度单位: gK (galaxy Kelvin)
            orbitRadius,
            orbitAngle,
            atmosphere: localRng() > 0.5 ? ['nitrogen', 'oxygen', 'co2'] : undefined,
            resources,
        };
    }

    /**
     * 生成气态巨星
     */
    private generateGasGiant(
        galaxyId: string,
        index: number,
        orbitRadius: number,
        orbitAngle: number,
        rng?: ReturnType<typeof alea>
    ): Planet {
        const localRng = rng || this.rng;
        const resources = this.selectPlanetResources(['hydrogen_gas', 'helium_gas'], localRng);

        return {
            id: `${galaxyId}_gas_giant_${index}`,
            name: `${this.generatePlanetName(localRng)} ${index + 1}`,
            type: CelestialType.GAS_GIANT,
            position: {
                x: Math.round(Math.cos(orbitAngle) * orbitRadius),
                y: Math.round(Math.sin(orbitAngle) * orbitRadius),
                z: Math.round((localRng() - 0.5) * 0.3 * 100) / 100, // z轴保留2位小数
            },
            mass: 10 + localRng() * 50, // 质量单位: gu
            radius: 2 + localRng() * 2, // 半径单位: gu
            temperature: 100 + localRng() * 150, // 温度单位: gK
            orbitRadius,
            orbitAngle,
            hasRings: localRng() > 0.5,
            atmosphere: ['hydrogen', 'helium'],
            resources,
        };
    }

    /**
     * 生成冰巨星
     */
    private generateIceGiant(
        galaxyId: string,
        index: number,
        orbitRadius: number,
        orbitAngle: number,
        rng?: ReturnType<typeof alea>
    ): Planet {
        const localRng = rng || this.rng;
        return {
            id: `${galaxyId}_ice_giant_${index}`,
            name: `${this.generatePlanetName(localRng)} ${index + 1}`,
            type: CelestialType.ICE_GIANT,
            position: {
                x: Math.round(Math.cos(orbitAngle) * orbitRadius),
                y: Math.round(Math.sin(orbitAngle) * orbitRadius),
                z: Math.round((localRng() - 0.5) * 0.3 * 100) / 100, // z轴保留2位小数
            },
            mass: 5 + localRng() * 15, // 质量单位: gu
            radius: 1.5 + localRng() * 1.5, // 半径单位: gu
            temperature: 50 + localRng() * 100, // 温度单位: gK
            orbitRadius,
            orbitAngle,
            atmosphere: ['methane', 'ammonia', 'water'],
            resources: this.selectPlanetResources(['water', 'nitrogen_gas'], localRng),
        };
    }

    /**
     * 生成小行星带
     */
    private generateAsteroidBelt(
        galaxyId: string,
        index: number,
        orbitRadius: number,
        orbitAngle: number,
        rng?: ReturnType<typeof alea>
    ): AsteroidBelt {
        const localRng = rng || this.rng;
        return {
            id: `${galaxyId}_belt_${index}`,
            name: `Asteroid Belt ${index + 1}`,
            type: CelestialType.ASTEROID_BELT,
            position: {
                x: Math.round(Math.cos(orbitAngle) * orbitRadius),
                y: Math.round(Math.sin(orbitAngle) * orbitRadius),
                z: Math.round((localRng() - 0.5) * 0.4 * 100) / 100, // z轴保留2位小数
            },
            mass: 0.01 + localRng() * 0.1, // 质量单位: gu
            radius: orbitRadius * 0.3, // 半径单位: gu
            orbitRadius,
            orbitAngle,
            density: localRng(),
            asteroidCount: Math.floor(1000 + localRng() * 5000),
            resources: this.selectPlanetResources(['iron_ore', 'rare_metal_ore', 'titanium_ore'], localRng),
        };
    }

    /**
     * 生成黑洞
     */
    private generateBlackHole(galaxyId: string, rng?: ReturnType<typeof alea>): ExoticCelestial {
        const localRng = rng || this.rng;
        return {
            id: `${galaxyId}_blackhole`,
            name: 'Black Hole',
            type: CelestialType.BLACK_HOLE,
            position: { x: 0, y: 0, z: 0 },
            mass: 1000 + localRng() * 5000, // 质量单位: gu
            radius: 0.1 + localRng() * 0.5, // 半径单位: gu
            rotationSpeed: localRng() * 1000, // 旋转速度单位: gu/s
        };
    }

    /**
     * 生成中子星
     */
    private generateNeutronStar(galaxyId: string, rng?: ReturnType<typeof alea>): ExoticCelestial {
        const localRng = rng || this.rng;
        return {
            id: `${galaxyId}_neutron`,
            name: 'Neutron Star',
            type: CelestialType.NEUTRON_STAR,
            position: { x: 0, y: 0, z: 0 },
            mass: 200 + localRng() * 100, // 质量单位: gu
            radius: 0.02 + localRng() * 0.01, // 半径单位: gu
            temperature: 600000, // 温度单位: gK
            magneticField: localRng() * 1000, // 磁场强度单位: gT (galaxy Tesla)
        };
    }

    /**
     * 生成脉冲星
     */
    private generatePulsar(galaxyId: string, rng?: ReturnType<typeof alea>): ExoticCelestial {
        const localRng = rng || this.rng;
        return {
            id: `${galaxyId}_pulsar`,
            name: 'Pulsar',
            type: CelestialType.PULSAR,
            position: { x: 0, y: 0, z: 0 },
            mass: 200 + localRng() * 100, // 质量单位: gu
            radius: 0.02 + localRng() * 0.01, // 半径单位: gu
            temperature: 600000, // 温度单位: gK
            rotationSpeed: 100 + localRng() * 900, // 旋转速度单位: gu/s
            magneticField: localRng() * 10000, // 磁场强度单位: gT
        };
    }

    /**
     * 建立星系间连接
     */
    private createGalaxyConnections(
        galaxies: Map<string, Galaxy>,
        connections: Map<string, string[]>,
        config: GalaxyGenerationConfig
    ): void {
        const galaxyArray = Array.from(galaxies.values());

        for (let i = 0; i < galaxyArray.length; i++) {
            const galaxy = galaxyArray[i];
            const connList = connections.get(galaxy.id)!;

            // 查找最近的几个星系
                const distances = galaxyArray
                .map((other, idx) => ({ galaxy: other, idx, distance: calculateDistance(galaxy.position, other.position) }))
                .filter(d => d.idx !== i)
                .sort((a, b) => a.distance - b.distance);

            // 至少连接最近的1-2个星系
            const minConnections = 1 + Math.floor(this.rng() * 2);
            for (let j = 0; j < Math.min(minConnections, distances.length); j++) {
                const target = distances[j].galaxy;
                if (!connList.includes(target.id)) {
                    connList.push(target.id);
                    galaxy.connections.push(target.id);

                    // 双向连接
                    const targetConnList = connections.get(target.id)!;
                    if (!targetConnList.includes(galaxy.id)) {
                        targetConnList.push(galaxy.id);
                        target.connections.push(galaxy.id);
                    }
                }
            }

            // 额外的随机连接
            for (let j = minConnections; j < distances.length && j < 5; j++) {
                if (this.rng() < config.connectionProbability) {
                    const target = distances[j].galaxy;
                    if (!connList.includes(target.id)) {
                        connList.push(target.id);
                        galaxy.connections.push(target.id);

                        const targetConnList = connections.get(target.id)!;
                        if (!targetConnList.includes(galaxy.id)) {
                            targetConnList.push(galaxy.id);
                            target.connections.push(galaxy.id);
                        }
                    }
                }
            }
        }
    }

    private selectPlanetResources(available: string[], rng?: ReturnType<typeof alea>): string[] {
        const localRng = rng || this.rng;
        const count = 1 + Math.floor(localRng() * 3);
        const selected: string[] = [];
        for (let i = 0; i < count && selected.length < available.length; i++) {
            const idx = Math.floor(localRng() * available.length);
            if (!selected.includes(available[idx])) {
                selected.push(available[idx]);
            }
        }
        return selected;
    }

    private generateGalaxyName(id: string, rng?: ReturnType<typeof alea>): string {
        const localRng = rng || this.rng;
        const prefixes = ['NGC', 'M', 'IC', 'UGC', 'PGC'];
        const prefix = prefixes[Math.floor(localRng() * prefixes.length)];
        const number = Math.floor(localRng() * 10000);
        return `${prefix} ${number}`;
    }

    private generateStarName(rng?: ReturnType<typeof alea>): string {
        const localRng = rng || this.rng;
        const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
        const suffixes = ['Centauri', 'Orionis', 'Cygni', 'Lyrae', 'Aquilae', 'Persei'];
        return `${prefixes[Math.floor(localRng() * prefixes.length)]} ${suffixes[Math.floor(localRng() * suffixes.length)]}`;
    }

    private generatePlanetName(rng?: ReturnType<typeof alea>): string {
        const localRng = rng || this.rng;
        const names = ['Proxima', 'Terra', 'Nova', 'Prime', 'Kepler', 'Gliese', 'TRAPPIST'];
        return names[Math.floor(localRng() * names.length)];
    }
}

