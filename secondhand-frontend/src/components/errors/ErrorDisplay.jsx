import React from 'react';
import { ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { ERROR_TYPES, ERROR_SEVERITY } from '../../utils/errorHandler';

/**
 * Modern error display component with different styles based on error type and severity
 */
const ErrorDisplay = ({ 
    error, 
    onDismiss, 
    showDetails = false, 
    className = '',
    variant = 'toast' // 'toast', 'inline', 'modal'
}) => {
    if (!error) return null;

    const getErrorIcon = () => {
        switch (error.type) {
            case ERROR_TYPES.AUTHENTICATION:
            case ERROR_TYPES.AUTHORIZATION:
                return <XCircleIcon className="w-5 h-5" />;
            case ERROR_TYPES.VALIDATION:
                return <ExclamationTriangleIcon className="w-5 h-5" />;
            case ERROR_TYPES.NETWORK:
            case ERROR_TYPES.SERVER:
                return <ExclamationTriangleIcon className="w-5 h-5" />;
            default:
                return <InformationCircleIcon className="w-5 h-5" />;
        }
    };

    const getErrorColors = () => {
        if (error.severity === ERROR_SEVERITY.CRITICAL || error.severity === ERROR_SEVERITY.HIGH) {
            return {
                bg: 'bg-red-50',
                border: 'border-red-200',
                icon: 'text-red-500',
                title: 'text-red-800',
                message: 'text-red-700',
                button: 'text-red-500 hover:text-red-600',
                accent: 'bg-red-500'
            };
        } else if (error.severity === ERROR_SEVERITY.MEDIUM) {
            return {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                icon: 'text-yellow-500',
                title: 'text-yellow-800',
                message: 'text-yellow-700',
                button: 'text-yellow-500 hover:text-yellow-600',
                accent: 'bg-yellow-500'
            };
        } else {
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                icon: 'text-blue-500',
                title: 'text-blue-800',
                message: 'text-blue-700',
                button: 'text-blue-500 hover:text-blue-600',
                accent: 'bg-blue-500'
            };
        }
    };

    const colors = getErrorColors();

    const getErrorTitle = () => {
        switch (error.type) {
            case ERROR_TYPES.AUTHENTICATION:
                return 'Giriş Hatası';
            case ERROR_TYPES.AUTHORIZATION:
                return 'Yetki Hatası';
            case ERROR_TYPES.VALIDATION:
                return 'Doğrulama Hatası';
            case ERROR_TYPES.NETWORK:
                return 'Bağlantı Hatası';
            case ERROR_TYPES.SERVER:
                return 'Sunucu Hatası';
            default:
                return 'Hata';
        }
    };

    if (variant === 'inline') {
        return (
            <div className={`rounded-md ${colors.bg} ${colors.border} border p-4 ${className}`}>
                <div className="flex">
                    <div className="flex-shrink-0">
                        <div className={colors.icon}>
                            {getErrorIcon()}
                        </div>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className={`text-sm font-medium ${colors.title}`}>
                            {getErrorTitle()}
                        </h3>
                        <div className={`mt-2 text-sm ${colors.message}`}>
                            <p>{error.message}</p>
                            {showDetails && error.originalMessage && error.originalMessage !== error.message && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                                        Teknik detaylar
                                    </summary>
                                    <p className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
                                        {error.originalMessage}
                                        {error.statusCode && ` (${error.statusCode})`}
                                    </p>
                                </details>
                            )}
                        </div>
                    </div>
                    {onDismiss && (
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    className={`inline-flex rounded-md p-1.5 ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-red-600`}
                                    onClick={onDismiss}
                                >
                                    <span className="sr-only">Kapat</span>
                                    <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Toast variant (used in Toast component)
    return (
        <div className={`max-w-sm w-full ${colors.bg} ${colors.border} border rounded-lg shadow-lg overflow-hidden ${className}`}>
            {/* Accent bar */}
            <div className={`h-1 ${colors.accent}`} />
            
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className={colors.icon}>
                            {getErrorIcon()}
                        </div>
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className={`text-sm font-medium ${colors.title}`}>
                            {getErrorTitle()}
                        </p>
                        <p className={`mt-1 text-sm ${colors.message}`}>
                            {error.message}
                        </p>
                        {showDetails && error.originalMessage && error.originalMessage !== error.message && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                                    Detaylar
                                </summary>
                                <p className="mt-1 text-xs opacity-75">
                                    {error.originalMessage}
                                </p>
                            </details>
                        )}
                    </div>
                    {onDismiss && (
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                className={`inline-flex ${colors.button} transition-colors duration-200`}
                                onClick={onDismiss}
                            >
                                <span className="sr-only">Kapat</span>
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;