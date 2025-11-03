/**
 * 游戏事件处理服务
 */

import { Server } from 'socket.io';
import { verifyToken } from '@/utils/jwt';

export class SocketEventsHandler {
    private io: Server;
    constructor(io: Server) {
        this.io = io;
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
}