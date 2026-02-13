import {BrowserRouter as Router} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider} from './auth/AuthContext.jsx';
import {NotificationProvider} from './notification/NotificationContext.jsx';
import {InAppNotificationProvider} from './notification/InAppNotificationContext.jsx';
import {EnumProvider} from './common/contexts/index.js';
import {CompareFloatingBar, CompareModal, ComparisonProvider} from './comparison/index.js';
import {ReservationModalProvider} from './cart/context/ReservationModalContext.jsx';
import ErrorBoundary from './common/components/ErrorBoundary.jsx';
import AppRoutes from './common/routes/AppRoutes';

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
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <AuthProvider>
                        <EnumProvider>
                            <NotificationProvider>
                                <InAppNotificationProvider>
                                    <ComparisonProvider>
                                        <ReservationModalProvider>
                                        <div className="App">
                                            <AppRoutes />
                                            <CompareFloatingBar />
                                            <CompareModal />
                                        </div>
                                        </ReservationModalProvider>
                                    </ComparisonProvider>
                                </InAppNotificationProvider>
                            </NotificationProvider>
                        </EnumProvider>
                    </AuthProvider>
                </Router>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;