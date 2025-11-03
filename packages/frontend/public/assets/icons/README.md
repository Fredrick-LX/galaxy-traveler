# Galaxy Traveler 游戏图标素材

所有图标均采用黑白灰像素风格设计，符合项目设计规范。

## 📁 目录结构

```
icons/
├── resources/          # 资源图标
│   ├── primary/       # 一产资源 (11个)
│   ├── secondary/     # 二产资源 (10个)
│   ├── tertiary/      # 三产资源 (10个)
│   └── quaternary/    # 四产资源 (6个)
├── buildings/         # 建筑图标 (15个)
└── ships/            # 船舶图标 (14个)
```

## 🔷 一产资源 (Primary Resources)

### 矿石类
- `iron_ore.svg` - 铁矿石 (多边形矿石)
- `copper_ore.svg` - 铜矿石 (带纹理矿石)
- `titanium_ore.svg` - 钛矿石 (菱形晶体)
- `rare_metal_ore.svg` - 稀有金属矿石 (多面晶体)

### 气体类
- `hydrogen_gas.svg` - 氢气 (气罐+上升气泡)
- `helium_gas.svg` - 氦气 (气罐+多个小气泡)
- `nitrogen_gas.svg` - 氮气 (气罐+双原子结构)

### 晶体类
- `energy_crystal.svg` - 能量晶体 (六边形晶体)
- `silicon_crystal.svg` - 硅晶体 (方形晶格)

### 液体类
- `crude_oil.svg` - 原油 (油桶)
- `water.svg` - 水 (水滴)

## 🔸 二产资源 (Secondary Resources)

### 金属
- `iron_plate.svg` - 铁板
- `copper_plate.svg` - 铜板
- `titanium_alloy.svg` - 钛合金
- `rare_metal_ingot.svg` - 稀有金属锭

### 化学品
- `plastic.svg` - 塑料 (塑料颗粒堆)
- `fuel.svg` - 燃料 (带火焰标志的油桶)
- `chemical_reagent.svg` - 化学试剂 (锥形瓶)

### 电子元件
- `basic_circuit.svg` - 基础电路 (电路板)
- `silicon_wafer.svg` - 硅晶圆

### 能源
- `power_cell.svg` - 能量电池

## 🔶 三产资源 (Tertiary Resources)

### 高级材料
- `composite_material.svg` - 复合材料 (多层结构)
- `superconductor.svg` - 超导体 (线圈)
- `nano_material.svg` - 纳米材料 (六边形网格)

### 高级组件
- `advanced_circuit.svg` - 高级电路
- `quantum_processor.svg` - 量子处理器
- `reactor_core.svg` - 反应堆核心

### 装备部件
- `weapon_component.svg` - 武器部件 (炮管)
- `armor_plate.svg` - 装甲板 (盾形)
- `engine_module.svg` - 引擎模块 (涡轮)
- `shield_generator.svg` - 护盾发生器

## 🔺 四产资源 (Quaternary Resources)

- `research_data.svg` - 研究数据 (文档)
- `antimatter.svg` - 反物质 (容器中的能量球)
- `dark_matter.svg` - 暗物质 (黑洞效果)
- `exotic_particles.svg` - 奇异粒子 (粒子轨迹)
- `tech_points.svg` - 科技点 (六边形徽章)
- `strategic_resource.svg` - 战略资源 (保险箱)

## 🏭 建筑 (Buildings)

### 采矿设施
- `ore_extractor.svg` - 矿石提取器 (钻头)
- `gas_harvester.svg` - 气体采集器 (吸气装置)
- `crystal_miner.svg` - 晶体采矿机 (激光切割器)
- `liquid_pump.svg` - 液体泵 (抽水机)
- `advanced_mining_complex.svg` - 高级采矿综合体

### 加工设施
- `basic_refinery.svg` - 基础精炼厂
- `advanced_refinery.svg` - 高级精炼厂
- `chemical_plant.svg` - 化工厂 (储罐和管道)
- `assembly_plant.svg` - 组装厂 (机械臂)
- `high_tech_fabricator.svg` - 高科技制造厂

### 建造设施
- `shipyard.svg` - 船坞 (大型吊车)
- `component_factory.svg` - 部件工厂 (生产线)
- `structure_constructor.svg` - 结构建造器 (3D打印机)
- `repair_station.svg` - 维修站 (工具符号)
- `research_lab.svg` - 研究实验室 (实验器材)

## 🚀 船舶 (Ships)

### 战舰
- `destroyer.svg` - 驱逐舰 (小型快速)
- `cruiser.svg` - 巡洋舰 (中型)
- `battleship.svg` - 战列舰 (大型重型)
- `aircraft_carrier.svg` - 航空母舰 (平顶)

### 探索船 (5个等级)
- `explorer_1.svg` - 探索船 I级 (小型探测器)
- `explorer_2.svg` - 探索船 II级 (探测器阵列)
- `explorer_3.svg` - 探索船 III级 (高级探测器)
- `explorer_4.svg` - 探索船 IV级 (护翼+天线阵列)
- `explorer_5.svg` - 探索船 V级 (最高级)

### 工程船 (5个等级)
- `engineer_1.svg` - 工程船 I级 (小型)
- `engineer_2.svg` - 工程船 II级 (工具臂)
- `engineer_3.svg` - 工程船 III级 (双工具臂)
- `engineer_4.svg` - 工程船 IV级 (高级工具臂)
- `engineer_5.svg` - 工程船 V级 (最高级)

## 🎨 设计特点

- **配色**：仅使用黑白灰色系 (#000000 - #FFFFFF)
- **风格**：简洁像素风格，矩形和直角为主
- **阴影**：硬阴影，无模糊效果
- **尺寸**：统一 64x64 像素
- **格式**：SVG 矢量图，可无损缩放
- **识别度**：每个图标都有独特的视觉特征，易于区分

## 📝 使用示例

```vue
<template>
  <!-- 资源图标 -->
  <img src="/assets/icons/resources/primary/iron_ore.svg" alt="铁矿石" />
  
  <!-- 建筑图标 -->
  <img src="/assets/icons/buildings/shipyard.svg" alt="船坞" />
  
  <!-- 船舶图标 -->
  <img src="/assets/icons/ships/destroyer.svg" alt="驱逐舰" />
</template>
```

## 📊 统计信息

- **资源图标总数**：37 个
  - 一产：11 个
  - 二产：10 个
  - 三产：10 个
  - 四产：6 个
- **建筑图标总数**：15 个
- **船舶图标总数**：14 个
- **图标总数**：66 个

---

**创建日期**：2025-11-02  
**设计规范**：遵循 DESIGN_GUIDELINES.md

