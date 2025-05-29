import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/core/store';
import { usePluginManager } from '@/core/pluginManager';
import { PluginStatus } from '@/core/pluginManager/types';
import { LayoutDashboard, Activity, Package, Users, Settings } from 'lucide-react';

/**
 * 仪表盘视图
 * 显示系统概览和已加载插件的小部件
 */
const Dashboard = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { appInfo } = useSelector((state: RootState) => state.app);
  const { getWidgetsByPosition, getAllPlugins } = usePluginManager();

  // 获取仪表盘小部件
  const dashboardWidgets = getWidgetsByPosition('dashboard');
  const plugins = getAllPlugins();
  
  // 统计数据
  const stats = {
    totalPlugins: plugins.length,
    activePlugins: plugins.filter(p => p.status === PluginStatus.LOADED).length,
    errorPlugins: plugins.filter(p => p.status === PluginStatus.ERROR).length,
  };

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="bg-card rounded-lg shadow-sm p-6 border">
        <h1 className="text-2xl font-semibold flex items-center">
          <LayoutDashboard className="mr-2 h-7 w-7 text-primary" />
          欢迎使用多元插件化系统
        </h1>
        <p className="mt-2 text-muted-foreground">
          {currentUser 
            ? `你好，${currentUser.username}！今天是 ${new Date().toLocaleDateString('zh-CN')}，祝您使用愉快。`
            : '请登录以获取完整功能。'}
        </p>
        {appInfo && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>系统版本: {appInfo.version}</p>
            <p>环境: {appInfo.environment}</p>
            <p>API版本: {appInfo.apiVersion}</p>
          </div>
        )}
      </div>

      {/* 系统状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">总插件数</p>
              <p className="text-2xl font-semibold">{stats.totalPlugins}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">已激活插件</p>
              <p className="text-2xl font-semibold">{stats.activePlugins}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">当前用户</p>
              <p className="text-2xl font-semibold">{currentUser ? 1 : 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm p-5 border">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400">
              <Settings className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">系统状态</p>
              <p className="text-2xl font-semibold">正常</p>
            </div>
          </div>
        </div>
      </div>

      {/* 插件小部件 */}
      {dashboardWidgets.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">插件小部件</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardWidgets.map((widget) => (
              <div 
                key={widget.id}
                className="bg-card rounded-lg shadow-sm p-4 border col-span-1"
                style={{ gridColumn: `span ${widget.size || 1}` }}
              >
                <h3 className="text-lg font-medium mb-3">{widget.title}</h3>
                <div className="plugin-container">
                  <widget.component />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm p-6 border text-center">
          <p className="text-muted-foreground">尚未加载任何小部件。请激活插件以查看更多功能。</p>
          <button 
            onClick={() => window.location.href = '/plugins'}
            className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            aria-label="管理插件"
            tabIndex={0}
          >
            管理插件
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
