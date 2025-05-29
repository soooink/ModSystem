/**
 * 应用状态切片
 * 管理应用全局状态和插件相关状态
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// 插件类型定义
export interface PluginMeta {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  dependencies: string[];
  config?: Record<string, any>;
}

// 应用设置类型
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  sidebarCollapsed: boolean;
  pluginsDir: string;
  autoLoadAll: boolean;
  autoActivateAll: boolean;
  hotReload: boolean;
}

// 状态类型定义
interface AppState {
  appInfo: {
    name: string;
    version: string;
    description: string;
    environment: string;
    apiVersion: string;
    uptime: number;
  } | null;
  plugins: PluginMeta[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: AppState = {
  appInfo: null,
  plugins: [],
  settings: {
    theme: 'system',
    language: 'zh-CN',
    sidebarCollapsed: false,
    pluginsDir: 'src/plugins',
    autoLoadAll: true,
    autoActivateAll: true,
    hotReload: false,
  },
  loading: false,
  error: null,
};

// 获取应用信息
export const fetchAppInfo = createAsyncThunk(
  'app/fetchAppInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/app/info');
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '获取应用信息失败');
      }
      return rejectWithValue('获取应用信息失败，请稍后再试');
    }
  }
);

// 获取插件列表
export const fetchPlugins = createAsyncThunk(
  'app/fetchPlugins',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get('/api/app/plugins', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '获取插件列表失败');
      }
      return rejectWithValue('获取插件列表失败，请稍后再试');
    }
  }
);

// 激活插件
export const activatePlugin = createAsyncThunk(
  'app/activatePlugin',
  async (pluginId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/app/plugins/${pluginId}/activate`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '激活插件失败');
      }
      return rejectWithValue('激活插件失败，请稍后再试');
    }
  }
);

// 停用插件
export const deactivatePlugin = createAsyncThunk(
  'app/deactivatePlugin',
  async (pluginId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/app/plugins/${pluginId}/deactivate`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '停用插件失败');
      }
      return rejectWithValue('停用插件失败，请稍后再试');
    }
  }
);

// 获取系统设置
export const fetchSettings = createAsyncThunk(
  'app/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/app/settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '获取系统设置失败');
      }
      return rejectWithValue('获取系统设置失败，请稍后再试');
    }
  }
);

// 更新系统设置
export const updateSettings = createAsyncThunk(
  'app/updateSettings',
  async (settings: Partial<AppSettings>, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/app/settings', settings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '更新系统设置失败');
      }
      return rejectWithValue('更新系统设置失败，请稍后再试');
    }
  }
);

// 创建应用状态切片
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.settings.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.settings.language = action.payload;
    },
    toggleSidebar: (state) => {
      state.settings.sidebarCollapsed = !state.settings.sidebarCollapsed;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取应用信息
    builder
      .addCase(fetchAppInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.appInfo = action.payload;
      })
      .addCase(fetchAppInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 获取插件列表
    builder
      .addCase(fetchPlugins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlugins.fulfilled, (state, action) => {
        state.loading = false;
        state.plugins = action.payload;
      })
      .addCase(fetchPlugins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 激活插件
    builder
      .addCase(activatePlugin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activatePlugin.fulfilled, (state, action) => {
        state.loading = false;
        // 更新插件状态
        const index = state.plugins.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.plugins[index] = action.payload;
        }
      })
      .addCase(activatePlugin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 停用插件
    builder
      .addCase(deactivatePlugin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivatePlugin.fulfilled, (state, action) => {
        state.loading = false;
        // 更新插件状态
        const index = state.plugins.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.plugins[index] = action.payload;
        }
      })
      .addCase(deactivatePlugin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 获取系统设置
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        // 合并远程设置和本地设置
        state.settings = {
          ...state.settings,
          ...action.payload,
        };
      });
    
    // 更新系统设置
    builder
      .addCase(updateSettings.fulfilled, (state, action) => {
        // 更新设置
        state.settings = {
          ...state.settings,
          ...action.payload,
        };
      });
  },
});

export const { setTheme, setLanguage, toggleSidebar, clearError } = appSlice.actions;
export default appSlice.reducer;
