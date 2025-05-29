---
description: This is the front-end directory structure requirement.
---

This is the front-end directory structure requirement.
Node.js + Express + PostgreSQL + Prisma

Design principles (React scenario)
Modularity: Each plugin is an independent React module, including components, routes, states, etc.
Dynamic loading: Use React's dynamic import (React.lazy) and Suspense to load plugins on demand.
State management: Use Redux or Context API to support dynamic registration of plugin states.
Style isolation: Use CSS Modules or styled-components to isolate plugin styles.
Extensibility: Support hot-swappable plugins with minimal changes to the core code.

project-root/
├── src/
│   ├── assets/                   # 全局静态资源
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/              # 全局CSS（如reset.css）
│   ├── components/              # 公共组件（非插件）
│   │   ├── UI/                 # 通用UI组件
│   │   │   ├── Button/
│   │   │   └── Modal/
│   │   └── Business/           # 业务通用组件
│   ├── core/                   # 核心框架逻辑
│   │   ├── pluginManager/      # 插件管理器
│   │   │   ├── index.ts       # 插件注册、加载逻辑
│   │   │   └── types.ts       # 插件接口定义
│   │   ├── router/            # 路由管理
│   │   │   ├── index.tsx      # 核心路由
│   │   │   └── pluginRoutes.tsx # 动态插件路由
│   │   └── store/             # Redux状态管理
│   │       ├── modules/       # 核心状态模块
│   │       │   ├── userSlice.ts
│   │       │   └── appSlice.ts
│   │       ├── pluginStore.ts # 动态注册插件状态
│   │       └── index.ts       # Redux store配置
│   ├── plugins/                # 插件目录
│   │   ├── pluginA/           # 示例插件A
│   │   │   ├── components/    # 插件组件
│   │   │   │   ├── PluginAHome.tsx
│   │   │   │   └── PluginAWidget.tsx
│   │   │   ├── assets/        # 插件专属资源
│   │   │   │   └── styles/   # 插件CSS
│   │   │   ├── routes.tsx     # 插件路由
│   │   │   ├── store/         # 插件状态
│   │   │   │   └── pluginASlice.ts
│   │   │   ├── hooks/         # 插件自定义hooks
│   │   │   │   └── usePluginAData.ts
│   │   │   ├── index.tsx      # 插件入口
│   │   │   └── package.json   # 插件元信息
│   │   ├── pluginB/           # 示例插件B（类似结构）
│   │   └── ...                # 其他插件
│   ├── utils/                 # 工具函数
│   │   ├── api.ts            # API请求封装
│   │   └── helpers.ts        # 通用工具
│   ├── views/                 # 核心页面
│   │   ├── Home.tsx
│   │   └── Dashboard.tsx
│   ├── App.tsx                # 应用入口
│   ├── main.tsx               # React主入口
│   └── config/                # 配置文件
│       ├── pluginConfig.ts   # 插件配置
│       └── env.ts            # 环境变量
├── public/                     # 公共静态资源
├── tests/                      # 测试用例
├── package.json               # 项目依赖
├── vite.config.ts             # Vite配置（或webpack.config.js）
└── README.md                  # 项目说明