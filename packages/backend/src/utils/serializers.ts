/**
 * 序列化工具函数
 */

import {
    GameWorld,
    GameShip,
    GameResourceNode,
    GameStructure
} from '@galaxy-traveler/shared';

/**
 * 序列化游戏状态
 */
export function serializeGameState(world: GameWorld) {
    return {
        tick: world.tick,
        timestamp: Date.now(),
        ships: Array.from(world.ships.values()).map(serializeShip),
        resourceNodes: Array.from(world.resourceNodes.values()).map(serializeResourceNode),
        structures: Array.from(world.structures.values()).map(serializeStructure),
    };
}

/**
 * 序列化飞船数据
 */
export function serializeShip(ship: GameShip) {
    return {
        instanceId: ship.instanceId,
        ownerId: ship.ownerId,
        position: ship.position,
        status: ship.status,
        currentHealth: ship.currentHealth,
        cargo: Object.fromEntries(ship.cargo),
        cargoCapacity: ship.cargoCapacity,
        actionProgress: ship.actionProgress,
    };
}

/**
 * 序列化资源节点数据
 */
export function serializeResourceNode(node: GameResourceNode) {
    return {
        id: node.id,
        resourceType: node.resourceType,
        position: node.position,
        currentAmount: node.currentAmount,
        amount: node.amount,
    };
}

/**
 * 序列化建筑数据
 */
export function serializeStructure(structure: GameStructure) {
    return {
        id: structure.id,
        type: structure.type,
        ownerId: structure.ownerId,
        position: structure.position,
        cargo: Object.fromEntries(structure.cargo),
        cargoCapacity: structure.cargoCapacity,
    };
}

/**
 * 序列化星系网络数据
 */
export function serializeGalaxyNetwork(galaxies: Map<string, any>, connections: Map<string, any[]>) {
    const galaxiesObj: any = {};
    galaxies.forEach((galaxy, id) => {
        galaxiesObj[id] = galaxy;
    });

    const connectionsObj: any = {};
    connections.forEach((conns, id) => {
        connectionsObj[id] = conns;
    });

    return {
        galaxies: galaxiesObj,
        connections: connectionsObj,
    };
}

