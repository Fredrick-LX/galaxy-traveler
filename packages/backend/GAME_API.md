# 游戏API文档

这是Galaxy Traveler游戏的编程API文档。玩家通过编写JavaScript代码来控制游戏中的飞船和资源。

## 全局对象

### Game

主游戏对象，包含所有游戏实体和数据。

#### 属性

- `Game.time` - 当前游戏tick数
- `Game.ships` - 所有玩家的飞船对象（键值对，key为飞船ID）
- `Game.resources` - 所有资源节点（键值对，key为资源ID）
- `Game.structures` - 所有建筑/存储设施（键值对，key为建筑ID）

#### 方法

- `Game.getObjectById(id)` - 通过ID获取游戏对象
- `Game.notify(message, [groupInterval])` - 发送通知消息

### Memory

持久化内存对象，用于在不同tick之间保存数据。

```javascript
// 可以任意存储数据
Memory.myData = { foo: 'bar' };
Memory.ships = {};
Memory.roles = {};
```

### console

用于输出日志信息。

```javascript
console.log('这是一条日志消息');
```

---

## 飞船对象 (Ship)

通过 `Game.ships` 访问飞船对象。

### 属性

- `ship.id` - 飞船的唯一ID
- `ship.name` - 飞船名称
- `ship.pos` - 飞船位置 `{ x, y, z }`
- `ship.store` - 货物存储对象

### store对象方法

- `ship.store.getUsedCapacity([resourceType])` - 获取已使用的货物容量
- `ship.store.getFreeCapacity([resourceType])` - 获取剩余货物容量
- `ship.store.getCapacity([resourceType])` - 获取总货物容量

### 方法

#### moveTo()

移动飞船到指定位置。

```javascript
// 移动到坐标
ship.moveTo(10, 20);
ship.moveTo(10, 20, 0);

// 移动到对象
ship.moveTo(resourceNode);
ship.moveTo(resourceNode.position);

// 移动到对象ID
ship.moveTo('iron_node_1');
```

**返回值：**
- `OK (0)` - 成功
- `ERR_NOT_OWNER (-1)` - 不是拥有者
- `ERR_BUSY (-3)` - 飞船正忙
- `ERR_NOT_FOUND (-4)` - 未找到目标
- `ERR_INVALID_ARGS (-9)` - 无效参数

#### harvest()

采集资源节点。

```javascript
// 采集资源节点
ship.harvest(resourceNode);
ship.harvest('iron_node_1');
```

**返回值：**
- `OK (0)` - 成功
- `ERR_NOT_IN_RANGE (-8)` - 目标不在范围内
- `ERR_FULL (-7)` - 货物已满
- `ERR_NOT_FOUND (-4)` - 未找到目标

#### transfer()

将资源转移到容器。

```javascript
// 转移指定数量的资源
ship.transfer(storage, 'iron_ore', 100);

// 转移所有资源
ship.transfer(storage, 'iron_ore');

// 使用ID
ship.transfer('storage_1', 'iron_ore');
```

**返回值：**
- `OK (0)` - 成功
- `ERR_NOT_IN_RANGE (-8)` - 目标不在范围内
- `ERR_NOT_ENOUGH_RESOURCES (-5)` - 资源不足
- `ERR_NOT_FOUND (-4)` - 未找到目标

#### withdraw()

从容器提取资源。

```javascript
// 提取指定数量的资源
ship.withdraw(storage, 'iron_ore', 50);

// 提取所有资源
ship.withdraw(storage, 'iron_ore');

// 使用ID
ship.withdraw('storage_1', 'iron_ore');
```

**返回值：**
- `OK (0)` - 成功
- `ERR_NOT_IN_RANGE (-8)` - 目标不在范围内
- `ERR_NOT_ENOUGH_RESOURCES (-5)` - 容器中资源不足
- `ERR_FULL (-7)` - 飞船货物已满
- `ERR_NOT_FOUND (-4)` - 未找到目标

