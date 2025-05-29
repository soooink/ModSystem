/**
 * 内容列表组件
 * 显示所有内容并提供搜索、筛选功能
 */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FileText, Search, Plus, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { fetchContents } from '../store/contentSlice';
import type { Content } from '../store/contentSlice';

const ContentList = () => {
  const dispatch = useDispatch();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 加载内容列表
  useEffect(() => {
    const loadContents = async () => {
      try {
        setLoading(true);
        setError(null);
        // @ts-ignore - 忽略 Redux Thunk 的类型错误
        const result = await dispatch(fetchContents());
        
        if (result.meta.requestStatus === 'fulfilled') {
          setContents(result.payload);
        } else if (result.meta.requestStatus === 'rejected') {
          setError(result.payload || '加载内容失败');
        }
      } catch (error) {
        console.error('加载内容失败:', error);
        setError('加载内容失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    loadContents();
  }, [dispatch]);

  // 筛选内容
  const filteredContents = contents.filter(content => 
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center">
          <FileText className="mr-2 h-7 w-7 text-primary" />
          内容管理
        </h1>
        
        <Link 
          to="/plugins/content-manager/create"
          className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="创建新内容"
          tabIndex={0}
        >
          <Plus size={16} className="mr-1" />
          创建内容
        </Link>
      </div>
      
      {/* 搜索栏 */}
      <div className="bg-card rounded-lg shadow-sm p-4 border">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="搜索内容..."
            aria-label="搜索内容"
          />
        </div>
      </div>
      
      {/* 内容列表 */}
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={24} className="animate-spin text-primary mr-2" />
            <span>加载内容中...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              aria-label="重试"
              tabIndex={0}
            >
              重试
            </button>
          </div>
        ) : filteredContents.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredContents.map((content) => (
              <Link
                key={content.id}
                to={`/plugins/content-manager/view/${content.id}`}
                className="block p-4 hover:bg-muted/40 transition-colors group"
                aria-label={`查看内容：${content.title}`}
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium truncate">{content.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                      {content.body}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(content.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">没有找到内容</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm 
                ? `没有找到与 "${searchTerm}" 匹配的内容` 
                : '还没有创建任何内容'}
            </p>
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
                aria-label="清除搜索"
                tabIndex={0}
              >
                清除搜索
              </button>
            ) : (
              <Link 
                to="/plugins/content-manager/create"
                className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                aria-label="创建新内容"
                tabIndex={0}
              >
                创建第一个内容
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentList;
