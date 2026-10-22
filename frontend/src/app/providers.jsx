import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { ToastProvider } from '../components/common/Toast/Toast';
import RealtimeBridge from '../realtime/RealtimeBridge';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RealtimeBridge />
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}
