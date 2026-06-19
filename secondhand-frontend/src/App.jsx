import { lazy, Suspense } from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider} from './auth/AuthProvider.jsx';
import {NotificationProvider} from './notification/NotificationProvider.jsx';
import {InAppNotificationProvider} from './notification/InAppNotificationProvider.jsx';
import {EnumProvider} from './common/contexts/EnumProvider.jsx';
import {ComparisonProvider} from './comparison/contexts/ComparisonProvider.jsx';
import {ReservationModalProvider} from './cart/context/ReservationModalProvider.jsx';
import ErrorBoundary from './common/components/ErrorBoundary.jsx';
import AppRoutes from './common/routes/AppRoutes';

const CompareFloatingBar = lazy(() => import('./comparison/components/CompareFloatingBar.jsx'));
const CompareModal = lazy(() => import('./comparison/components/CompareModal.jsx'));
const SafeMeetupOnboardingModal = lazy(() =>
  import('./order/components/shared/SafeMeetupOnboardingModal.jsx').then((m) => ({
    default: m.SafeMeetupOnboardingModal,
  }))
);


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
                                            <Suspense fallback={null}>
                                                <CompareFloatingBar />
                                                <CompareModal />
                                                <SafeMeetupOnboardingModal />
                                            </Suspense>
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