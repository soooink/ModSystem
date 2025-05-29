import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/core/store';
import { usePluginManager } from '@/core/pluginManager';
import { 
  LayoutDashboard, 
  Settings, 
  Package, 
  User, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ collapsed = false, onClose }: SidebarProps) => {
  const location = useLocation();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { menuItems } = usePluginManager();
  
  // 核心菜单项
  const coreMenuItems = useMemo(() => [
    {
      path: '/',
      label: '仪表盘',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/plugins',
      label: '插件管理',
      icon: <Package size={20} />,
    },
    {
      path: '/settings',
      label: '系统设置',
      icon: <Settings size={20} />,
    },
  ], []);

  // 判断菜单项是否激活
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* 侧边栏头部 */}
      <div className="p-4 border-b flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          {!collapsed && <span className="font-semibold text-lg">多元系统</span>}
        </Link>
        
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* 用户信息 */}
      <div className={cn("p-4 border-b", collapsed && "text-center")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {currentUser?.profile?.avatar ? (
              <img 
                src={currentUser.profile.avatar} 
                alt={currentUser.username}
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-medium truncate">
                {currentUser?.username || '未登录'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser?.role || '游客'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* 菜单区域 */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {/* 核心菜单 */}
          <nav className="px-2 space-y-1">
            {coreMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-foreground hover:bg-muted",
                  collapsed ? "justify-center" : "justify-between"
                )}
                aria-label={item.label}
              >
                <div className="flex items-center gap-3">
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: "h-5 w-5"
                  })}
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && isActive(item.path) && <ChevronRight className="h-4 w-4" />}
              </Link>
            ))}
          </nav>
          
          {/* 插件菜单 */}
          {menuItems.length > 0 && (
            <div className="mt-6">
              {!collapsed && (
                <h6 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  插件功能
                </h6>
              )}
              
              <nav className="px-2 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md transition-colors",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-foreground hover:bg-muted",
                      collapsed ? "justify-center" : "justify-between"
                    )}
                    aria-label={item.title}
                  >
                    <div className="flex items-center gap-3">
                      {React.cloneElement(item.icon ? item.icon as React.ReactElement : <Menu />, {
                        className: "h-5 w-5"
                      })}
                      {!collapsed && <span>{item.title}</span>}
                    </div>
                    {!collapsed && isActive(item.path) && <ChevronRight className="h-4 w-4" />}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
