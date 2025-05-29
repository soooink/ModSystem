/**
 * 统计小部件
 * 显示在仪表盘上的用户活动统计
 */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Activity, ChevronRight, User, FileText } from 'lucide-react';
import { fetchPersonalStats } from '../store/statsSlice';
import type { UserActivity } from '../store/statsSlice';

const StatsWidget = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载个人统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        // @ts-ignore - 忽略 Redux Thunk 的类型错误
        const result = await dispatch(fetchPersonalStats());
        if (result.meta.requestStatus === 'fulfilled') {
          setStats(result.payload);
        }
      } catch (error) {
        console.error('加载统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [dispatch]);

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '从未登录';
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
    <div>
      {stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 rounded-md p-3">
              <div className="flex items-center text-muted-foreground mb-1">
                <User size={14} className="mr-1" />
                <span className="text-xs">登录次数</span>
              </div>
              <div className="text-2xl font-semibold">{stats.logins}</div>
            </div>
            
            <div className="bg-muted/30 rounded-md p-3">
              <div className="flex items-center text-muted-foreground mb-1">
                <FileText size={14} className="mr-1" />
                <span className="text-xs">创建内容</span>
              </div>
              <div className="text-2xl font-semibold">{stats.contentCreated}</div>
            </div>
          </div>
          
          <div className="text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>上次登录</span>
              <span>{formatDate(stats.lastLogin)}</span>
            </div>
          </div>
          
          <Link 
            to="/plugins/user-stats"
            className="mt-2 text-primary hover:text-primary/80 text-sm flex items-center"
            aria-label="查看详细统计"
            tabIndex={0}
          >
            查看详细统计
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <Activity size={24} className="mx-auto mb-2 opacity-50" />
          <p>暂无统计数据</p>
          <p className="text-xs mt-1">登录后可查看活动统计</p>
        </div>
      )}
    </div>
  );
};

export default StatsWidget;
