import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../common/constants/routes.js';

const OAuthErrorPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const message = params.get('message') || 'Authentication failed. Please try again.';

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full bg-white shadow rounded p-6 text-center">
                <h1 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h1>
                <p className="text-text-secondary mb-6">{message}</p>
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    onClick={() => navigate(ROUTES.LOGIN)}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default OAuthErrorPage;


