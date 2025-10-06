import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid, ExclamationTriangleIcon as ExclamationTriangleIconSolid, InformationCircleIcon as InformationCircleIconSolid, XCircleIcon as XCircleIconSolid } from '@heroicons/react/24/solid';

const NotificationModal = ({ 
    isOpen, 
    onClose, 
    type = 'info', 
    title, 
    message, 
    details,
    actions = [],
    autoClose = true,
    autoCloseDelay = 5000,
    showCloseButton = true,
    size = 'md' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsLeaving(false);
            
                        if (autoClose && autoCloseDelay > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, autoCloseDelay);
                
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, autoClose, autoCloseDelay]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen && !isVisible) return null;

    const getNotificationConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircleIconSolid,
                    iconOutline: CheckCircleIcon,
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600',
                    titleColor: 'text-gray-900',
                    messageColor: 'text-gray-600',
                    buttonBg: 'bg-green-600 hover:bg-green-700',
                    buttonColor: 'text-white'
                };
            case 'error':
                return {
                    icon: XCircleIconSolid,
                    iconOutline: XCircleIcon,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    titleColor: 'text-gray-900',
                    messageColor: 'text-gray-600',
                    buttonBg: 'bg-red-600 hover:bg-red-700',
                    buttonColor: 'text-white'
                };
            case 'warning':
                return {
                    icon: ExclamationTriangleIconSolid,
                    iconOutline: ExclamationTriangleIcon,
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    titleColor: 'text-gray-900',
                    messageColor: 'text-gray-600',
                    buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
                    buttonColor: 'text-white'
                };
            case 'info':
            default:
                return {
                    icon: InformationCircleIconSolid,
                    iconOutline: InformationCircleIcon,
                    iconBg: 'bg-gray-100',
                    iconColor: 'text-gray-600',
                    titleColor: 'text-gray-900',
                    messageColor: 'text-gray-600',
                    buttonBg: 'bg-gray-900 hover:bg-gray-800',
                    buttonColor: 'text-white'
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'max-w-md';
            case 'lg':
                return 'max-w-2xl';
            case 'xl':
                return 'max-w-4xl';
            case 'md':
            default:
                return 'max-w-lg';
        }
    };

    const config = getNotificationConfig();
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
            <div className={`bg-white rounded border border-gray-200 ${getSizeClasses()} w-full mx-4 transform transition-all duration-300 ${
                isLeaving 
                    ? 'opacity-0 scale-95' 
                    : 'opacity-100 scale-100'
            }`}>
                {/* Close button */}
                {showCloseButton && (
                    <div className="absolute right-0 top-0 pr-4 pt-4">
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={handleClose}
                        >
                            <span className="sr-only">Close</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`p-2 ${config.iconBg} rounded-lg flex-shrink-0`}>
                            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                        </div>
                        
                        {/* Text content */}
                        <div className="flex-1">
                            {title && (
                                <h3 className={`text-lg font-semibold ${config.titleColor} mb-2`}>
                                    {title}
                                </h3>
                            )}
                            {message && (
                                <div className={`text-sm ${config.messageColor} mb-4`}>
                                    <p>{message}</p>
                                </div>
                            )}
                            {details && (
                                <details className="mt-3">
                                    <summary className={`cursor-pointer text-sm font-medium ${config.titleColor} hover:underline`}>
                                        Show Details
                                    </summary>
                                    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                                        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                            {typeof details === 'object' ? JSON.stringify(details, null, 2) : details}
                                        </pre>
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {(actions.length > 0 || !autoClose) && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-row-reverse gap-3">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    action.primary ? `${config.buttonBg} ${config.buttonColor}` : 'bg-gray-600 hover:bg-gray-700 text-white'
                                }`}
                                onClick={() => {
                                    action.onClick?.();
                                    if (action.closeOnClick !== false) {
                                        handleClose();
                                    }
                                }}
                            >
                                {action.label}
                            </button>
                        ))}
                        {!autoClose && actions.length === 0 && (
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                                onClick={handleClose}
                            >
                                Okay
                            </button>
                        )}
                    </div>
                )}

                {/* Auto-close progress bar */}
                {autoClose && autoCloseDelay > 0 && (
                    <div className="h-1 bg-gray-200">
                        <div 
                            className={`h-full ${config.buttonBg.replace('hover:bg-', 'bg-')} transition-all linear`}
                            style={{
                                animation: `shrink ${autoCloseDelay}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const style = document.createElement('style');
style.textContent = `
    @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
    }
`;
if (!document.head.querySelector('style[data-notification-animations]')) {
    style.setAttribute('data-notification-animations', 'true');
    document.head.appendChild(style);
}

export default NotificationModal;