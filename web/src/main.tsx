/**
 * 应用入口文件 - Redux版
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import ReduxApp from './ReduxApp';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReduxApp />
  </React.StrictMode>
);
