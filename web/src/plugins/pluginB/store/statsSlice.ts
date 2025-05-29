/**
 * 用户统计插件状态切片
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// 用户活动类型
export interface UserActivity {
  userId: string;
  username?: string;
  logins: number;
  lastLogin: string | null;
  contentCreated: number;
}

// 统计数据类型
export interface StatsData {
  totalLogins: number;
  activeUsers: number;
  userActivities: Record<string, UserActivity>;
  lastUpdated: string;
}

// 状态类型定义
interface StatsState {
  data: StatsData | null;
  personalStats: UserActivity | null;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: StatsState = {
  data: null,
  personalStats: null,
  loading: false,
  error: null,
};

// 获取统计数据
export const fetchStats = createAsyncThunk(
  'stats/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/plugins/user-stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '获取统计数据失败');
      }
      return rejectWithValue('获取统计数据失败，请稍后再试');
    }
  }
);

// 获取个人统计数据
export const fetchPersonalStats = createAsyncThunk(
  'stats/fetchPersonalStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/plugins/user-stats/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '获取个人统计数据失败');
      }
      return rejectWithValue('获取个人统计数据失败，请稍后再试');
    }
  }
);

// 创建统计状态切片
const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取统计数据
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action: PayloadAction<StatsData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 获取个人统计数据
    builder
      .addCase(fetchPersonalStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonalStats.fulfilled, (state, action: PayloadAction<UserActivity>) => {
        state.loading = false;
        state.personalStats = action.payload;
      })
      .addCase(fetchPersonalStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = statsSlice.actions;
export default statsSlice.reducer;
