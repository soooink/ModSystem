/**
 * 内容小部件
 * 显示在仪表盘上的最近内容列表
 */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FileText, Clock, ChevronRight } from 'lucide-react';
import { fetchContents } from '../store/contentSlice';
import type { Content } from '../store/contentSlice';

const ContentWidget = () => {
  const dispatch = useDispatch();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载最近内容
  useEffect(() => {
    const loadContents = async () => {
      try {
        setLoading(true);
        // @ts-ignore - 忽略 Redux Thunk 的类型错误
        const result = await dispatch(fetchContents());
        if (result.meta.requestStatus === 'fulfilled') {
          // 只显示最近的5条内容
          setContents(result.payload.slice(0, 5));
        }
      } catch (error) {
        console.error('加载内容失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContents();
  }, [dispatch]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {contents.length > 0 ? (
        <>
          <ul className="space-y-2">
            {contents.map((content) => (
              <li key={content.id} className="group">
                <Link 
                  to={`/plugins/content-manager/view/${content.id}`}
                  className="block p-2 hover:bg-muted rounded-md transition-colors"
                  aria-label={`查看内容：${content.title}`}
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-primary" />
                      <span className="font-medium truncate max-w-[180px]">{content.title}</span>
                    </div>
                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </div>
                  <div className="mt-1 flex items-center text-xs text-muted-foreground">
                    <Clock size={12} className="mr-1" />
                    <span>{formatDate(content.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="pt-2 border-t">
            <Link 
              to="/plugins/content-manager"
              className="text-primary hover:text-primary/80 text-sm flex items-center"
              aria-label="查看所有内容"
              tabIndex={0}
            >
              查看全部
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <FileText size={24} className="mx-auto mb-2 opacity-50" />
          <p>暂无内容</p>
          <Link 
            to="/plugins/content-manager/create"
            className="mt-2 inline-block text-primary hover:text-primary/80 text-sm"
            aria-label="创建内容"
            tabIndex={0}
          >
            创建新内容
          </Link>
        </div>
      )}
    </div>
  );
};

export default ContentWidget;
