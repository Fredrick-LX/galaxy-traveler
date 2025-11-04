/**
 * 路由配置
 */

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// 导入视图组件
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import GameMain from '../views/GameMain.vue';

// 路由定义
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true },
    },
    {
        path: '/game',
        name: 'GameMain',
        component: GameMain,
        meta: { requiresAuth: true },
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false },
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { requiresAuth: false },
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: ForgotPassword,
        meta: { requiresAuth: false },
    },
];

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 路由守卫
router.beforeEach((to, _, next) => {
    const token = localStorage.getItem('auth_token');
    const requiresAuth = to.meta.requiresAuth;

    if (requiresAuth && !token) {
        // 需要认证但没有 token，跳转到登录页
        next('/login');
    } else if (!requiresAuth && token && to.path !== '/') {
        // 已登录用户访问登录/注册页，跳转到主页
        next('/');
    } else {
        next();
    }
});

export default router;

