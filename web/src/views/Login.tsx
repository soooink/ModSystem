import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '@/core/store';
import { login, clearError } from '@/core/store/modules/userSlice';
import { User, Lock, ArrowLeft } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // 处理表单变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除错误提示
    if (error) {
      dispatch(clearError());
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // @ts-ignore - 忽略 Redux Thunk 的类型错误
      const result = await dispatch(login(formData));
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/');
      }
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-md border">
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            aria-label="返回首页"
            tabIndex={0}
          >
            <ArrowLeft size={16} className="mr-1" />
            返回首页
          </Link>
          
          <div className="mt-6 flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            登录多元插件化系统
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            使用您的账号访问完整的系统功能
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full bg-background border border-input rounded-md py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="your@example.com"
                  aria-label="邮箱地址"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full bg-background border border-input rounded-md py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                  aria-label="密码"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                aria-label="记住我"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                记住我
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="text-primary hover:text-primary/90">
                忘记密码?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={loading}
              aria-label="登录"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在登录...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              没有账号? <Link to="/register" className="text-primary hover:text-primary/90">注册新账号</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
