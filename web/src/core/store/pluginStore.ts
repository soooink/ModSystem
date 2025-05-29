/**
 * 插件状态管理
 * 允许插件动态注册自己的Redux状态
 */
import { combineReducers, Reducer, ReducersMapObject, AnyAction } from '@reduxjs/toolkit';

// 插件状态记录
interface PluginReducerRecord {
  reducer: Reducer;
  persistent?: boolean;
}

// 插件状态管理器
class PluginStoreManager {
  private reducers: Record<string, PluginReducerRecord> = {};
  private dynamicReducer: Reducer | null = null;
  private combinedReducer: Reducer | null = null;
  private initialReducers: ReducersMapObject = {};

  constructor(initialReducers: ReducersMapObject = {}) {
    this.initialReducers = initialReducers;
    this.updateCombinedReducer();
  }

  /**
   * 注册插件reducer
   * @param pluginId 插件ID
   * @param reducer Reducer函数
   * @param options 选项
   */
  registerPluginReducer(
    pluginId: string, 
    reducer: Reducer, 
    options: { persistent?: boolean } = {}
  ): void {
    if (this.reducers[pluginId]) {
      console.warn(`插件 ${pluginId} 的reducer已存在，将被覆盖`);
    }

    this.reducers[pluginId] = {
      reducer,
      persistent: options.persistent || false
    };

    this.updateCombinedReducer();
  }

  /**
   * 移除插件reducer
   * @param pluginId 插件ID
   */
  removePluginReducer(pluginId: string): void {
    if (!this.reducers[pluginId]) {
      console.warn(`插件 ${pluginId} 的reducer不存在`);
      return;
    }

    delete this.reducers[pluginId];
    this.updateCombinedReducer();
  }

  /**
   * 更新组合reducer
   */
  private updateCombinedReducer(): void {
    // 合并所有reducer
    const allReducers: ReducersMapObject = { ...this.initialReducers };

    // 添加插件reducer
    Object.entries(this.reducers).forEach(([pluginId, record]) => {
      allReducers[`plugin_${pluginId}`] = record.reducer;
    });

    // 创建新的组合reducer
    this.combinedReducer = combineReducers(allReducers);

    // 创建动态reducer
    this.dynamicReducer = (state: any, action: AnyAction) => {
      // 处理插件卸载时的状态清理
      if (action.type === 'plugin/unloaded' && action.payload?.pluginId) {
        const pluginId = action.payload.pluginId;
        const pluginStateKey = `plugin_${pluginId}`;
        
        // 如果插件reducer存在且不是持久化的，则清除其状态
        if (
          this.reducers[pluginId] && 
          !this.reducers[pluginId].persistent && 
          state && 
          state[pluginStateKey]
        ) {
          // 创建一个新的状态，不包含被卸载插件的状态
          const newState = { ...state };
          delete newState[pluginStateKey];
          return this.combinedReducer!(newState, action);
        }
      }

      // 默认行为
      return this.combinedReducer!(state, action);
    };
  }

  /**
   * 获取动态reducer
   */
  getReducer(): Reducer {
    return this.dynamicReducer || ((state = {}) => state);
  }

  /**
   * 获取注册的插件reducer
   */
  getPluginReducers(): Record<string, PluginReducerRecord> {
    return { ...this.reducers };
  }
}

export default PluginStoreManager;
