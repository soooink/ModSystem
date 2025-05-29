/**
 * 用户活动详情组件
 * 展示单个用户的详细活动统计和历史记录
 */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Clock, FileText, Activity, Loader2 } from 'lucide-react';
import { fetchStats } from '../store/statsSlice';
import type { StatsData, UserActivity as UserActivityType } from '../store/statsSlice';

const UserActivity = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get('userId');
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [userData, setUserData] = useState<UserActivityType | null>(null);
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
          
          // 获取指定用户的数据
          if (userId && result.payload.userActivities[userId]) {
            setUserData({
              userId,
              ...result.payload.userActivities[userId]
            });
          } else if (userId) {
            setError(`找不到用户 ID: ${userId} 的活动数据`);
          } else {
            setError('未指定用户ID');
          }
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
  }, [dispatch, userId]);
  
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
  
  // 模拟活动历史数据（实际应从API获取）
  const activityHistory = [
    { 
      type: 'login', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), 
      details: '用户登录' 
    },
    { 
      type: 'content', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(), 
      details: '创建内容 "示例内容1"' 
    },
    { 
      type: 'login', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
      details: '用户登录' 
    },
    { 
      type: 'content', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), 
      details: '创建内容 "示例内容2"' 
    },
    { 
      type: 'login', 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
      details: '用户登录' 
    }
  ];
  
  // 获取活动图标
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Clock size={16} className="text-blue-500" />;
      case 'content':
        return <FileText size={16} className="text-green-500" />;
      default:
        return <Activity size={16} className="text-primary" />;
    }
  };
  
  // 加载中状态
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={24} className="animate-spin text-primary mr-2" />
        <span>加载用户活动数据中...</span>
      </div>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link
            to="/plugins/user-stats"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="返回统计概览"
            tabIndex={0}
          >
            <ArrowLeft size={16} className="mr-1" />
            返回统计概览
          </Link>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
          <div className="text-destructive mb-2">{error}</div>
          <button
            onClick={() => navigate('/plugins/user-stats')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            aria-label="返回统计概览"
            tabIndex={0}
          >
            返回统计概览
          </button>
        </div>
      </div>
    );
  }
  
  // 未找到用户数据
  if (!userData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link
            to="/plugins/user-stats"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="返回统计概览"
            tabIndex={0}
          >
            <ArrowLeft size={16} className="mr-1" />
            返回统计概览
          </Link>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
          <User size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">未找到用户数据</h3>
          <p className="mt-2 text-muted-foreground">
            找不到指定用户的活动数据
          </p>
          <button
            onClick={() => navigate('/plugins/user-stats')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            aria-label="返回统计概览"
            tabIndex={0}
          >
            返回统计概览
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 导航返回 */}
      <div className="flex items-center">
        <Link
          to="/plugins/user-stats"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="返回统计概览"
          tabIndex={0}
        >
          <ArrowLeft size={16} className="mr-1" />
          返回统计概览
        </Link>
      </div>
      
      {/* 用户信息卡片 */}
      <div className="bg-card rounded-lg shadow-sm p-6 border">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={32} className="text-primary" />
          </div>
          
          <div className="ml-5">
            <h1 className="text-2xl font-semibold">
              {userData.username || '用户'} <span className="text-muted-foreground text-lg">#{userData.userId}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              上次活动时间: {formatDate(userData.lastLogin)}
            </p>
          </div>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">登录次数</p>
              <p className="text-2xl font-semibold">{userData.logins}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">创建内容数</p>
              <p className="text-2xl font-semibold">{userData.contentCreated}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 活动历史时间线 */}
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium flex items-center">
            <Activity size={18} className="mr-2 text-primary" />
            活动历史
          </h2>
        </div>
        
        <div className="divide-y divide-border">
          {activityHistory.map((activity, index) => (
            <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start">
                <div className="mt-0.5 mr-3">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{activity.details}</p>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Calendar size={12} className="mr-1" />
                    <span>{formatDate(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 text-center text-sm text-muted-foreground border-t">
          显示最近 5 条活动记录
        </div>
      </div>
    </div>
  );
};

export default UserActivity;
