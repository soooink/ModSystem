/**
 * 插件路由管理
 * 负责动态加载和管理插件路由
 */
import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { usePluginManager } from '../pluginManager';
import { PluginStatus } from '../pluginManager/types';

// 加载中组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    <span className="ml-3 text-lg">加载插件中...</span>
  </div>
);

// 插件错误组件
const PluginError = ({ error }: { error: string }) => (
  <div className="flex flex-col items-center justify-center h-full w-full p-4">
    <div className="text-destructive text-2xl mb-2">插件加载失败</div>
    <div className="text-muted-foreground">{error}</div>
  </div>
);

/**
 * 插件路由组件
 * 负责动态渲染插件路由
 */
const PluginRoutes = () => {
  const { plugins } = usePluginManager();
  const [routes, setRoutes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // 收集所有已加载插件的路由
    const pluginRoutes: React.ReactNode[] = [];
    
    plugins.forEach((registration, pluginId) => {
      // 只处理已加载的插件
      if (registration.status === PluginStatus.LOADED && registration.plugin.routes) {
        // 遍历插件路由
        registration.plugin.routes.forEach((route, index) => {
          // 创建带有懒加载的路由
          const RouteComponent = route.element 
            ? lazy(() => Promise.resolve({ default: () => route.element }))
            : null;
          
          if (RouteComponent) {
            pluginRoutes.push(
              <Route
                key={`${pluginId}-route-${index}`}
                path={route.path}
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <RouteComponent />
                  </Suspense>
                }
              />
            );
          }
          
          // 处理子路由
          if (route.children && route.children.length > 0) {
            route.children.forEach((childRoute, childIndex) => {
              const ChildRouteComponent = childRoute.element 
                ? lazy(() => Promise.resolve({ default: () => childRoute.element }))
                : null;
              
              if (ChildRouteComponent) {
                pluginRoutes.push(
                  <Route
                    key={`${pluginId}-route-${index}-${childIndex}`}
                    path={`${route.path}/${childRoute.path}`}
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ChildRouteComponent />
                      </Suspense>
                    }
                  />
                );
              }
            });
          }
        });
      } else if (registration.status === PluginStatus.ERROR) {
        // 为错误状态的插件创建错误路由
        pluginRoutes.push(
          <Route
            key={`${pluginId}-error`}
            path={`/plugins/${pluginId}/*`}
            element={<PluginError error={registration.error || '未知错误'} />}
          />
        );
      }
    });
    
    setRoutes(pluginRoutes);
  }, [plugins]);

  return (
    <Routes>
      {routes}
      {/* 捕获所有未匹配的插件路径 */}
      <Route path="/plugins/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PluginRoutes;
