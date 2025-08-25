import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const OAuthCallbackPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithTokens } = useAuth();

    useEffect(() => {
        const token = params.get('token');
        const refresh = params.get('refresh');

        if (token && refresh) {
            (async () => {
                try {
                    await loginWithTokens(token, refresh);
                    navigate(ROUTES.DASHBOARD, { replace: true });
                } catch (e) {
                    navigate(ROUTES.AUTH_ERROR + '?message=Login failed', { replace: true });
                }
            })();
        } else {
            // If the backend redirected for completion, route could already be /auth/complete
            navigate(ROUTES.AUTH_COMPLETE + window.location.search, { replace: true });
        }
    }, [params, navigate, loginWithTokens]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <LoadingIndicator />
                <p className="text-gray-600">Signing you in...</p>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;


