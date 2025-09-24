import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { ROUTES } from '../common/constants/routes.js';
import LoadingIndicator from '../common/components/ui/LoadingIndicator.jsx';

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
                        navigate(ROUTES.AUTH_COMPLETE + window.location.search, { replace: true });
        }
    }, [params, navigate, loginWithTokens]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <LoadingIndicator />
                <p className="text-text-secondary">Signing you in...</p>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;


