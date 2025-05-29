/**
 * 前端插件管理器
 * 负责加载、注册和管理前端插件
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plugin, 
  PluginRegistration, 
  PluginStatus, 
  PluginEvent,
  PluginLoadOptions,
  PluginMenuItem,
  PluginWidget
} from './types';

// 默认插件加载选项
const defaultLoadOptions: PluginLoadOptions = {
  autoInitialize: true,
  autoRegisterRoutes: true,
  autoRegisterStore: true
};

// 创建插件管理器上下文
interface PluginManagerContextType {
  // 已注册的插件
  plugins: Map<string, PluginRegistration>;
  // 插件菜单项
  menuItems: PluginMenuItem[];
  // 插件小部件
  widgets: Record<string, PluginWidget[]>;
  // 注册插件
  registerPlugin: (plugin: Plugin, options?: PluginLoadOptions) => Promise<void>;
  // 加载插件
  loadPlugin: (pluginId: string) => Promise<void>;
  // 卸载插件
  unloadPlugin: (pluginId: string) => Promise<void>;
  // 获取插件
  getPlugin: (pluginId: string) => PluginRegistration | undefined;
  // 获取所有插件
  getAllPlugins: () => PluginRegistration[];
  // 是否已加载插件
  isPluginLoaded: (pluginId: string) => boolean;
  // 是否已注册插件
  isPluginRegistered: (pluginId: string) => boolean;
  // 获取指定位置的小部件
  getWidgetsByPosition: (position: string) => PluginWidget[];
  // 刷新插件列表
  refreshPlugins: () => Promise<void>;
}

// 创建插件管理器上下文
const PluginManagerContext = createContext<PluginManagerContextType | undefined>(undefined);

// 插件管理器提供者组件
interface PluginManagerProviderProps {
  children: ReactNode;
  // 初始插件列表
  initialPlugins?: Plugin[];
}

export const PluginManagerProvider = ({ children, initialPlugins = [] }: PluginManagerProviderProps) => {
  // 插件注册表
  const [plugins, setPlugins] = useState<Map<string, PluginRegistration>>(new Map());
  // 菜单项缓存
  const [menuItems, setMenuItems] = useState<PluginMenuItem[]>([]);
  // 小部件缓存
  const [widgets, setWidgets] = useState<Record<string, PluginWidget[]>>({});
  // 导航钩子
  const navigate = useNavigate();

  // 事件监听器
  const [eventListeners] = useState<Map<PluginEvent, Function[]>>(new Map());

  // 注册事件监听器
  const addEventListener = (event: PluginEvent, callback: Function) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, []);
    }
    eventListeners.get(event)?.push(callback);
  };

  // 触发事件
  const dispatchEvent = (event: PluginEvent, data: any) => {
    if (eventListeners.has(event)) {
      eventListeners.get(event)?.forEach(callback => callback(data));
    }
  };

  // 注册插件
  const registerPlugin = async (plugin: Plugin, options?: PluginLoadOptions) => {
    const mergedOptions = { ...defaultLoadOptions, ...options };
    
    // 检查插件ID
    if (!plugin.id) {
      console.error('插件ID不能为空');
      return;
    }
    
    // 检查插件是否已注册
    if (plugins.has(plugin.id)) {
      console.warn(`插件 ${plugin.id} 已经注册`);
      return;
    }
    
    // 检查依赖
    if (plugin.dependencies && plugin.dependencies.length > 0) {
      for (const depId of plugin.dependencies) {
        if (!plugins.has(depId) || plugins.get(depId)?.status !== PluginStatus.LOADED) {
          console.error(`无法注册插件 ${plugin.id}：依赖 ${depId} 未加载`);
          return;
        }
      }
    }
    
    // 创建插件注册信息
    const registration: PluginRegistration = {
      plugin,
      status: PluginStatus.REGISTERED
    };
    
    // 更新插件注册表
    setPlugins(prevPlugins => {
      const newPlugins = new Map(prevPlugins);
      newPlugins.set(plugin.id, registration);
      return newPlugins;
    });
    
    // 触发注册事件
    dispatchEvent(PluginEvent.REGISTERED, { pluginId: plugin.id });
    
    // 如果配置了自动初始化，则立即加载插件
    if (mergedOptions.autoInitialize) {
      await loadPlugin(plugin.id);
    }
  };

  // 加载插件
  const loadPlugin = async (pluginId: string) => {
    // 获取插件注册信息
    const registration = plugins.get(pluginId);
    if (!registration) {
      console.error(`插件 ${pluginId} 未注册`);
      return;
    }
    
    // 检查插件状态
    if (registration.status === PluginStatus.LOADED) {
      console.warn(`插件 ${pluginId} 已经加载`);
      return;
    }
    
    try {
      // 更新插件状态为加载中
      setPlugins(prevPlugins => {
        const newPlugins = new Map(prevPlugins);
        newPlugins.set(pluginId, { 
          ...registration, 
          status: PluginStatus.LOADING 
        });
        return newPlugins;
      });
      
      // 触发加载中事件
      dispatchEvent(PluginEvent.LOADING, { pluginId });
      
      // 加载插件
      if (registration.plugin.load) {
        await registration.plugin.load();
      }
      
      // 初始化插件
      if (registration.plugin.initialize) {
        await registration.plugin.initialize();
      }
      
      // 更新插件状态为已加载
      setPlugins(prevPlugins => {
        const newPlugins = new Map(prevPlugins);
        newPlugins.set(pluginId, { 
          ...registration, 
          status: PluginStatus.LOADED,
          loadedAt: new Date()
        });
        return newPlugins;
      });
      
      // 更新菜单项
      if (registration.plugin.menuItems && registration.plugin.menuItems.length > 0) {
        setMenuItems(prevItems => {
          // 移除该插件之前的菜单项
          const filteredItems = prevItems.filter(item => 
            !item.id.startsWith(`${pluginId}:`)
          );
          
          // 添加新的菜单项，并确保ID包含插件前缀
          const newItems = registration.plugin.menuItems?.map(item => ({
            ...item,
            id: item.id.includes(':') ? item.id : `${pluginId}:${item.id}`
          })) || [];
          
          return [...filteredItems, ...newItems].sort((a, b) => 
            (a.order || 0) - (b.order || 0)
          );
        });
      }
      
      // 更新小部件
      if (registration.plugin.widgets && registration.plugin.widgets.length > 0) {
        setWidgets(prevWidgets => {
          const newWidgets = { ...prevWidgets };
          
          // 移除该插件之前的小部件
          Object.keys(newWidgets).forEach(position => {
            newWidgets[position] = newWidgets[position].filter(
              widget => !widget.id.startsWith(`${pluginId}:`)
            );
          });
          
          // 添加新的小部件，按位置分组
          registration.plugin.widgets?.forEach(widget => {
            const widgetWithPrefix = {
              ...widget,
              id: widget.id.includes(':') ? widget.id : `${pluginId}:${widget.id}`
            };
            
            if (!newWidgets[widget.position]) {
              newWidgets[widget.position] = [];
            }
            
            newWidgets[widget.position].push(widgetWithPrefix);
            
            // 按顺序排序
            newWidgets[widget.position].sort((a, b) => 
              (a.order || 0) - (b.order || 0)
            );
          });
          
          return newWidgets;
        });
      }
      
      // 触发已加载事件
      dispatchEvent(PluginEvent.LOADED, { pluginId });
      
    } catch (error) {
      console.error(`加载插件 ${pluginId} 失败:`, error);
      
      // 更新插件状态为错误
      setPlugins(prevPlugins => {
        const newPlugins = new Map(prevPlugins);
        newPlugins.set(pluginId, { 
          ...registration, 
          status: PluginStatus.ERROR,
          error: error instanceof Error ? error.message : String(error)
        });
        return newPlugins;
      });
      
      // 触发错误事件
      dispatchEvent(PluginEvent.ERROR, { 
        pluginId, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  };

  // 卸载插件
  const unloadPlugin = async (pluginId: string) => {
    // 获取插件注册信息
    const registration = plugins.get(pluginId);
    if (!registration) {
      console.error(`插件 ${pluginId} 未注册`);
      return;
    }
    
    // 检查插件状态
    if (registration.status !== PluginStatus.LOADED) {
      console.warn(`插件 ${pluginId} 未加载或状态异常`);
      return;
    }
    
    // 检查其他插件是否依赖该插件
    const dependentPlugins: string[] = [];
    plugins.forEach((reg, id) => {
      if (id !== pluginId && 
          reg.plugin.dependencies && 
          reg.plugin.dependencies.includes(pluginId) &&
          reg.status === PluginStatus.LOADED) {
        dependentPlugins.push(id);
      }
    });
    
    if (dependentPlugins.length > 0) {
      console.error(`无法卸载插件 ${pluginId}：以下插件依赖它: ${dependentPlugins.join(', ')}`);
      return;
    }
    
    try {
      // 调用插件的卸载方法
      if (registration.plugin.unload) {
        await registration.plugin.unload();
      }
      
      // 移除菜单项
      setMenuItems(prevItems => 
        prevItems.filter(item => !item.id.startsWith(`${pluginId}:`))
      );
      
      // 移除小部件
      setWidgets(prevWidgets => {
        const newWidgets = { ...prevWidgets };
        Object.keys(newWidgets).forEach(position => {
          newWidgets[position] = newWidgets[position].filter(
            widget => !widget.id.startsWith(`${pluginId}:`)
          );
        });
        return newWidgets;
      });
      
      // 更新插件状态为已卸载
      setPlugins(prevPlugins => {
        const newPlugins = new Map(prevPlugins);
        newPlugins.set(pluginId, { 
          ...registration, 
          status: PluginStatus.UNLOADED 
        });
        return newPlugins;
      });
      
      // 触发已卸载事件
      dispatchEvent(PluginEvent.UNLOADED, { pluginId });
      
    } catch (error) {
      console.error(`卸载插件 ${pluginId} 失败:`, error);
      
      // 更新插件状态为错误
      setPlugins(prevPlugins => {
        const newPlugins = new Map(prevPlugins);
        newPlugins.set(pluginId, { 
          ...registration, 
          status: PluginStatus.ERROR,
          error: error instanceof Error ? error.message : String(error)
        });
        return newPlugins;
      });
      
      // 触发错误事件
      dispatchEvent(PluginEvent.ERROR, { 
        pluginId, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  };

  // 获取插件
  const getPlugin = (pluginId: string) => plugins.get(pluginId);

  // 获取所有插件
  const getAllPlugins = () => Array.from(plugins.values());

  // 检查插件是否已加载
  const isPluginLoaded = (pluginId: string) => 
    plugins.has(pluginId) && plugins.get(pluginId)?.status === PluginStatus.LOADED;

  // 检查插件是否已注册
  const isPluginRegistered = (pluginId: string) => plugins.has(pluginId);

  // 获取特定位置的小部件
  const getWidgetsByPosition = (position: string) => widgets[position] || [];

  // 刷新插件列表（从API获取）
  const refreshPlugins = async () => {
    try {
      // 在实际应用中，这里会从后端API获取可用插件列表
      console.log('刷新插件列表');
      // 模拟API调用
      // const response = await fetch('/api/plugins');
      // const availablePlugins = await response.json();
      // 处理获取到的插件...
    } catch (error) {
      console.error('刷新插件列表失败:', error);
    }
  };

  // 初始化加载初始插件
  useEffect(() => {
    if (initialPlugins.length > 0) {
      initialPlugins.forEach(plugin => {
        registerPlugin(plugin);
      });
    }
  }, []);

  // 创建上下文值
  const contextValue: PluginManagerContextType = {
    plugins,
    menuItems,
    widgets,
    registerPlugin,
    loadPlugin,
    unloadPlugin,
    getPlugin,
    getAllPlugins,
    isPluginLoaded,
    isPluginRegistered,
    getWidgetsByPosition,
    refreshPlugins
  };

  return (
    <PluginManagerContext.Provider value={contextValue}>
      {children}
    </PluginManagerContext.Provider>
  );
};

// 自定义钩子，用于组件访问插件管理器
export const usePluginManager = () => {
  const context = useContext(PluginManagerContext);
  if (context === undefined) {
    throw new Error('usePluginManager必须在PluginManagerProvider内部使用');
  }
  return context;
};

// 插件路由组件
export const PluginRoute = ({ pluginId, path }: { pluginId: string, path: string }) => {
  const { getPlugin, isPluginLoaded } = usePluginManager();
  const navigate = useNavigate();
  
  useEffect(() => {
    const plugin = getPlugin(pluginId);
    if (!plugin || !isPluginLoaded(pluginId)) {
      console.error(`插件 ${pluginId} 未加载或不存在`);
      navigate('/');
    }
  }, [pluginId, isPluginLoaded, getPlugin, navigate]);
  
  const plugin = getPlugin(pluginId);
  if (!plugin || !isPluginLoaded(pluginId)) {
    return null;
  }
  
  const PluginComponent = plugin.plugin.component;
  return PluginComponent ? <PluginComponent /> : null;
};
