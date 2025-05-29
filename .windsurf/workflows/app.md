---
description: This is a backend directory structure requirement.
---

This is a backend directory structure requirement.
React + shadcnUI
icon：tabler.io
Directory structure description
src/api/:
core/: Core API routes and controllers (such as user management, application settings).
plugins/: API routes for plugins, dynamically loaded.
index.js: Unified registration of routes.
src/plugins/:
Each plugin contains routes, services, models and middleware, and the structure is self-contained.
index.js: Plugin entry, exposing plugin configuration.
src/core/:
pluginManager/: Manages plugin registration, loading and unloading.
database/: Database connection and core models (such as MongoDB, Prisma).
middleware/: Global middleware (such as authentication, logging).
src/utils/: General utility functions, such as logging and API encapsulation.
src/config/: Plugin configuration and environment variables.
server.js: Express service entry, initializes the application.

app/
├── src/
│   ├── api/                     # API路由
│   │   ├── core/               # 核心路由
│   │   │   ├── routes/
│   │   │   │   ├── users.js
│   │   │   │   └── app.js
│   │   │   └── controllers/
│   │   │       ├── usersController.js
│   │   │       └── appController.js
│   │   ├── plugins/            # 插件路由
│   │   │   ├── pluginA/
│   │   │   │   ├── routes.js  # 插件A的路由
│   │   │   │   └── controllers/ # 插件A的控制器
│   │   │   ├── pluginB/
│   │   │   └── ...           # 其他插件
│   │   └── index.js           # 路由入口
│   ├── plugins/                # 插件逻辑
│   │   ├── pluginA/
│   │   │   ├── services/      # 插件A的业务逻辑
│   │   │   ├── models/        # 插件A的数据模型
│   │   │   ├── middleware/    # 插件A的中间件
│   │   │   └── index.js      # 插件A入口
│   │   ├── pluginB/
│   │   └── ...               # 其他插件
│   ├── core/                   # 核心逻辑
│   │   ├── pluginManager/     # 插件管理器
│   │   │   ├── index.js      # 插件注册、加载
│   │   │   └── types.js      # 插件接口定义
│   │   ├── database/         # 数据库连接
│   │   │   ├── models/      # 核心数据模型
│   │   │   └── index.js     # 数据库初始化
│   │   └── middleware/       # 核心中间件
│   ├── utils/                 # 工具函数
│   │   ├── logger.js         # 日志
│   │   └── apiHelper.js      # API工具
│   ├── config/                # 配置文件
│   │   ├── pluginConfig.js   # 插件配置
│   │   └── env.js            # 环境变量
│   └── server.js              # 服务入口
├── tests/                      # 测试用例
├── package.json               # 项目依赖
└── README.md                  # 项目说明