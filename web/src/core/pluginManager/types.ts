/**
 * 插件接口定义
 * 定义前端插件的基本结构和所需实现的接口
 */

import { FC, ReactNode } from 'react';
import { RouteObject } from 'react-router-dom';

/**
 * 插件基础接口
 */
export interface Plugin {
  // 插件标识
  id: string;
  // 插件名称
  name: string;
  // 插件版本
  version: string;
  // 插件描述
  description: string;
  // 插件入口组件
  component?: FC;
  // 插件路由定义
  routes?: RouteObject[];
  // 插件菜单项
  menuItems?: PluginMenuItem[];
  // 插件小部件
  widgets?: PluginWidget[];
  // 插件初始化方法
  initialize?: () => Promise<void> | void;
  // 插件加载方法
  load?: () => Promise<void> | void;
  // 插件卸载方法
  unload?: () => Promise<void> | void;
  // 插件依赖
  dependencies?: string[];
  // 插件样式路径
  stylePath?: string;
  // Redux状态模块
  storeModule?: any;
}

/**
 * 插件注册信息
 */
export interface PluginRegistration {
  // 插件对象
  plugin: Plugin;
  // 插件状态
  status: PluginStatus;
  // 加载错误信息
  error?: string;
  // 插件加载时间
  loadedAt?: Date;
}

/**
 * 插件状态枚举
 */
export enum PluginStatus {
  REGISTERED = 'registered',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  UNLOADED = 'unloaded'
}

/**
 * 插件菜单项
 */
export interface PluginMenuItem {
  // 菜单项ID
  id: string;
  // 菜单项标题
  title: string;
  // 菜单项路径
  path: string;
  // 菜单项图标
  icon?: ReactNode;
  // 父菜单ID，用于子菜单
  parent?: string;
  // 排序优先级
  order?: number;
  // 是否需要认证
  requireAuth?: boolean;
  // 所需权限
  permissions?: string[];
}

/**
 * 插件小部件
 */
export interface PluginWidget {
  // 小部件ID
  id: string;
  // 小部件标题
  title: string;
  // 小部件组件
  component: FC<any>;
  // 小部件位置
  position: 'dashboard' | 'sidebar' | 'header' | 'footer';
  // 小部件尺寸 (1-12，对应网格列数)
  size?: number;
  // 排序优先级
  order?: number;
  // 是否需要认证
  requireAuth?: boolean;
  // 所需权限
  permissions?: string[];
}

/**
 * 插件管理器事件类型
 */
export enum PluginEvent {
  REGISTERED = 'plugin:registered',
  LOADING = 'plugin:loading',
  LOADED = 'plugin:loaded',
  ERROR = 'plugin:error',
  UNLOADED = 'plugin:unloaded'
}

/**
 * 插件加载配置
 */
export interface PluginLoadOptions {
  // 是否自动初始化
  autoInitialize?: boolean;
  // 是否自动注册路由
  autoRegisterRoutes?: boolean;
  // 是否自动注册Redux模块
  autoRegisterStore?: boolean;
}

/**
 * 插件挂载点（用于将插件内容渲染到主应用程序指定位置）
 */
export interface PluginMountPoint {
  // 挂载点ID
  id: string;
  // 挂载点名称
  name: string;
  // 挂载点描述
  description?: string;
  // 可接受的插件类型
  accepts?: string[];
  // 最大插件数量 (0表示无限制)
  maxPlugins?: number;
}
