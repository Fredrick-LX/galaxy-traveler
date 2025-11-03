/**
 * 星系生成器
 * 使用 simplex-noise 和 alea 生成伪随机星系网络
 */

import { createNoise3D } from 'simplex-noise';
import alea from 'alea';
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
    return this.generateGalaxyWithRng(id, position, noise, localRng, isStarting);
  }

  /**
   * 使用指定的RNG生成星系
   */
  private generateGalaxyWithRng(
    id: string,
    position: { x: number; y: number; z: number },
    noise: number,
    localRng: ReturnType<typeof alea>,
    isStarting: boolean
  ): Galaxy {
    const rand = localRng();
    
    // 决定星系类型
    let galaxyType: GalaxyType;
    let centerBodies: (Star | ExoticCelestial)[] = [];
    
    if (rand < 0.02) {
      galaxyType = GalaxyType.BLACK_HOLE;
      centerBodies.push(this.generateBlackHoleWithRng(id, localRng));
    } else if (rand < 0.04) {
      galaxyType = GalaxyType.NEUTRON_STAR;
      centerBodies.push(this.generateNeutronStarWithRng(id, localRng));
    } else if (rand < 0.05) {
      galaxyType = GalaxyType.PULSAR;
      centerBodies.push(this.generatePulsarWithRng(id, localRng));
    } else if (rand < 0.20) {
      galaxyType = GalaxyType.BINARY_STAR;
      centerBodies.push(this.generateStarWithRng(`${id}_star_a`, noise, localRng));
      centerBodies.push(this.generateStarWithRng(`${id}_star_b`, noise + 0.5, localRng));
    } else if (rand < 0.25) {
      galaxyType = GalaxyType.TRIPLE_STAR;
      centerBodies.push(this.generateStarWithRng(`${id}_star_a`, noise, localRng));
      centerBodies.push(this.generateStarWithRng(`${id}_star_b`, noise + 0.3, localRng));
      centerBodies.push(this.generateStarWithRng(`${id}_star_c`, noise + 0.6, localRng));
    } else {
      galaxyType = GalaxyType.SINGLE_STAR;
      centerBodies.push(this.generateStarWithRng(id, noise, localRng));
    }
    
    const centerBody = centerBodies[0];
    const bodies: CelestialBody[] = [...centerBodies];

    // 生成围绕中心的天体
    const bodyCount = Math.floor(3 + localRng() * 8);
    for (let i = 0; i < bodyCount; i++) {
      const body = this.generateOrbitalBodyWithRng(id, i, centerBody, localRng);
      if (body) {
        bodies.push(body);
      }
    }

    return {
      id,
      name: this.generateGalaxyNameWithRng(id, localRng),
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
  private generateGalaxy(
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
    } else if (rand < 0.25) {
      // 5% 概率三星系统
      galaxyType = GalaxyType.TRIPLE_STAR;
      centerBodies.push(this.generateStar(`${id}_star_a`, noise));
      centerBodies.push(this.generateStar(`${id}_star_b`, noise + 0.3));
      centerBodies.push(this.generateStar(`${id}_star_c`, noise + 0.6));
    } else {
      // 单星系统
      galaxyType = GalaxyType.SINGLE_STAR;
      centerBodies.push(this.generateStar(id, noise));
    }
    
    const centerBody = centerBodies[0];
    const bodies: CelestialBody[] = [...centerBodies];

    // 生成围绕中心的天体
    const bodyCount = Math.floor(3 + this.rng() * 8); // 3-10个天体
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
   * 生成恒星（使用指定RNG）
   */
  private generateStarWithRng(galaxyId: string, noise: number, rng: ReturnType<typeof alea>): Star {
    const starTypes = [
      { type: StarType.M_TYPE, prob: 0.7, temp: 3000, radius: 0.3, lum: 0.04 },
      { type: StarType.K_TYPE, prob: 0.85, temp: 4500, radius: 0.7, lum: 0.3 },
      { type: StarType.G_TYPE, prob: 0.92, temp: 5800, radius: 1.0, lum: 1.0 },
      { type: StarType.F_TYPE, prob: 0.96, temp: 7000, radius: 1.3, lum: 2.5 },
      { type: StarType.A_TYPE, prob: 0.98, temp: 9000, radius: 1.7, lum: 8.0 },
      { type: StarType.B_TYPE, prob: 0.995, temp: 15000, radius: 4.0, lum: 100 },
      { type: StarType.O_TYPE, prob: 1.0, temp: 30000, radius: 10.0, lum: 1000 },
    ];

    const rand = rng();
    const starType = starTypes.find(st => rand < st.prob) || starTypes[0];

    return {
      id: `${galaxyId}_star`,
      name: `${this.generateStarNameWithRng(rng)}`,
      type: CelestialType.STAR,
      starType: starType.type,
      position: { x: 0, y: 0, z: 0 },
      mass: starType.radius * starType.radius * 1000,
      radius: starType.radius * 696340,
      temperature: starType.temp,
      luminosity: starType.lum,
    };
  }

  /**
   * 生成恒星
   */
  private generateStar(galaxyId: string, noise: number): Star {
    return this.generateStarWithRng(galaxyId, noise, this.rng);
  }

  /**
   * 生成轨道天体（使用指定RNG）
   */
  private generateOrbitalBodyWithRng(galaxyId: string, index: number, center: Star | ExoticCelestial, rng: ReturnType<typeof alea>): CelestialBody | null {
    const orbitRadius = Math.round(3 + index * 1.5 + rng() * 2);
    const orbitAngle = rng() * Math.PI * 2;
    const rand = rng();

    if (rand < 0.1) {
      return this.generateAsteroidBeltWithRng(galaxyId, index, orbitRadius, orbitAngle, rng);
    } else if (orbitRadius < 8) {
      return this.generateTerrestrialPlanetWithRng(galaxyId, index, orbitRadius, orbitAngle, rng);
    } else if (orbitRadius < 15) {
      return rand < 0.6 
        ? this.generateGasGiantWithRng(galaxyId, index, orbitRadius, orbitAngle, rng)
        : this.generateTerrestrialPlanetWithRng(galaxyId, index, orbitRadius, orbitAngle, rng);
    } else {
      return this.generateIceGiantWithRng(galaxyId, index, orbitRadius, orbitAngle, rng);
    }
  }

  /**
   * 生成轨道天体
   */
  private generateOrbitalBody(galaxyId: string, index: number, center: Star | ExoticCelestial): CelestialBody | null {
    return this.generateOrbitalBodyWithRng(galaxyId, index, center, this.rng);
  }

  /**
   * 生成类地行星（使用指定RNG）
   */
  private generateTerrestrialPlanetWithRng(
    galaxyId: string,
    index: number,
    orbitRadius: number,
    orbitAngle: number,
    rng: ReturnType<typeof alea>
  ): Planet {
    const resources = this.selectPlanetResourcesWithRng(['iron_ore', 'copper_ore', 'titanium_ore', 'silicon_crystal'], rng);

    return {
      id: `${galaxyId}_planet_${index}`,
      name: `${this.generatePlanetNameWithRng(rng)} ${index + 1}`,
      type: CelestialType.TERRESTRIAL,
      position: {
        x: Math.cos(orbitAngle) * orbitRadius,
        y: Math.sin(orbitAngle) * orbitRadius,
        z: (rng() - 0.5) * 0.2,
      },
      mass: 0.5 + rng() * 1.5,
      radius: 3000 + rng() * 4000,
      temperature: 200 + rng() * 300,
      orbitRadius,
      orbitAngle,
      atmosphere: rng() > 0.5 ? ['nitrogen', 'oxygen', 'co2'] : undefined,
      resources,
    };
  }

  /**
   * 生成类地行星
   */
  private generateTerrestrialPlanet(
    galaxyId: string,
    index: number,
    orbitRadius: number,
    orbitAngle: number
  ): Planet {
    return this.generateTerrestrialPlanetWithRng(galaxyId, index, orbitRadius, orbitAngle, this.rng);
  }

  /**
   * 生成气态巨星（使用指定RNG）
   */
  private generateGasGiantWithRng(
    galaxyId: string,
    index: number,
    orbitRadius: number,
    orbitAngle: number,
    rng: ReturnType<typeof alea>
  ): Planet {
    const resources = this.selectPlanetResourcesWithRng(['hydrogen_gas', 'helium_gas'], rng);

    return {
      id: `${galaxyId}_gas_giant_${index}`,
      name: `${this.generatePlanetNameWithRng(rng)} ${index + 1}`,
      type: CelestialType.GAS_GIANT,
      position: {
        x: Math.cos(orbitAngle) * orbitRadius,
        y: Math.sin(orbitAngle) * orbitRadius,
        z: (rng() - 0.5) * 0.3,
      },
      mass: 10 + rng() * 100,
      radius: 40000 + rng() * 30000,
      temperature: 100 + rng() * 150,
      orbitRadius,
      orbitAngle,
      hasRings: rng() > 0.5,
      atmosphere: ['hydrogen', 'helium'],
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
    orbitAngle: number
  ): Planet {
    return this.generateGasGiantWithRng(galaxyId, index, orbitRadius, orbitAngle, this.rng);
  }

  /**
   * 生成冰巨星（使用指定RNG）
   */
  private generateIceGiantWithRng(
    galaxyId: string,
    index: number,
    orbitRadius: number,
    orbitAngle: number,
    rng: ReturnType<typeof alea>
  ): Planet {
    return {
      id: `${galaxyId}_ice_giant_${index}`,
      name: `${this.generatePlanetNameWithRng(rng)} ${index + 1}`,
      type: CelestialType.ICE_GIANT,
      position: {
        x: Math.cos(orbitAngle) * orbitRadius,
        y: Math.sin(orbitAngle) * orbitRadius,
        z: (rng() - 0.5) * 0.3,
      },
      mass: 5 + rng() * 20,
      radius: 20000 + rng() * 25000,
      temperature: 50 + rng() * 100,
      orbitRadius,
      orbitAngle,
      atmosphere: ['methane', 'ammonia', 'water'],
      resources: this.selectPlanetResourcesWithRng(['water', 'nitrogen_gas'], rng),
    };
  }

  /**
   * 生成冰巨星
   */
  private generateIceGiant(
    galaxyId: string,
    index: number,
    orbitRadius: number,
    orbitAngle: number
  ): Planet {
    return this.generateIceGiantWithRng(galaxyId, index, orbitRadius, orbitAngle, this.rng);
  }

  /**
   * 生成小行星带（使用指定RNG）
   */
  private generateAsteroidBeltWithRng(
    galaxyId: string,
    index: number,
    orbitRadius: number,
    orbitAngle: number,
    rng: ReturnType<typeof alea>
  ): AsteroidBelt {
    return {
      id: `${galaxyId}_belt_${index}`,
      name: `Asteroid Belt ${index + 1}`,
      type: CelestialType.ASTEROID_BELT,
      position: {
        x: Math.cos(orbitAngle) * orbitRadius,
        y: Math.sin(orbitAngle) * orbitRadius,
        z: (rng() - 0.5) * 0.4,
      },
      mass: 0.01 + rng() * 0.1,
      radius: orbitRadius * 0.3,
      orbitRadius,
      orbitAngle,
      density: rng(),
      asteroidCount: Math.floor(1000 + rng() * 5000),
      resources: this.selectPlanetResourcesWithRng(['iron_ore', 'rare_metal_ore', 'titanium_ore'], rng),
    };
  }

  /**
   * 生成小行星带
   */
  private generateAsteroidBelt(
    galaxyId: string,
    index: number,
    orbitRadius: number,
    orbitAngle: number
  ): AsteroidBelt {
    return this.generateAsteroidBeltWithRng(galaxyId, index, orbitRadius, orbitAngle, this.rng);
  }

  /**
   * 生成黑洞（使用指定RNG）
   */
  private generateBlackHoleWithRng(galaxyId: string, rng: ReturnType<typeof alea>): ExoticCelestial {
    return {
      id: `${galaxyId}_blackhole`,
      name: 'Black Hole',
      type: CelestialType.BLACK_HOLE,
      position: { x: 0, y: 0, z: 0 },
      mass: 10000 + rng() * 50000,
      radius: 10 + rng() * 100,
      rotationSpeed: rng() * 1000,
    };
  }

  /**
   * 生成黑洞
   */
  private generateBlackHole(galaxyId: string): ExoticCelestial {
    return this.generateBlackHoleWithRng(galaxyId, this.rng);
  }

  /**
   * 生成中子星（使用指定RNG）
   */
  private generateNeutronStarWithRng(galaxyId: string, rng: ReturnType<typeof alea>): ExoticCelestial {
    return {
      id: `${galaxyId}_neutron`,
      name: 'Neutron Star',
      type: CelestialType.NEUTRON_STAR,
      position: { x: 0, y: 0, z: 0 },
      mass: 2000 + rng() * 1000,
      radius: 10 + rng() * 5,
      temperature: 600000,
      magneticField: rng() * 1e14,
    };
  }

  /**
   * 生成中子星
   */
  private generateNeutronStar(galaxyId: string): ExoticCelestial {
    return this.generateNeutronStarWithRng(galaxyId, this.rng);
  }

  /**
   * 生成脉冲星（使用指定RNG）
   */
  private generatePulsarWithRng(galaxyId: string, rng: ReturnType<typeof alea>): ExoticCelestial {
    return {
      id: `${galaxyId}_pulsar`,
      name: 'Pulsar',
      type: CelestialType.PULSAR,
      position: { x: 0, y: 0, z: 0 },
      mass: 2000 + rng() * 1000,
      radius: 10 + rng() * 5,
      temperature: 600000,
      rotationSpeed: 100 + rng() * 900,
      magneticField: rng() * 1e15,
    };
  }

  /**
   * 生成脉冲星
   */
  private generatePulsar(galaxyId: string): ExoticCelestial {
    return this.generatePulsarWithRng(galaxyId, this.rng);
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
        .map((other, idx) => ({ galaxy: other, idx, distance: this.calculateDistance(galaxy.position, other.position) }))
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

  private calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private selectPlanetResourcesWithRng(available: string[], rng: ReturnType<typeof alea>): string[] {
    const count = 1 + Math.floor(rng() * 3);
    const selected: string[] = [];
    for (let i = 0; i < count && selected.length < available.length; i++) {
      const idx = Math.floor(rng() * available.length);
      if (!selected.includes(available[idx])) {
        selected.push(available[idx]);
      }
    }
    return selected;
  }

  private selectPlanetResources(available: string[]): string[] {
    return this.selectPlanetResourcesWithRng(available, this.rng);
  }

  private generateGalaxyNameWithRng(id: string, rng: ReturnType<typeof alea>): string {
    const prefixes = ['NGC', 'M', 'IC', 'UGC', 'PGC'];
    const prefix = prefixes[Math.floor(rng() * prefixes.length)];
    const number = Math.floor(rng() * 10000);
    return `${prefix} ${number}`;
  }

  private generateGalaxyName(id: string): string {
    return this.generateGalaxyNameWithRng(id, this.rng);
  }

  private generateStarNameWithRng(rng: ReturnType<typeof alea>): string {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
    const suffixes = ['Centauri', 'Orionis', 'Cygni', 'Lyrae', 'Aquilae', 'Persei'];
    return `${prefixes[Math.floor(rng() * prefixes.length)]} ${suffixes[Math.floor(rng() * suffixes.length)]}`;
  }

  private generateStarName(): string {
    return this.generateStarNameWithRng(this.rng);
  }

  private generatePlanetNameWithRng(rng: ReturnType<typeof alea>): string {
    const names = ['Proxima', 'Terra', 'Nova', 'Prime', 'Kepler', 'Gliese', 'TRAPPIST'];
    return names[Math.floor(rng() * names.length)];
  }

  private generatePlanetName(): string {
    return this.generatePlanetNameWithRng(this.rng);
  }
}
