import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/core/store';
import { fetchPlugins, activatePlugin, deactivatePlugin } from '@/core/store/modules/appSlice';
import { usePluginManager } from '@/core/pluginManager';
import { PluginStatus } from '@/core/pluginManager/types';
import { Package, Check, X, AlertTriangle, RefreshCw, Search } from 'lucide-react';

const PluginManager = () => {
  const dispatch = useDispatch();
  const { plugins, loading } = useSelector((state: RootState) => state.app);
  const { getAllPlugins, loadPlugin, unloadPlugin } = usePluginManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // 加载插件列表
  useEffect(() => {
    // @ts-ignore - 忽略 Redux Thunk 的类型错误
    dispatch(fetchPlugins());
  }, [dispatch]);
  
  // 本地插件列表
  const localPlugins = getAllPlugins();
  
  // 合并后端和前端插件状态
  const mergedPlugins = plugins.map(plugin => {
    const localPlugin = localPlugins.find(p => p.plugin.id === plugin.id);
    return {
      ...plugin,
      frontendStatus: localPlugin?.status || null
    };
  });
  
  // 处理搜索和筛选
  const filteredPlugins = mergedPlugins.filter(plugin => {
    const matchesSearch = 
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && plugin.enabled;
    if (filterStatus === 'inactive') return matchesSearch && !plugin.enabled;
    
    return matchesSearch;
  });
  
  // 激活插件
  const handleActivatePlugin = async (pluginId: string) => {
    try {
      // @ts-ignore
      await dispatch(activatePlugin(pluginId));
      // 加载前端插件
      const plugin = localPlugins.find(p => p.plugin.id === pluginId);
      if (plugin) {
        await loadPlugin(pluginId);
      }
    } catch (error) {
      console.error('激活插件失败:', error);
    }
  };
  
  // 停用插件
  const handleDeactivatePlugin = async (pluginId: string) => {
    try {
      // @ts-ignore
      await dispatch(deactivatePlugin(pluginId));
      // 卸载前端插件
      const plugin = localPlugins.find(p => p.plugin.id === pluginId);
      if (plugin) {
        await unloadPlugin(pluginId);
      }
    } catch (error) {
      console.error('停用插件失败:', error);
    }
  };
  
  // 刷新插件列表
  const handleRefreshPlugins = () => {
    // @ts-ignore
    dispatch(fetchPlugins());
  };
  
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Package className="mr-2 h-7 w-7 text-primary" />
            插件管理
          </h1>
          <p className="mt-1 text-muted-foreground">
            管理和配置系统插件，动态扩展应用功能
          </p>
        </div>
        
        <button
          onClick={handleRefreshPlugins}
          className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          disabled={loading}
          aria-label="刷新插件列表"
          tabIndex={0}
        >
          <RefreshCw size={16} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>
      
      {/* 搜索和筛选栏 */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-card p-4 rounded-lg border">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="搜索插件..."
            aria-label="搜索插件"
          />
        </div>
        
        <div className="flex space-x-2 sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            aria-label="筛选插件状态"
          >
            <option value="all">所有插件</option>
            <option value="active">已激活</option>
            <option value="inactive">未激活</option>
          </select>
        </div>
      </div>
      
      {/* 插件列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3 text-lg">加载插件中...</span>
          </div>
        ) : filteredPlugins.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredPlugins.map((plugin) => (
              <div 
                key={plugin.id}
                className="bg-card rounded-lg shadow-sm p-5 border hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">{plugin.name}</h3>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        v{plugin.version}
                      </span>
                      {plugin.enabled ? (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 flex items-center">
                          <Check size={12} className="mr-1" />
                          已激活
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 flex items-center">
                          <X size={12} className="mr-1" />
                          未激活
                        </span>
                      )}
                      
                      {/* 前端状态 */}
                      {plugin.frontendStatus === PluginStatus.ERROR && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center">
                          <AlertTriangle size={12} className="mr-1" />
                          前端错误
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-2 text-muted-foreground">{plugin.description}</p>
                    
                    {plugin.dependencies && plugin.dependencies.length > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">依赖项: </span>
                        {plugin.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {plugin.enabled ? (
                      <button
                        onClick={() => handleDeactivatePlugin(plugin.id)}
                        className="px-3 py-1.5 border border-destructive text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                        aria-label={`停用${plugin.name}插件`}
                        tabIndex={0}
                      >
                        停用
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivatePlugin(plugin.id)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        aria-label={`激活${plugin.name}插件`}
                        tabIndex={0}
                      >
                        激活
                      </button>
                    )}
                    
                    <button
                      className="px-3 py-1.5 border border-input text-foreground rounded-md hover:bg-muted transition-colors"
                      aria-label={`配置${plugin.name}插件`}
                      tabIndex={0}
                    >
                      配置
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm p-8 border text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">未找到匹配的插件</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm 
                ? `没有找到与 "${searchTerm}" 匹配的插件` 
                : '没有可用的插件或未满足筛选条件'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                aria-label="清除搜索"
                tabIndex={0}
              >
                清除搜索
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginManager;
