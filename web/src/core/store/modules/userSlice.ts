/**
 * 用户状态切片
 * 管理用户登录、权限等状态
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// 用户类型定义
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'editor';
  allowedPlugins: string[];
  profile?: {
    avatar?: string;
    bio?: string;
  };
}

// 状态类型定义
interface UserState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: UserState = {
  currentUser: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// 登录异步操作
export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/users/login', credentials);
      const { token } = response.data.data;
      
      // 保存token到本地存储
      localStorage.setItem('token', token);
      
      return { token };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '登录失败');
      }
      return rejectWithValue('登录失败，请稍后再试');
    }
  }
);

// 获取当前用户信息
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue('未登录');
      }
      
      const response = await axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // 如果是401错误，清除token
        if (error.response.status === 401) {
          localStorage.removeItem('token');
        }
        return rejectWithValue(error.response.data.message || '获取用户信息失败');
      }
      return rejectWithValue('获取用户信息失败，请稍后再试');
    }
  }
);

// 登出操作
export const logout = createAsyncThunk(
  'user/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem('token');
    return null;
  }
);

// 创建用户状态切片
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 获取当前用户
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // 如果获取用户信息失败，可能是token无效
        if (action.payload === '未登录' || action.payload === '无效的访问令牌') {
          state.token = null;
          state.isAuthenticated = false;
          state.currentUser = null;
        }
      });
    
    // 登出
    builder.addCase(logout.fulfilled, (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setUser, clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;
