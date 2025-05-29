/**
 * 用户统计插件 (Plugin B)
 * 提供用户活动统计和分析功能
 */
import { lazy } from 'react';
import { BarChart, Activity, Users } from 'lucide-react';
import { Plugin } from '@/core/pluginManager/types';
import statsSlice from './store/statsSlice';
import StatsWidget from './components/StatsWidget';

// 懒加载路由组件
const StatsOverview = lazy(() => import('./components/StatsOverview'));
const UserActivity = lazy(() => import('./components/UserActivity'));

/**
 * 用户统计插件定义
 */
const UserStatsPlugin: Plugin = {
  id: 'user-stats',
  name: '用户统计',
  version: '1.0.0',
  description: '提供用户活动统计和分析功能',
  dependencies: ['content-manager'], // 依赖内容管理插件
  
  // 插件路由定义
  routes: [
    {
      path: '/plugins/user-stats',
      element: <StatsOverview />,
    },
    {
      path: '/plugins/user-stats/activity',
      element: <UserActivity />,
    }
  ],
  
  // 插件菜单项
  menuItems: [
    {
      id: 'stats-overview',
      title: '统计概览',
      path: '/plugins/user-stats',
      icon: <BarChart size={20} />,
      order: 20,
    },
    {
      id: 'user-activity',
      title: '用户活动',
      path: '/plugins/user-stats/activity',
      icon: <Activity size={20} />,
      order: 21,
    }
  ],
  
  // 插件小部件
  widgets: [
    {
      id: 'stats-widget',
      title: '活动统计',
      component: StatsWidget,
      position: 'dashboard',
      size: 1,
      order: 20,
    }
  ],
  
  // Redux状态模块
  storeModule: statsSlice,
  
  // 插件初始化方法
  initialize: async () => {
    console.log('用户统计插件初始化');
  },
  
  // 插件加载方法
  load: async () => {
    console.log('用户统计插件加载');
    // 这里可以加载插件所需的初始数据
  },
  
  // 插件卸载方法
  unload: async () => {
    console.log('用户统计插件卸载');
    // 清理插件资源
  },
};

export default UserStatsPlugin;
