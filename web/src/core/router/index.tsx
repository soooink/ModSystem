/**
 * 主路由配置
 * 定义应用的核心路由结构
 */
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PluginRoutes from './pluginRoutes';
import Layout from '@/components/Layout';

// 懒加载核心页面
const Dashboard = lazy(() => import('@/views/Dashboard'));
const Login = lazy(() => import('@/views/Login'));
const NotFound = lazy(() => import('@/views/NotFound'));
const PluginManager = lazy(() => import('@/views/PluginManager'));

// 加载中组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    <span className="ml-3 text-lg">加载中...</span>
  </div>
);

// 创建路由器
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'plugins',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PluginManager />
          </Suspense>
        ),
      },
      {
        path: 'plugins/*',
        element: <PluginRoutes />,
      },
      // 其他核心路由在这里添加
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
]);

/**
 * 路由提供者组件
 */
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
