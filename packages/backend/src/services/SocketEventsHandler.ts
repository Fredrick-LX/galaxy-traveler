/**
 * 游戏事件处理服务
 */

import { Server, Socket } from 'socket.io';
import { verifyToken } from '@/utils/jwt';
import { getGameEngine } from './GameEngine';

export class SocketEventsHandler {
    private io: Server;
    private gameEngine: ReturnType<typeof getGameEngine>;
    
    constructor(io: Server) {
        this.io = io;
        this.gameEngine = getGameEngine();
    }
    
    /**
     * 广播游戏状态更新
     */
    broadcastGameState() {
        const world = this.gameEngine.getWorld();
        
        const gameState = {
            tick: world.tick,
            timestamp: Date.now(),
            ships: Array.from(world.ships.values()).map(ship => ({
                instanceId: ship.instanceId,
                ownerId: ship.ownerId,
                position: ship.position,
                status: ship.status,
                currentHealth: ship.currentHealth,
                cargo: Object.fromEntries(ship.cargo),
                cargoCapacity: ship.cargoCapacity,
                actionProgress: ship.actionProgress,
            })),
            resourceNodes: Array.from(world.resourceNodes.values()).map(node => ({
                id: node.id,
                resourceType: node.resourceType,
                position: node.position,
                currentAmount: node.currentAmount,
                amount: node.amount,
            })),
            structures: Array.from(world.structures.values()).map(structure => ({
                id: structure.id,
                type: structure.type,
                ownerId: structure.ownerId,
                position: structure.position,
                cargo: Object.fromEntries(structure.cargo),
                cargoCapacity: structure.cargoCapacity,
            })),
        };
        
        this.io.emit('gameStateUpdate', gameState);
    }

    initializeEvents() {
        // Socket 认证中间件
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;

            if (!token) {
                socket.data.authenticated = false;
                return next();
            }

            const payload = verifyToken(token);
            if (!payload) {
                socket.data.authenticated = false;
                return next();
            }

            socket.data.authenticated = true;
            socket.data.userId = payload.userId;
            socket.data.email = payload.email;

            next();
        });

        // 连接事件
        this.io.on('connection', (socket) => {
            console.log(`✅ 用户 ${socket.data.userId} 已连接 (Socket ID: ${socket.id})`);
            if (socket.data.authenticated && socket.data.userId) {
                const userId = socket.data.userId;
                socket.join(`user:${userId}`);
                console.log(`✅ 用户 ${userId} 已连接 (Socket ID: ${socket.id})`);

                socket.emit('connected', {
                    message: '连接成功',
                    userId,
                    timestamp: Date.now()
                });
            } else {
                socket.emit('connected', {
                    message: '连接成功（未认证）',
                    timestamp: Date.now()
                });
            }

            socket.on('ping', () => {
                socket.emit('pong', { timestamp: Date.now() });
            });

            // 游戏命令处理
            this.setupGameCommands(socket);

            // 断开连接事件
            socket.on('disconnect', () => {
                if (!socket.data.authenticated || !socket.data.userId) {
                    console.log(`❌ Socket 已断开连接: ${socket.id}`);
                    return;
                }

                const userId = socket.data.userId;
                console.log(`❌ 用户 ${userId} 已断开连接 (Socket ID: ${socket.id})`);
            });

        });
    }

    /**
     * 设置游戏命令处理
     */
    private setupGameCommands(socket: Socket) {
        // 移动命令
        socket.on('command:move', (data: { shipId: string; x: number; y: number; z?: number }) => {
            if (!socket.data.authenticated) {
                socket.emit('error', { message: '未认证' });
                return;
            }

            const { shipId, x, y, z } = data;
            const result = this.gameEngine.executeShipCommand(shipId, 'moveTo', {
                target: { x, y, z: z || 0 }
            });

            socket.emit('command:result', { command: 'move', shipId, result });
        });

        // 采集命令
        socket.on('command:harvest', (data: { shipId: string; targetId: string }) => {
            if (!socket.data.authenticated) {
                socket.emit('error', { message: '未认证' });
                return;
            }

            const { shipId, targetId } = data;
            const result = this.gameEngine.executeShipCommand(shipId, 'harvest', {
                targetId
            });

            socket.emit('command:result', { command: 'harvest', shipId, result });
        });

        // 转移命令
        socket.on('command:transfer', (data: { shipId: string; targetId: string; resourceType: string; amount?: number }) => {
            if (!socket.data.authenticated) {
                socket.emit('error', { message: '未认证' });
                return;
            }

            const { shipId, targetId, resourceType, amount } = data;
            const result = this.gameEngine.executeShipCommand(shipId, 'transfer', {
                targetId,
                resourceType,
                amount
            });

            socket.emit('command:result', { command: 'transfer', shipId, result });
        });

        // 提取命令
        socket.on('command:withdraw', (data: { shipId: string; targetId: string; resourceType: string; amount?: number }) => {
            if (!socket.data.authenticated) {
                socket.emit('error', { message: '未认证' });
                return;
            }

            const { shipId, targetId, resourceType, amount } = data;
            const result = this.gameEngine.executeShipCommand(shipId, 'withdraw', {
                targetId,
                resourceType,
                amount
            });

            socket.emit('command:result', { command: 'withdraw', shipId, result });
        });

        // 建造建筑命令
        socket.on('command:buildStructure', (data: { buildingId: string; x: number; y: number; z?: number }) => {
            if (!socket.data.authenticated) {
                socket.emit('error', { message: '未认证' });
                return;
            }

            const { buildingId, x, y, z } = data;
            const userId = socket.data.userId;

            // TODO: 实现建造逻辑
            console.log(`用户 ${userId} 建造 ${buildingId} 在 (${x}, ${y})`);

            socket.emit('command:result', { 
                command: 'buildStructure', 
                buildingId, 
                result: 0 // OK
            });
        });

        // 拆除建筑命令
        socket.on('command:demolish', (data: { structureId: string }) => {
            if (!socket.data.authenticated) {
                socket.emit('error', { message: '未认证' });
                return;
            }

            const { structureId } = data;

            // TODO: 实现拆除逻辑
            console.log(`拆除建筑 ${structureId}`);

            socket.emit('command:result', { 
                command: 'demolish', 
                structureId, 
                result: 0 // OK
            });
        });

        // 请求当前游戏状态
        socket.on('requestGameState', () => {
            const world = this.gameEngine.getWorld();
            
            const gameState = {
                tick: world.tick,
                timestamp: Date.now(),
                ships: Array.from(world.ships.values()).map(ship => ({
                    instanceId: ship.instanceId,
                    ownerId: ship.ownerId,
                    position: ship.position,
                    status: ship.status,
                    currentHealth: ship.currentHealth,
                    cargo: Object.fromEntries(ship.cargo),
                    cargoCapacity: ship.cargoCapacity,
                    actionProgress: ship.actionProgress,
                })),
                resourceNodes: Array.from(world.resourceNodes.values()).map(node => ({
                    id: node.id,
                    resourceType: node.resourceType,
                    position: node.position,
                    currentAmount: node.currentAmount,
                    amount: node.amount,
                })),
                structures: Array.from(world.structures.values()).map(structure => ({
                    id: structure.id,
                    type: structure.type,
                    ownerId: structure.ownerId,
                    position: structure.position,
                    cargo: Object.fromEntries(structure.cargo),
                    cargoCapacity: structure.cargoCapacity,
                })),
            };
            
            socket.emit('gameState', gameState);
        });
    }
}