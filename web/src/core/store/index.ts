/**
 * Redux状态管理配置
 * 集成插件状态管理系统
 */
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './modules/userSlice';
import appReducer from './modules/appSlice';
import PluginStoreManager from './pluginStore';

// 创建插件状态管理器
const pluginStoreManager = new PluginStoreManager({
  user: userReducer,
  app: appReducer,
});

// 配置Redux存储
const store = configureStore({
  reducer: pluginStoreManager.getReducer(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些非可序列化的值
        ignoredActions: ['plugin/registered', 'plugin/loaded', 'plugin/unloaded'],
        ignoredPaths: ['plugins'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 定义RootState和AppDispatch类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出工具函数
export const registerPluginReducer = (
  pluginId: string,
  reducer: any,
  options?: { persistent?: boolean }
) => {
  pluginStoreManager.registerPluginReducer(pluginId, reducer, options);
};

export const removePluginReducer = (pluginId: string) => {
  pluginStoreManager.removePluginReducer(pluginId);
};

export default store;
