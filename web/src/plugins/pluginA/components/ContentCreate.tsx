/**
 * 内容创建组件
 * 用于创建新的内容
 */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { createContent, clearError } from '../store/contentSlice';

const ContentCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 处理表单变化
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除错误提示
    if (error) {
      setError(null);
      dispatch(clearError());
    }
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.title.trim()) {
      setError('标题不能为空');
      return;
    }
    
    if (!formData.body.trim()) {
      setError('内容不能为空');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // @ts-ignore - 忽略 Redux Thunk 的类型错误
      const result = await dispatch(createContent(formData));
      
      if (result.meta.requestStatus === 'fulfilled') {
        // 创建成功，跳转到内容列表
        navigate('/plugins/content-manager');
      } else if (result.meta.requestStatus === 'rejected') {
        setError(result.payload || '创建内容失败');
      }
    } catch (error) {
      console.error('创建内容失败:', error);
      setError('创建内容失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  // 取消创建
  const handleCancel = () => {
    if (formData.title.trim() || formData.body.trim()) {
      if (window.confirm('确定要取消吗？已输入的内容将会丢失。')) {
        navigate('/plugins/content-manager');
      }
    } else {
      navigate('/plugins/content-manager');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 导航栏 */}
      <div className="flex items-center justify-between">
        <Link
          to="/plugins/content-manager"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="返回内容列表"
          tabIndex={0}
        >
          <ArrowLeft size={16} className="mr-1" />
          返回列表
        </Link>
        
        <h1 className="text-xl font-semibold">创建新内容</h1>
        
        <div className="w-24">
          {/* 占位元素，保持导航栏三列布局对称 */}
        </div>
      </div>
      
      {/* 创建表单 */}
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                标题 <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="输入内容标题"
                aria-label="内容标题"
                required
              />
            </div>
            
            <div>
              <label htmlFor="body" className="block text-sm font-medium mb-1">
                正文内容 <span className="text-destructive">*</span>
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleChange}
                rows={12}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="输入正文内容..."
                aria-label="正文内容"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
              disabled={loading}
              aria-label="取消"
              tabIndex={0}
            >
              <X size={16} className="mr-1" />
              取消
            </button>
            
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              disabled={loading}
              aria-label="保存内容"
              tabIndex={0}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  保存内容
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentCreate;
