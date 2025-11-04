<template>
    <div v-if="selectedUnits.length > 0" class="control-panel">
        <div class="panel-header">
            <h3>{{ panelTitle }}</h3>
            <button @click="$emit('close')" class="close-btn">✕</button>
        </div>

        <div class="panel-content">
            <!-- 多选显示 -->
            <div v-if="selectedUnits.length > 1" class="multi-selection">
                <div class="selection-count">
                    已选中 {{ selectedUnits.length }} 个单位
                </div>
                <div class="unit-grid">
                    <div
                        v-for="unit in selectedUnits"
                        :key="unit.id"
                        class="unit-icon"
                        :class="unit.type"
                    >
                        <img :src="getUnitIcon(unit.type)" :alt="unit.type" />
                    </div>
                </div>
            </div>

            <!-- 单选飞船 -->
            <div v-else-if="selectedShip" class="unit-details">
                <div class="detail-row">
                    <span class="label">ID:</span>
                    <span class="value">{{ selectedShip.instanceId }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">类型:</span>
                    <span class="value">工程船</span>
                </div>
                <div class="detail-row">
                    <span class="label">生命值:</span>
                    <div class="health-bar">
                        <div
                            class="health-fill"
                            :style="{
                                width: `${
                                    (selectedShip.currentHealth / 100) * 100
                                }%`,
                            }"
                        ></div>
                        <span class="health-text"
                            >{{ selectedShip.currentHealth }}/100</span
                        >
                    </div>
                </div>
                <div class="detail-row">
                    <span class="label">状态:</span>
                    <span class="value status" :class="selectedShip.status">
                        {{ getStatusText(selectedShip.status) }}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">货物:</span>
                    <span class="value"
                        >{{ getCargoUsed(selectedShip) }}/{{
                            selectedShip.cargoCapacity
                        }}</span
                    >
                </div>

                <!-- 货物清单 -->
                <div v-if="selectedShip.cargo.size > 0" class="cargo-list">
                    <h4>货物清单</h4>
                    <div
                        v-for="[resourceType, amount] in selectedShip.cargo"
                        :key="resourceType"
                        class="cargo-item"
                    >
                        <span class="resource-name">{{ resourceType }}</span>
                        <span class="resource-amount">{{ amount }}</span>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                    <button @click="commandStop" class="action-btn">
                        停止
                    </button>
                    <button @click="commandHarvest" class="action-btn">
                        采集
                    </button>
                    <button @click="commandTransfer" class="action-btn">
                        转移
                    </button>
                </div>
            </div>

            <!-- 单选建筑 -->
            <div v-else-if="selectedStructure" class="unit-details">
                <div class="detail-row">
                    <span class="label">ID:</span>
                    <span class="value">{{ selectedStructure.id }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">类型:</span>
                    <span class="value">{{ selectedStructure.type }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">容量:</span>
                    <span class="value"
                        >{{ selectedStructure.cargoUsed }}/{{
                            selectedStructure.cargoCapacity
                        }}</span
                    >
                </div>

                <!-- 存储资源 -->
                <div v-if="selectedStructure.cargo.size > 0" class="cargo-list">
                    <h4>存储资源</h4>
                    <div
                        v-for="[
                            resourceType,
                            amount,
                        ] in selectedStructure.cargo"
                        :key="resourceType"
                        class="cargo-item"
                    >
                        <span class="resource-name">{{ resourceType }}</span>
                        <span class="resource-amount">{{ amount }}</span>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                    <button
                        @click="$emit('demolish', selectedStructure.id)"
                        class="action-btn danger"
                    >
                        拆除
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { GameShip, GameStructure } from "@galaxy-traveler/shared";

interface UnitInfo {
    id: string;
    type: "ship" | "structure";
    data: GameShip | GameStructure;
}

const props = defineProps<{
    selectedUnits: UnitInfo[];
}>();

const emit = defineEmits<{
    close: [];
    command: [command: string, params: any];
    demolish: [structureId: string];
}>();

const panelTitle = computed(() => {
    if (props.selectedUnits.length > 1) {
        return `已选中 ${props.selectedUnits.length} 个单位`;
    }
    const unit = props.selectedUnits[0];
    if (!unit) return "";
    if (unit.type === "ship") {
        return "飞船";
    }
    return "建筑";
});

const selectedShip = computed(() => {
    const unit = props.selectedUnits[0];
    if (props.selectedUnits.length === 1 && unit?.type === "ship") {
        return unit.data as GameShip;
    }
    return null;
});

const selectedStructure = computed(() => {
    const unit = props.selectedUnits[0];
    if (props.selectedUnits.length === 1 && unit?.type === "structure") {
        return unit.data as GameStructure;
    }
    return null;
});

function getUnitIcon(type: string): string {
    return type === "ship"
        ? "/assets/icons/ships/engineer_1.svg"
        : "/assets/icons/buildings/shipyard.svg";
}

function getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
        idle: "空闲",
        moving: "移动中",
        mining: "采集中",
        constructing: "建造中",
        combat: "战斗中",
    };
    return statusMap[status] || status;
}

