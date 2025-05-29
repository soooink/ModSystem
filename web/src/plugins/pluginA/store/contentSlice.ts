/**
 * 内容管理插件状态切片
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// 内容类型定义
export interface Content {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  createdBy?: string;
}

// 状态类型定义
interface ContentState {
  items: Content[];
  currentItem: Content | null;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: ContentState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
};

// 获取内容列表
export const fetchContents = createAsyncThunk(
  'content/fetchContents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/plugins/content-manager', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '获取内容失败');
      }
      return rejectWithValue('获取内容失败，请稍后再试');
    }
  }
);

// 获取单个内容
export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/plugins/content-manager/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '获取内容详情失败');
      }
      return rejectWithValue('获取内容详情失败，请稍后再试');
    }
  }
);

// 创建内容
export const createContent = createAsyncThunk(
  'content/createContent',
  async (data: { title: string; body: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/plugins/content-manager', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || '创建内容失败');
      }
      return rejectWithValue('创建内容失败，请稍后再试');
    }
  }
);

// 创建内容状态切片
const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearCurrentContent: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取内容列表
    builder
      .addCase(fetchContents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContents.fulfilled, (state, action: PayloadAction<Content[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 获取单个内容
    builder
      .addCase(fetchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action: PayloadAction<Content>) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 创建内容
    builder
      .addCase(createContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContent.fulfilled, (state, action: PayloadAction<Content>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentContent, clearError } = contentSlice.actions;
export default contentSlice.reducer;
