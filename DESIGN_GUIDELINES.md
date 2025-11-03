# Galaxy Traveler 设计规范

## 整体风格

本项目采用**简洁像素风格**设计，营造复古、极简的视觉体验。

## 设计原则

### 1. 色彩规范

**仅使用黑白灰色系（灰度 0-255）**

- 纯黑：`#000000` (rgb(0, 0, 0))
- 深灰：`#333333` (rgb(51, 51, 51))
- 中灰：`#666666` (rgb(102, 102, 102))
- 浅灰：`#999999` (rgb(153, 153, 153))
- 更浅灰：`#CCCCCC` (rgb(204, 204, 204))
- 极浅灰：`#EEEEEE` (rgb(238, 238, 238))
- 纯白：`#FFFFFF` (rgb(255, 255, 255))

**禁止使用彩色**

### 2. 渐变使用

- ❌ 避免使用彩色渐变
- ⚠️ 尽量减少渐变效果
- ✅ 如需渐变，仅使用黑白灰渐变，且要节制

### 3. 模糊效果

- 采用像素模糊（pixelated blur）
- 使用 `image-rendering: pixelated` 或 `image-rendering: crisp-edges`
- 阴影效果也应符合像素风格

### 4. 形状规范

**减少圆角，多使用直角**

- ✅ 矩形（border-radius: 0）
- ✅ 像素圆形（使用 box-shadow 制作像素化圆角）
- ⚠️ 小圆角（2-4px）可用于少量元素
- ❌ 避免大圆角（> 8px）

### 5. 边框

- 使用实线边框
- 边框宽度：1px, 2px, 3px
- 边框颜色：黑色或深灰色

### 6. 阴影

- 使用硬阴影（无模糊或极小模糊）
- 阴影颜色：黑色或深灰色
- 示例：`box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2)`

### 7. 动画

- 使用简单、直接的动画
- 避免复杂的缓动函数
- 可使用 steps() 动画函数制作像素风动画

### 8. 字体

- 使用等宽字体或像素字体
- 推荐字体：
  - 'Courier New', Courier, monospace
  - 'Press Start 2P'（可选的像素字体）
  - 'DotGothic16'（可选的像素字体）

## 组件设计示例

### 按钮

```css
.button {
    background: #000;
    color: #fff;
    border: 2px solid #000;
    border-radius: 0; /* 无圆角 */
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.1s; /* 快速过渡 */
}

.button:hover {
    background: #fff;
    color: #000;
    box-shadow: 2px 2px 0 #000; /* 硬阴影 */
}
```

### 输入框

```css
.input {
    background: #fff;
    color: #000;
    border: 2px solid #333;
    border-radius: 0;
    padding: 10px;
}

.input:focus {
    border-color: #000;
    outline: none;
    box-shadow: 0 0 0 2px #ccc; /* 像素化焦点 */
}
```

### 卡片

```css
.card {
    background: #fff;
    border: 3px solid #000;
    border-radius: 0;
    padding: 20px;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
}
```

## 背景

- 纯色背景（白色、浅灰色）
- 点阵背景（像素点）
- 网格背景（细线网格）

## 禁止事项

- ❌ 不使用彩色（红、蓝、绿、紫等）
- ❌ 不使用大圆角（> 8px）
- ❌ 不使用复杂渐变
- ❌ 不使用模糊阴影（除非是像素化的）
- ❌ 不使用花哨的动画效果

## 允许事项

- ✅ 黑白灰色系
- ✅ 矩形、直角
- ✅ 像素化效果
- ✅ 硬阴影
- ✅ 简洁的动画
- ✅ 等宽字体

## 用户显示规范

### 玩家名称显示格式

在游戏内所有位置，玩家名称应统一显示为：

```
用户名#UUID前8位
```

**样式规范：**
- 用户名部分：纯黑色 (#000000)，加粗
- UUID 部分：浅灰色 (#999999)，正常字重
- 分隔符：# 号，颜色与 UUID 保持一致

**示例：**
```
张三#a1b2c3d4
```

**实现说明：**
- 用户名允许重复
- 通过 UUID 区分不同玩家
- UUID 显示前 8 位即可（完整 UUID 可通过悬停或详情查看）
- 颜色对比度符合可访问性标准

### CSS 参考

```css
.display-name {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
}

.username {
    color: #000000;
    font-weight: 700;
}

.uuid-suffix {
    color: #999999;
    font-size: 14px;
    font-weight: 400;
}
```

## 参考

- 复古游戏界面
- 像素艺术
- 极简主义设计
- 黑白摄影美学

---

