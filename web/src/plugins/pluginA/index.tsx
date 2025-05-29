/**
 * 内容管理插件 (Plugin A)
 * 提供内容管理相关功能的前端插件
 */
import { lazy } from 'react';
import { FileText, List, PlusCircle } from 'lucide-react';
import { Plugin } from '@/core/pluginManager/types';
import contentSlice from './store/contentSlice';
import ContentWidget from './components/ContentWidget';

// 懒加载路由组件
const ContentList = lazy(() => import('./components/ContentList'));
const ContentDetail = lazy(() => import('./components/ContentDetail'));
const ContentCreate = lazy(() => import('./components/ContentCreate'));

/**
 * 内容管理插件定义
 */
const ContentManagerPlugin: Plugin = {
  id: 'content-manager',
  name: '内容管理',
  version: '1.0.0',
  description: '提供内容的创建、编辑、查看和管理功能',
  
  // 插件路由定义
  routes: [
    {
      path: '/plugins/content-manager',
      element: <ContentList />,
    },
    {
      path: '/plugins/content-manager/view/:id',
      element: <ContentDetail />,
    },
    {
      path: '/plugins/content-manager/create',
      element: <ContentCreate />,
    },
  ],
  
  // 插件菜单项
  menuItems: [
    {
      id: 'content-list',
      title: '内容列表',
      path: '/plugins/content-manager',
      icon: <List size={20} />,
      order: 10,
    },
    {
      id: 'content-create',
      title: '创建内容',
      path: '/plugins/content-manager/create',
      icon: <PlusCircle size={20} />,
      order: 11,
    },
  ],
  
  // 插件小部件
  widgets: [
    {
      id: 'recent-content',
      title: '最近内容',
      component: ContentWidget,
      position: 'dashboard',
      size: 2,
      order: 10,
    },
  ],
  
  // Redux状态模块
  storeModule: contentSlice,
  
  // 插件初始化方法
  initialize: async () => {
    console.log('内容管理插件初始化');
  },
  
  // 插件加载方法
  load: async () => {
    console.log('内容管理插件加载');
    // 这里可以加载插件所需的初始数据
    // 例如从API获取内容列表等
  },
  
  // 插件卸载方法
  unload: async () => {
    console.log('内容管理插件卸载');
    // 清理插件资源
  },
};

export default ContentManagerPlugin;