#### say()

让飞船说话（显示消息）。

```javascript
ship.say('正在采集资源');
```

---

## 资源节点对象 (ResourceNode)

通过 `Game.resources` 访问资源节点。

### 属性

- `resourceNode.id` - 资源节点ID
- `resourceNode.resourceType` - 资源类型（如 'iron_ore', 'copper_ore'）
- `resourceNode.position` - 位置 `{ x, y, z }`
- `resourceNode.amount` - 剩余资源量

---

## 存储设施对象 (Structure)

通过 `Game.structures` 访问存储设施。

### 属性

- `structure.id` - 设施ID
- `structure.type` - 设施类型
- `structure.position` - 位置 `{ x, y, z }`
- `structure.cargo` - 存储的资源（对象，key为资源类型）
- `structure.cargoCapacity` - 总容量

---

## 常量

### 返回码

```javascript
OK = 0
ERR_NOT_OWNER = -1
ERR_NO_PATH = -2
ERR_BUSY = -3
ERR_NOT_FOUND = -4
ERR_NOT_ENOUGH_RESOURCES = -5
ERR_INVALID_TARGET = -6
ERR_FULL = -7
ERR_NOT_IN_RANGE = -8
ERR_INVALID_ARGS = -9
```

### 资源类型

**一级资源（原始资源）：**
- `iron_ore` - 铁矿石
- `copper_ore` - 铜矿石
- `titanium_ore` - 钛矿石
- `rare_metal_ore` - 稀有金属矿石
- `hydrogen_gas` - 氢气
- `helium_gas` - 氦气
- `nitrogen_gas` - 氮气
- `energy_crystal` - 能量晶体
- `silicon_crystal` - 硅晶体
- `crude_oil` - 原油
- `water` - 水

---

## 示例代码

### 基础采集循环

```javascript
module.exports.loop = function() {
  for (const shipId in Game.ships) {
    const ship = Game.ships[shipId];
    
    if (ship.store.getFreeCapacity() > 0) {
      // 货物未满，去采集
      const resource = Game.resources['iron_node_1'];
      ship.moveTo(resource.position);
      ship.harvest(resource.id);
    } else {
      // 货物满了，去存储
      const storage = Game.structures['storage_1'];
      ship.moveTo(storage.position);
      ship.transfer(storage.id, 'iron_ore');
    }
  }
};
```

### 使用内存的状态机

```javascript
module.exports.loop = function() {
  if (!Memory.ships) Memory.ships = {};
  
  for (const shipId in Game.ships) {
    const ship = Game.ships[shipId];
    
    if (!Memory.ships[shipId]) {
      Memory.ships[shipId] = { state: 'harvest' };
    }
    
    const mem = Memory.ships[shipId];
    
    if (mem.state === 'harvest') {
      const resource = Game.resources['iron_node_1'];
      ship.moveTo(resource.position);
      const result = ship.harvest(resource.id);
      
      if (ship.store.getFreeCapacity() === 0) {
        mem.state = 'store';
      }
    } else if (mem.state === 'store') {
      const storage = Game.structures['storage_1'];
      ship.moveTo(storage.position);
      ship.transfer(storage.id, 'iron_ore');
      
      if (ship.store.getUsedCapacity() === 0) {
        mem.state = 'harvest';
      }
    }
  }
};
```

---

## 最佳实践

1. **使用Memory保存状态** - 避免每个tick都重新计算相同的信息
2. **检查返回码** - 命令可能失败，检查返回码以处理错误
3. **优化CPU使用** - 避免不必要的循环和计算
4. **使用状态机** - 为复杂的飞船行为使用状态机模式
5. **记录日志** - 使用 `console.log()` 帮助调试代码

---

## 注意事项

- 每个tick的代码执行时间限制为5秒
- 代码在沙箱环境中运行，某些JavaScript功能可能受限
- 修改代码后会在下一个tick生效
- Memory对象会在服务器重启后丢失（未来会实现持久化）

