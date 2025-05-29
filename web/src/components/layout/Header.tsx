import { useDispatch, useSelector } from 'react-redux';
import { Menu, Sun, Moon, User, LogOut } from 'lucide-react';
import { RootState, AppDispatch } from '@/core/store';
import { logout } from '@/core/store/modules/userSlice';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/language-switcher';

interface HeaderProps {
  onToggleSidebar: () => void;
  isMobile: boolean;
  activePluginsCount: number;
}

const Header = ({ onToggleSidebar, activePluginsCount }: HeaderProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const isDarkTheme = document.documentElement.classList.contains('dark');
  
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧菜单按钮和标题 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-9 w-9"
              aria-label="切换侧边栏"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {activePluginsCount > 0 && (
              <div className="text-sm text-muted-foreground">
                {t('activePlugins', { count: activePluginsCount })}
              </div>
            )}
          </div>
          
          {/* 右侧操作区 */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            {/* 主题切换 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
              aria-label="切换主题"
            >
              {isDarkTheme ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {/* 用户菜单 */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="用户菜单"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
