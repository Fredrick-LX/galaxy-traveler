# @galaxy-traveler/shared

Galaxy Traveler 游戏的共享类型定义包，供前端和后端使用。

## 包含的类型

### 船舶类型 (ships.ts)
- **战舰 (Warship)**: 驱逐舰、巡洋舰、战列舰、航空母舰
  - 不同的部件槽和部件容量配置
- **探索船 (ExplorerShip)**: 5个等级
  - 提供武器、生命、速度等加成
- **工程船 (EngineerShip)**: 5个等级
  - 提供容量、速度、建设速度等加成

### 建筑类型 (buildings.ts)
- **采矿设施 (MiningFacility)**: 矿石提取器、气体采集器、晶体采矿机等
- **加工设施 (ProcessingFacility)**: 精炼厂、化工厂、组装厂等
  - 支持不同等级的加工配方
- **建造设施 (ConstructionFacility)**: 船坞、部件工厂、维修站等

### 资源类型 (resources.ts)
- **一产 (Primary)**: 可直接通过工程船或采矿设施产出
  - 矿石、气体、晶体、液体
- **二产 (Secondary)**: 需要通过加工设施加工一产获取
  - 金属板、化学品、基础电路、能量电池
- **三产 (Tertiary)**: 需要消耗一产二产通过更高级的加工设施获取
  - 复合材料、高级组件、装备部件
- **四产 (Quaternary)**: 使用三产过程中产出
  - 研究数据、稀有资源、科技点

## 使用方式

### 在 Backend 中使用

```typescript
import { Ship, Building, Resource } from '@galaxy-traveler/shared';
```

### 在 Frontend 中使用

```typescript
import { ShipCategory, WarshipType, ResourceTier } from '@galaxy-traveler/shared';
```