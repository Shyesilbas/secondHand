import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid, ExclamationTriangleIcon as ExclamationTriangleIconSolid, InformationCircleIcon as InformationCircleIconSolid, XCircleIcon as XCircleIconSolid } from '@heroicons/react/24/solid';

/**
 * Modern modal-based notification component
 */
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
    size = 'md' // 'sm', 'md', 'lg', 'xl'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsLeaving(false);
            
            // Auto close if enabled
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
                    iconColor: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    titleColor: 'text-green-900',
                    messageColor: 'text-green-800',
                    buttonBg: 'bg-green-600 hover:bg-green-700',
                    accentColor: 'bg-green-600'
                };
            case 'error':
                return {
                    icon: XCircleIconSolid,
                    iconOutline: XCircleIcon,
                    iconColor: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    titleColor: 'text-red-900',
                    messageColor: 'text-red-800',
                    buttonBg: 'bg-red-600 hover:bg-red-700',
                    accentColor: 'bg-red-600'
                };
            case 'warning':
                return {
                    icon: ExclamationTriangleIconSolid,
                    iconOutline: ExclamationTriangleIcon,
                    iconColor: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    titleColor: 'text-yellow-900',
                    messageColor: 'text-yellow-800',
                    buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
                    accentColor: 'bg-yellow-600'
                };
            case 'info':
            default:
                return {
                    icon: InformationCircleIconSolid,
                    iconOutline: InformationCircleIcon,
                    iconColor: 'text-btn-primary',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    titleColor: 'text-blue-900',
                    messageColor: 'text-blue-800',
                    buttonBg: 'bg-btn-primary hover:bg-btn-primary-hover',
                    accentColor: 'bg-btn-primary'
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

    const overlayClasses = `fixed inset-0 bg-app-bg0 bg-opacity-75 transition-opacity duration-300 ${
        isLeaving ? 'opacity-0' : 'opacity-100'
    }`;

    const modalClasses = `transform transition-all duration-300 ease-in-out ${
        isLeaving 
            ? 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95' 
            : 'opacity-100 translate-y-0 sm:scale-100'
    }`;

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${overlayClasses}`} onClick={handleBackdropClick}>
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className={`relative ${getSizeClasses()} w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl sm:my-8 ${modalClasses}`}>
                    {/* Accent bar */}
                    <div className={`h-1 ${config.accentColor}`} />
                    
                    {/* Close button */}
                    {showCloseButton && (
                        <div className="absolute right-0 top-0 pr-4 pt-4">
                            <button
                                type="button"
                                className="rounded-md bg-white text-text-muted hover:text-text-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                onClick={handleClose}
                            >
                                <span className="sr-only">Close</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className={`${config.bgColor} px-4 pb-4 pt-5 sm:p-6 sm:pb-4`}>
                        <div className="sm:flex sm:items-start">
                            {/* Icon */}
                            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor} sm:mx-0 sm:h-10 sm:w-10`}>
                                <IconComponent className={`h-6 w-6 ${config.iconColor}`} aria-hidden="true" />
                            </div>
                            
                            {/* Text content */}
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                {title && (
                                    <h3 className={`text-lg font-semibold leading-6 ${config.titleColor} mb-2`}>
                                        {title}
                                    </h3>
                                )}
                                {message && (
                                    <div className={`text-sm ${config.messageColor} mb-3`}>
                                        <p>{message}</p>
                                    </div>
                                )}
                                {details && (
                                    <details className="mt-3">
                                        <summary className={`cursor-pointer text-sm font-medium ${config.titleColor} hover:underline`}>
                                            Show Details
                                        </summary>
                                        <div className="mt-2 p-3 bg-white rounded-md border border-sidebar-border">
                                            <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono">
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
                        <div className="bg-app-bg px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                                        action.primary ? config.buttonBg : 'bg-gray-600 hover:bg-gray-700'
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
                                    className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 sm:w-auto"
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
                                className={`h-full ${config.accentColor} transition-all linear`}
                                style={{
                                    animation: `shrink ${autoCloseDelay}ms linear forwards`
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Add CSS animation for progress bar
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