import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../constants/routes.js';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthState();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        const from = location.state?.from?.pathname || ROUTES.HOME;
        return <Navigate to={from} replace />;
    }

    return children;
};

export default PublicRoute;