import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import router from './router';
import store from './store';
import { ToastContainer } from 'react-toastify';
import { AppThemeProvider, useColorMode } from './theme';

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
