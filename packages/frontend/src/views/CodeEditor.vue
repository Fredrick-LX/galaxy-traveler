<template>
  <div 
    class="code-editor-window" 
    :style="windowStyle"
    @mousedown="startDrag"
  >
    <div class="window-header" @mousedown="startDrag">
      <h2>{{ currentFile }}</h2>
      <div class="header-actions">
        <button @click="createNewFile" class="header-btn" title="新建文件">
          <img src="/assets/icons/ui/file-new.svg" alt="新建" />
        </button>
        <button @click="submitCode" class="header-btn" title="保存代码" :disabled="isRunning">
          <img src="/assets/icons/ui/save.svg" alt="保存" />
        </button>
        <button @click="$emit('close')" class="header-btn close-btn" title="关闭">✕</button>
      </div>
    </div>

    <div class="editor-content">
      <textarea
        ref="codeEditor"
        v-model="code"
        class="code-textarea"
        spellcheck="false"
        placeholder="在此编写你的代码..."
      ></textarea>
      <div class="editor-footer">
        <span>{{ currentFile }}</span>
        <span>行: {{ lineCount }} | 字符: {{ code.length }}</span>
      </div>
    </div>

    <!-- 调整大小手柄 -->
    <div class="resize-handle resize-handle-se" @mousedown.stop="startResize"></div>
    <div class="resize-handle resize-handle-e" @mousedown.stop="startResize"></div>
    <div class="resize-handle resize-handle-s" @mousedown.stop="startResize"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const emit = defineEmits<{
  close: []
  log: [message: string, type?: 'info' | 'error' | 'success']
}>();

const code = ref(`// 你的飞船控制代码
module.exports.loop = function() {
  // 遍历所有飞船
  for (const shipId in Game.ships) {
    const ship = Game.ships[shipId];
    
    // 检查货物容量
    if (ship.store.getFreeCapacity() > 0) {
      // 货物未满，去采集
      const resource = findNearestResource(ship);
      if (resource) {
        ship.moveTo(resource.position);
        ship.harvest(resource.id);
        ship.say('采集中...');
      }
    } else {
      // 货物满了，去存储
      const storage = findNearestStorage(ship);
      if (storage) {
        ship.moveTo(storage.position);
        ship.transfer(storage.id, 'iron_ore');
        ship.say('存储中...');
      }
    }
  }
};

// 查找最近的资源
function findNearestResource(ship) {
  let nearest = null;
  let minDist = Infinity;
  
  for (const id in Game.resources) {
    const res = Game.resources[id];
    if (res.amount > 0) {
      const dist = getDistance(ship.pos, res.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = res;
      }
    }
  }
  return nearest;
}

// 查找最近的存储
function findNearestStorage(ship) {
  let nearest = null;
  let minDist = Infinity;
  
  for (const id in Game.structures) {
    const struct = Game.structures[id];
    const dist = getDistance(ship.pos, struct.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = struct;
    }
  }
  return nearest;
}

// 计算距离
function getDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
`);

const codeEditor = ref<HTMLTextAreaElement | null>(null);
const isRunning = ref(false);
const currentFile = ref('main.js');

// 窗口位置和大小
const windowX = ref(100);
const windowY = ref(100);
const windowWidth = ref(800);
const windowHeight = ref(600);

const isDragging = ref(false);
const isResizing = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);

const lineCount = computed(() => {
  return code.value.split('\n').length;
});

const windowStyle = computed(() => ({
  left: `${windowX.value}px`,
  top: `${windowY.value}px`,
  width: `${windowWidth.value}px`,
  height: `${windowHeight.value}px`,
}));

onMounted(() => {
  loadCode();
  
  // 居中窗口
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  windowX.value = (screenWidth - windowWidth.value) / 2;
  windowY.value = (screenHeight - windowHeight.value) / 2;
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
});

function onMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    windowX.value = e.clientX - dragStartX.value;
    windowY.value = e.clientY - dragStartY.value;
    
    // 限制窗口位置
    windowX.value = Math.max(0, Math.min(windowX.value, window.innerWidth - 200));
    windowY.value = Math.max(0, Math.min(windowY.value, window.innerHeight - 100));
  }
  
  if (isResizing.value) {
    const deltaX = e.clientX - resizeStartX.value;
    const deltaY = e.clientY - resizeStartY.value;
    
    windowWidth.value = Math.max(400, resizeStartWidth.value + deltaX);
    windowHeight.value = Math.max(300, resizeStartHeight.value + deltaY);
  }
}

function onMouseUp() {
  isDragging.value = false;
  isResizing.value = false;
}

function startDrag(e: MouseEvent) {
  if ((e.target as HTMLElement).tagName === 'BUTTON') return;
  isDragging.value = true;
  dragStartX.value = e.clientX - windowX.value;
  dragStartY.value = e.clientY - windowY.value;
}

function startResize(e: MouseEvent) {
  isResizing.value = true;
  resizeStartX.value = e.clientX;
  resizeStartY.value = e.clientY;
  resizeStartWidth.value = windowWidth.value;
  resizeStartHeight.value = windowHeight.value;
}

function createNewFile() {
  const fileName = prompt('输入文件名:', 'main.js');
  if (fileName) {
    currentFile.value = fileName;
    code.value = `// ${fileName}\nmodule.exports.loop = function() {\n  // 你的代码\n};\n`;
    emit('log', `创建新文件: ${fileName}`, 'info');
  }
}

async function loadCode() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get('http://localhost:3000/api/code/current', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.code) {
      code.value = response.data.code;
      emit('log', '代码加载成功', 'success');
    }
  } catch (error: any) {
    emit('log', `加载代码失败: ${error.response?.data?.error || error.message}`, 'error');
  }
}

async function submitCode() {
  try {
    isRunning.value = true;
    const token = localStorage.getItem('auth_token');
    
    await axios.post(
      'http://localhost:3000/api/code/submit',
      { code: code.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    emit('log', '代码保存成功！将在下一个Tick运行', 'success');
  } catch (error: any) {
    emit('log', `保存代码失败: ${error.response?.data?.error || error.message}`, 'error');
  } finally {
    isRunning.value = false;
  }
}

</script>

<style scoped>
.code-editor-window {
  position: fixed;
  background: #FFFFFF;
  border: 3px solid #000000;
  border-radius: 0;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  user-select: none;
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #EEEEEE;
  border-bottom: 2px solid #000000;
  cursor: move;
}

.window-header h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #000000;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.header-btn {
  width: 32px;
  height: 32px;
  padding: 4px;
  background: #FFFFFF;
  border: 2px solid #000000;
  border-radius: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.header-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.header-btn img {
  width: 18px;
  height: 18px;
}

.header-btn:hover:not(:disabled) {
  background: #000000;
  color: #FFFFFF;
  transform: translate(-1px, -1px);
  box-shadow: 1px 1px 0 #000000;
}

.header-btn:hover:not(:disabled) img {
  filter: invert(1);
}

.header-btn.close-btn {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  padding: 0;
}

.header-btn.close-btn:hover {
  background: #FF4444;
  color: #FFFFFF;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: text;
}

.code-textarea {
  flex: 1;
  padding: 16px;
  background: #FAFAFA;
  color: #000000;
  border: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  tab-size: 2;
}

.editor-footer {
  padding: 8px 16px;
  background: #000000;
  color: #FFFFFF;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
}

/* 调整大小手柄 */
.resize-handle {
  position: absolute;
  background: transparent;
}

.resize-handle-se {
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
}

.resize-handle-se::after {
  content: '';
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 12px 12px;
  border-color: transparent transparent #000000 transparent;
}

.resize-handle-e {
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
}

.resize-handle-s {
  left: 0;
  right: 0;
  bottom: 0;
  height: 6px;
  cursor: ns-resize;
}

</style>

