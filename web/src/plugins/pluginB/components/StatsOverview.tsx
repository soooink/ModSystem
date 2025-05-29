/**
 * 统计概览组件
 * 显示用户活动的综合统计信息
 */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { BarChart, Users, LogIn, FileText, RefreshCw, Activity, Loader2 } from 'lucide-react';
import { fetchStats } from '../store/statsSlice';
import type { StatsData, UserActivity } from '../store/statsSlice';

const StatsOverview = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // @ts-ignore - 忽略 Redux Thunk 的类型错误
        const result = await dispatch(fetchStats());
        
        if (result.meta.requestStatus === 'fulfilled') {
          setStats(result.payload);
        } else if (result.meta.requestStatus === 'rejected') {
          setError(result.payload || '获取统计数据失败');
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        setError('获取统计数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [dispatch]);

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 刷新统计数据
  const handleRefresh = () => {
    loadStats();
  };

  // 将用户活动对象转换为数组并排序
  const getUserActivitiesList = () => {
    if (!stats) return [];
    
    return Object.entries(stats.userActivities)
      .map(([userId, activity]) => ({
        userId,
        ...activity
      }))
      .sort((a, b) => b.logins - a.logins); // 按登录次数降序排序
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={24} className="animate-spin text-primary mr-2" />
        <span>加载统计数据中...</span>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
        <div className="text-destructive mb-2">{error}</div>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="重试"
          tabIndex={0}
        >
          重试
        </button>
      </div>
    );
  }

  // 未找到数据状态
  if (!stats) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
        <BarChart size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">未找到统计数据</h3>
        <p className="mt-2 text-muted-foreground">
          目前尚无用户活动统计数据
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="刷新"
          tabIndex={0}
        >
          刷新
        </button>
      </div>
    );
  }

  // 用户活动列表
  const userActivities = getUserActivitiesList();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center">
          <BarChart className="mr-2 h-7 w-7 text-primary" />
          用户统计概览
        </h1>
        
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="刷新统计数据"
          tabIndex={0}
        >
          <RefreshCw size={16} className="mr-1" />
          刷新
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">活跃用户数</p>
              <p className="text-2xl font-semibold">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
              <LogIn className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">总登录次数</p>
              <p className="text-2xl font-semibold">{stats.totalLogins}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">内容创建数</p>
              <p className="text-2xl font-semibold">
                {userActivities.reduce((sum, user) => sum + user.contentCreated, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 最后更新时间 */}
      <div className="text-sm text-muted-foreground">
        最后更新时间: {formatDate(stats.lastUpdated)}
      </div>

      {/* 用户活动表格 */}
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium flex items-center">
            <Activity size={18} className="mr-2 text-primary" />
            用户活动详情
          </h2>
        </div>
        
        {userActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    用户ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    登录次数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    上次登录
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    内容创建数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {userActivities.map((user) => (
                  <tr key={user.userId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User size={14} className="text-muted-foreground" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium">{user.username || '未知用户'}</div>
                          <div className="text-xs text-muted-foreground">{user.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">{user.logins}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">{formatDate(user.lastLogin)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">{user.contentCreated}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Link
                        to={`/plugins/user-stats/activity?userId=${user.userId}`}
                        className="text-primary hover:text-primary/80"
                        aria-label={`查看${user.username || '用户'}的活动详情`}
                        tabIndex={0}
                      >
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users size={48} className="mx-auto opacity-30 mb-4" />
            <p>暂无用户活动数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsOverview;
