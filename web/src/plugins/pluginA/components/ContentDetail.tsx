/**
 * 内容详情组件
 * 显示单个内容的详细信息
 */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Loader2, Edit, Trash2 } from 'lucide-react';
import { fetchContent } from '../store/contentSlice';
import type { Content } from '../store/contentSlice';

const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 加载内容详情
  useEffect(() => {
    const loadContent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // @ts-ignore - 忽略 Redux Thunk 的类型错误
        const result = await dispatch(fetchContent(Number(id)));
        
        if (result.meta.requestStatus === 'fulfilled') {
          setContent(result.payload);
        } else if (result.meta.requestStatus === 'rejected') {
          setError(result.payload || '获取内容详情失败');
        }
      } catch (error) {
        console.error('获取内容详情失败:', error);
        setError('获取内容详情失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [dispatch, id]);
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 处理删除按钮点击
  const handleDelete = () => {
    if (!content) return;
    
    if (window.confirm(`确定要删除内容 "${content.title}" 吗？此操作不可撤销。`)) {
      // 实际应用中应该调用删除API
      // 这里简单演示，直接返回列表页
      navigate('/plugins/content-manager');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={24} className="animate-spin text-primary mr-2" />
        <span>加载内容详情中...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
        <div className="text-destructive mb-2">{error}</div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            aria-label="重试"
            tabIndex={0}
          >
            重试
          </button>
          <Link
            to="/plugins/content-manager"
            className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
            aria-label="返回列表"
            tabIndex={0}
          >
            返回列表
          </Link>
        </div>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
        <div className="text-muted-foreground">内容不存在或已被删除</div>
        <Link
          to="/plugins/content-manager"
          className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="返回列表"
          tabIndex={0}
        >
          返回列表
        </Link>
      </div>
    );
  }
  
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
        
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center px-3 py-1.5 border border-input rounded-md hover:bg-muted transition-colors"
            aria-label="编辑内容"
            tabIndex={0}
          >
            <Edit size={16} className="mr-1" />
            编辑
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-1.5 border border-destructive text-destructive rounded-md hover:bg-destructive/10 transition-colors"
            aria-label="删除内容"
            tabIndex={0}
          >
            <Trash2 size={16} className="mr-1" />
            删除
          </button>
        </div>
      </div>
      
      {/* 内容详情卡片 */}
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-semibold">{content.title}</h1>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(content.createdAt)}</span>
            </div>
            
            {content.createdBy && (
              <div className="flex items-center">
                <User size={14} className="mr-1" />
                <span>作者: {content.createdBy}</span>
              </div>
            )}
          </div>
          
          <div className="border-t my-4"></div>
          
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-line">{content.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
