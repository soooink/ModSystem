import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/core/store';
import { fetchCurrentUser } from '@/core/store/modules/userSlice';
import { fetchAppInfo } from '@/core/store/modules/appSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePluginManager } from '@/core/pluginManager';

/**
 * 主应用布局组件
 * 包含侧边栏、顶部导航和内容区域
 */
const Layout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const { settings } = useSelector((state: RootState) => state.app);
  const { sidebarCollapsed } = settings;
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { getAllPlugins } = usePluginManager();
  const [mounted, setMounted] = useState(false);

  // 响应式布局和主题初始化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    setMounted(true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 加载用户信息和应用信息
  useEffect(() => {
    if (isAuthenticated) {
      // @ts-ignore - 忽略 Redux Thunk 的类型错误
      dispatch(fetchCurrentUser());
    }
    // @ts-ignore
    dispatch(fetchAppInfo());
  }, [dispatch, isAuthenticated]);

  // 切换移动端侧边栏
  const handleToggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // 插件数据
  const plugins = getAllPlugins();
  const activePluginsCount = plugins.filter(
    p => p.status === 'loaded'
  ).length;

  return (
    <div className="relative flex min-h-screen">
      {/* 侧边栏 - 桌面版 */}
      <div 
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* 侧边栏 - 移动版 */}
      {mounted && isMobile && (
        <>
          <div 
            className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
              mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={handleToggleMobileSidebar}
            aria-hidden="true"
          />
          <div 
            className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out transform ${
              mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar collapsed={false} onClose={handleToggleMobileSidebar} />
          </div>
        </>
      )}

      {/* 主内容区域 */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isMobile ? 'ml-0' : (sidebarCollapsed ? 'md:ml-16' : 'md:ml-64')
        }`}
      >
        <Header 
          onToggleSidebar={handleToggleMobileSidebar} 
          isMobile={isMobile}
          activePluginsCount={activePluginsCount}
        />
        
        <main className="flex-1 overflow-auto p-4 bg-muted/5">
          <div className="container mx-auto py-4">
            <Outlet />
          </div>
        </main>

        <footer className="py-3 px-4 text-center text-sm text-muted-foreground border-t bg-card/50">
          <p>多元插件化系统 © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
