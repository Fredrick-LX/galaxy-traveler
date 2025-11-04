/**
 * 后端主入口文件
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDatabase, closeDatabase } from '@/db/db';
import { SocketEventsHandler } from '@/services/SocketEventsHandler';
import { getGameEngine } from '@/services/GameEngine';
import { GameInitializer } from '@/services/GameInitializer';
import authRoutes from '@/routes/authRoutes';
import gameDataRoutes from '@/routes/gameDataRoutes';
import galaxyRoutes from '@/routes/galaxyRoutes';

const app = express();
const httpServer = createServer(app);

// Socket.io 配置
const io = new Server(httpServer, {
    cors: {
        origin: '*', // 开发环境允许所有来源，生产环境应该限制
        methods: ['GET', 'POST'],
    },
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/game-data', gameDataRoutes);
app.use('/api/galaxy', galaxyRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// 初始化 Socket 事件处理
const socketEventsHandler = new SocketEventsHandler(io);
socketEventsHandler.initializeEvents();

// 启动服务器
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // 初始化数据库
        await initDatabase();

        // 启动游戏引擎
        const gameEngine = getGameEngine();
        const gameInitializer = new GameInitializer(gameEngine);
        gameInitializer.initializeTestEnvironment();
        
        // 设置游戏引擎的状态广播回调
        gameEngine.setStateBroadcaster(() => {
            socketEventsHandler.broadcastGameState();
        });
        
        gameEngine.start();

        // 启动服务器
        httpServer.listen(PORT, () => {
            console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
            console.log(`📡 Socket.io 服务已启动`);
            console.log(`🎮 游戏引擎已启动`);
        });
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}

// 优雅退出标志，防止重复关闭
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
    if (isShuttingDown) {
        console.log('⚠️ 正在关闭中，请稍候...');
        return;
    }
    
    isShuttingDown = true;
    console.log(`\n⏳ 收到 ${signal} 信号，正在关闭服务器...`);
    
    try {
        // 1. 停止游戏引擎
        const gameEngine = getGameEngine();
        gameEngine.stop();
        console.log('✅ 游戏引擎已停止');
        
        // 2. 关闭 Socket.io 连接
        io.close(() => {
            console.log('✅ Socket.io 已关闭');
        });
        
        // 3. 关闭 HTTP 服务器（等待所有连接结束）
        await new Promise<void>((resolve) => {
            httpServer.close((err) => {
                if (err) {
                    console.error('❌ 关闭 HTTP 服务器时出错:', err);
                } else {
                    console.log('✅ HTTP 服务器已关闭');
                }
                resolve();
            });
        });
        
        // 4. 关闭数据库连接
        await closeDatabase();
        
        console.log('✅ 服务器已完全关闭');
        process.exit(0);
    } catch (error) {
        console.error('❌ 关闭服务器时出错:', error);
        process.exit(1);
    }
}

// 监听所有可能的退出信号
process.on('SIGINT', () => gracefulShutdown('SIGINT'));      // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));    // kill 命令
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));    // Ctrl+\
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));      // 终端关闭

// Windows 特定信号
if (process.platform === 'win32') {
    // Windows 下监听 Ctrl+Break
    process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));
}

// 处理未捕获的异常
process.on('uncaughtException', async (error) => {
    console.error('❌ 未捕获的异常:', error);
    await gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('❌ 未处理的 Promise 拒绝:', reason);
    await gracefulShutdown('unhandledRejection');
});

// 进程正常退出前的清理（作为最后的保障）
process.on('beforeExit', async (code) => {
    if (!isShuttingDown && code === 0) {
        console.log('⚠️ 进程即将退出，执行清理...');
        await gracefulShutdown('beforeExit');
    }
});

startServer();

