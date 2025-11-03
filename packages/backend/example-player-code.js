/**
 * 示例玩家代码
 * 这个文件演示了如何编写飞船控制代码
 * 
 * 可用的全局对象：
 * - Game: 游戏主对象，包含所有游戏数据
 * - Memory: 持久化内存对象，用于在tick之间保存数据
 * - console.log(): 输出日志
 */

// 主循环 - 每个tick都会执行这段代码
module.exports.loop = function() {
  // 1. 初始化内存
  if (!Memory.initialized) {
    Memory.initialized = true;
    Memory.roles = {}; // 飞船角色分配
    console.log('游戏初始化完成');
  }

  // 2. 遍历所有飞船
  for (const shipId in Game.ships) {
    const ship = Game.ships[shipId];
    
    // 为飞船分配角色
    if (!Memory.roles[shipId]) {
      Memory.roles[shipId] = 'harvester'; // 默认为采集者
    }

    const role = Memory.roles[shipId];

    // 3. 根据角色执行不同的逻辑
    if (role === 'harvester') {
      runHarvester(ship);
    }
  }

  console.log(`Tick ${Game.time} 处理完成`);
};

/**
 * 采集者逻辑
 */
function runHarvester(ship) {
  // 检查货物容量
  const usedCapacity = ship.store.getUsedCapacity();
  const totalCapacity = ship.store.getCapacity();

  if (usedCapacity >= totalCapacity) {
    // 货物满了，去仓库存放
    const storage = findNearestStorage(ship);
    if (storage) {
      // 如果不在仓库旁边，移动过去
      if (!isNearby(ship.pos, storage.position)) {
        const result = ship.moveTo(storage.position);
        if (result === 0) {
          console.log(`${ship.id} 正在移动到仓库`);
        }
      } else {
        // 在仓库旁边，转移资源
        for (const resourceType in Game.resources) {
          const amount = ship.store.getUsedCapacity(resourceType);
          if (amount > 0) {
            const result = ship.transfer(storage.id, resourceType);
            if (result === 0) {
              console.log(`${ship.id} 转移了资源到仓库`);
            }
            break; // 一次只转移一种资源
          }
        }
      }
    }
  } else {
    // 货物未满，去采集资源
    const resource = findNearestResource(ship);
    if (resource) {
      // 如果不在资源旁边，移动过去
      if (!isNearby(ship.pos, resource.position)) {
        const result = ship.moveTo(resource.position);
        if (result === 0) {
          console.log(`${ship.id} 正在移动到资源点`);
        }
      } else {
        // 在资源旁边，开始采集
        const result = ship.harvest(resource.id);
        if (result === 0) {
          console.log(`${ship.id} 正在采集资源`);
        }
      }
    }
  }
}

/**
 * 查找最近的资源节点
 */
function findNearestResource(ship) {
  let nearest = null;
  let minDistance = Infinity;

  for (const resourceId in Game.resources) {
    const resource = Game.resources[resourceId];
    if (resource.amount > 0) {
      const distance = getDistance(ship.pos, resource.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = resource;
      }
    }
  }

  return nearest;
}

/**
 * 查找最近的存储设施
 */
function findNearestStorage(ship) {
  let nearest = null;
  let minDistance = Infinity;

  for (const structureId in Game.structures) {
    const structure = Game.structures[structureId];
    const distance = getDistance(ship.pos, structure.position);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = structure;
    }
  }

  return nearest;
}

/**
 * 计算两点距离
 */
function getDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 检查两个位置是否相邻
 */
function isNearby(pos1, pos2, range = 1) {
  return getDistance(pos1, pos2) <= range;
}

// ============================================
// 更多示例
// ============================================

/**
 * 示例：简单的采集循环
 */
function simpleHarvesterExample() {
  const myShip = Game.ships['ship_1'];
  
  if (!myShip) return;

  // 如果货物满了
  if (myShip.store.getFreeCapacity() === 0) {
    // 查找存储设施
    const storage = Game.structures['storage_1'];
    if (storage) {
      // 移动到存储设施
      myShip.moveTo(storage.position);
      // 转移所有资源
      myShip.transfer(storage.id, 'iron_ore');
    }
  } else {
    // 查找资源
    const ironNode = Game.resources['iron_node_1'];
    if (ironNode) {
      // 移动到资源节点
      myShip.moveTo(ironNode.position);
      // 采集资源
      myShip.harvest(ironNode.id);
    }
  }
}

/**
 * 示例：使用内存保存状态
 */
function memoryExample() {
  const myShip = Game.ships['ship_1'];
  
  if (!myShip) return;

  // 初始化飞船的内存
  if (!Memory.ships) {
    Memory.ships = {};
  }
  if (!Memory.ships[myShip.id]) {
    Memory.ships[myShip.id] = {
      state: 'harvesting',
      targetResource: null,
    };
  }

  const shipMemory = Memory.ships[myShip.id];

  // 状态机逻辑
  if (shipMemory.state === 'harvesting') {
    // 采集逻辑
    if (myShip.store.getFreeCapacity() === 0) {
      shipMemory.state = 'returning';
      shipMemory.targetResource = null;
    } else {
      // 继续采集
      if (!shipMemory.targetResource) {
        shipMemory.targetResource = 'iron_node_1';
      }
      const resource = Game.resources[shipMemory.targetResource];
      if (resource) {
        myShip.moveTo(resource.position);
        myShip.harvest(resource.id);
      }
    }
  } else if (shipMemory.state === 'returning') {
    // 返回存储逻辑
    const storage = Game.structures['storage_1'];
    if (storage) {
      myShip.moveTo(storage.position);
      myShip.transfer(storage.id, 'iron_ore');
      
      if (myShip.store.getUsedCapacity() === 0) {
        shipMemory.state = 'harvesting';
      }
    }
  }
}

/**
 * 示例：多飞船协作
 */
function multiShipExample() {
  // 获取所有飞船
  const ships = Object.values(Game.ships);
  
  // 将飞船分配到不同的资源节点
  const resources = Object.values(Game.resources);
  
  ships.forEach((ship, index) => {
    // 为每个飞船分配一个资源节点
    const assignedResource = resources[index % resources.length];
    
    if (ship.store.getFreeCapacity() > 0) {
      ship.moveTo(assignedResource.position);
      ship.harvest(assignedResource.id);
    } else {
      // 找到存储设施
      const storage = Object.values(Game.structures)[0];
      if (storage) {
        ship.moveTo(storage.position);
        // 转移第一种资源
        const firstResource = Object.keys(ship.store)[0];
        if (firstResource) {
          ship.transfer(storage.id, firstResource);
        }
      }
    }
  });
}

