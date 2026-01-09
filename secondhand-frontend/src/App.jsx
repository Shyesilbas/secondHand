import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext.jsx';
import { NotificationProvider } from './notification/NotificationContext.jsx';
import { EnumProvider } from './common/contexts/EnumContext.jsx';
import { ComparisonProvider, CompareFloatingBar, CompareModal } from './comparison/index.js';
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
                    <EnumProvider>
                        <NotificationProvider>
                            <ComparisonProvider>
                                <div className="App">
                                    <AppRoutes />
                                    <CompareFloatingBar />
                                    <CompareModal />
                                </div>
                            </ComparisonProvider>
                        </NotificationProvider>
                    </EnumProvider>
                </AuthProvider>
            </Router>
        </QueryClientProvider>
    );
}

export default App;