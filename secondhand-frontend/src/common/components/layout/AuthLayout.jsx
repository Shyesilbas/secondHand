import React from 'react';
import { Outlet } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                            <SparklesIcon className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            SecondHand
                        </h1>
                        <p className="text-sm text-gray-600">
                            Marketplace Platform
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <Outlet />
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        © 2024 SecondHand. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;