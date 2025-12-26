import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext.jsx';
import { NotificationProvider } from './notification/NotificationContext.jsx';
import AppRoutes from './common/routes/AppRoutes';
import './common/services/api/interceptors';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: 5 * 60 * 1000, // 5 minutes - prevent unnecessary refetches
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AuthProvider>
                    <NotificationProvider>
                        <div className="App">
                            <AppRoutes />
                        </div>
                    </NotificationProvider>
                </AuthProvider>
            </Router>
        </QueryClientProvider>
    );
}

export default App;