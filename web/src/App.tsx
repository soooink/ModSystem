/**
 * 应用主组件
 * 集成插件管理器和路由系统
 */
import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './core/store';
import { PluginManagerProvider } from './core/pluginManager';
import AppRouter from './core/router';

// 导入示例插件
import ContentManagerPlugin from './plugins/pluginA';
import UserStatsPlugin from './plugins/pluginB';

const App = () => {
  const { settings } = useSelector((state: RootState) => state.app);
  const [initialPlugins, setInitialPlugins] = useState([]);
  const [isReady, setIsReady] = useState(false);

  // 设置主题
  useEffect(() => {
    const { theme } = settings;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);

    // 监听系统主题变化
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  // 初始化插件
  useEffect(() => {
    // 在实际应用中，这里会从API获取可用插件列表
    // 这里为了演示，直接使用预定义的示例插件
    setInitialPlugins([
      ContentManagerPlugin,
      UserStatsPlugin
    ]);
    
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">加载多元插件化系统...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <PluginManagerProvider initialPlugins={initialPlugins}>
        <AppRouter />
      </PluginManagerProvider>
    </BrowserRouter>
  );
};

export default App;
