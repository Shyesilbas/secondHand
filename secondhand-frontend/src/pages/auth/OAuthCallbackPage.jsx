import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

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
            navigate(ROUTES.AUTH_ERROR + '?message=Missing tokens', { replace: true });
        }
    }, [params, navigate, loginWithTokens]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Signing you in...</p>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;


