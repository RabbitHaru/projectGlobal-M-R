import { AuthProvider } from './config/AuthProvider';
import { QueryClientProvider } from './config/QueryClientProvider';
import AppRoutes from './config/AppRoutes';

function App() {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