function getCargoUsed(ship: GameShip): number {
    let total = 0;
    for (const amount of ship.cargo.values()) {
        total += amount;
    }
    return total;
}

function commandStop() {
    emit("command", "stop", {});
}

function commandHarvest() {
    emit("command", "harvest", {});
}

function commandTransfer() {
    emit("command", "transfer", {});
}
</script>

<style scoped>
.control-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px;
    background: #ffffff;
    border: 3px solid #000000;
    border-radius: 0;
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
    font-family: "Courier New", monospace;
    z-index: 1000;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #eeeeee;
    border-bottom: 2px solid #000000;
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #000000;
}

.close-btn {
    padding: 4px 8px;
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 0;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    transition: all 0.1s;
}

.close-btn:hover {
    background: #000000;
    color: #ffffff;
}

.panel-content {
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;
}

.multi-selection {
    text-align: center;
}

.selection-count {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #000000;
}

.unit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 8px;
}

.unit-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eeeeee;
    border: 2px solid #cccccc;
}

.unit-icon img {
    width: 28px;
    height: 28px;
    object-fit: contain;
}

.unit-icon.ship {
    border-color: #4444ff;
}

.unit-icon.structure {
    border-color: #888888;
}

.unit-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.detail-row .label {
    font-weight: 700;
    color: #666666;
    min-width: 60px;
}

.detail-row .value {
    color: #000000;
    flex: 1;
}

.detail-row .status {
    padding: 2px 8px;
    background: #eeeeee;
    border: 1px solid #000000;
    font-size: 12px;
}

.detail-row .status.idle {
    background: #e6f7ff;
    border-color: #1890ff;
    color: #1890ff;
}

.detail-row .status.moving {
    background: #fff7e6;
    border-color: #ffa940;
    color: #ffa940;
}

.detail-row .status.mining {
    background: #f6ffed;
    border-color: #52c41a;
    color: #52c41a;
}

.health-bar {
    position: relative;
    flex: 1;
    height: 20px;
    background: #eeeeee;
    border: 2px solid #000000;
    overflow: hidden;
}

.health-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: #52c41a;
    transition: width 0.3s;
}

.health-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 11px;
    font-weight: 700;
    color: #000000;
    z-index: 1;
}

.cargo-list {
    background: #f5f5f5;
    border: 2px solid #000000;
    padding: 12px;
}

.cargo-list h4 {
    margin: 0 0 8px 0;
    font-size: 13px;
    font-weight: 700;
    color: #000000;
}

.cargo-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 12px;
    border-bottom: 1px solid #dddddd;
}

.cargo-item:last-child {
    border-bottom: none;
}

.resource-name {
    color: #666666;
}

.resource-amount {
    color: #000000;
    font-weight: 700;
}

.action-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 8px;
}

.action-btn {
    padding: 8px 12px;
    background: #ffffff;
    border: 2px solid #000000;
    border-radius: 0;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    font-family: "Courier New", monospace;
    transition: all 0.1s;
}

.action-btn:hover {
    background: #000000;
    color: #ffffff;
    box-shadow: 2px 2px 0 #000000;
    transform: translate(-1px, -1px);
}

.action-btn.danger {
    border-color: #ff4d4f;
    color: #ff4d4f;
}

.action-btn.danger:hover {
    background: #ff4d4f;
    color: #ffffff;
}

::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #eeeeee;
}

::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 0;
    border: 1px solid #000000;
}

::-webkit-scrollbar-thumb:hover {
    background: #999999;
}
</style>
