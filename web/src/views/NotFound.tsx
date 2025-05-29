import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * 404页面
 * 当路由不存在时显示
 */
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      
      <div className="mt-4 text-2xl font-semibold">页面未找到</div>
      
      <p className="mt-2 text-muted-foreground max-w-md">
        您访问的页面不存在或已被移除。这可能是因为URL输入错误或者链接已过期。
      </p>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          aria-label="返回首页"
          tabIndex={0}
        >
          <Home size={18} />
          返回首页
        </Link>
        
        <button 
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-input bg-card text-foreground rounded-md hover:bg-muted transition-colors"
          aria-label="返回上一页"
          tabIndex={0}
        >
          <ArrowLeft size={18} />
          返回上一页
        </button>
      </div>
    </div>
  );
};

export default NotFound;
