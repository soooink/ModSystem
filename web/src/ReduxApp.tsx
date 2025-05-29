import { Provider } from 'react-redux';
import store from './core/store';
import App from './App';

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default ReduxApp;
