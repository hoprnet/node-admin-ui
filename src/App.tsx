import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import router from './router';
import store from './store';
import { ToastContainer } from 'react-toastify';
import { AppThemeProvider, useColorMode } from './theme';
import * as Fathom from 'fathom-client';

const Toasts = () => {
  const { mode } = useColorMode();
  return (
    <ToastContainer
      position="bottom-right"
      limit={10}
      theme={mode}
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    />
  );
};

function App() {
  useEffect(() => {
    Fathom.load('MJISRYNH', {
      url: 'https://cdn-eu.usefathom.com/script.js',
      spa: 'auto',
      excludedDomains: ['localhost:5173'],
    });
  }, []);

  return (
    <Provider store={store}>
      <AppThemeProvider>
        <Toasts />
        <RouterProvider router={router} />
      </AppThemeProvider>
    </Provider>
  );
}

export default App;
