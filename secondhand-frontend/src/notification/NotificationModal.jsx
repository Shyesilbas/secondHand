import React, {useEffect, useMemo, useState} from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
    XCircle,
} from 'lucide-react';

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
    const [progressKey, setProgressKey] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsLeaving(false);
            setProgressKey(prev => prev + 1);

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
                    icon: CheckCircle2,
                    iconWrap: 'bg-emerald-100 text-emerald-600',
                    heading: 'text-slate-900',
                    text: 'text-slate-500',
                    primaryButton: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                    secondaryButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                    progress: 'bg-emerald-500'
                };
            case 'error':
                return {
                    icon: XCircle,
                    iconWrap: 'bg-rose-100 text-rose-600',
                    heading: 'text-slate-900',
                    text: 'text-slate-500',
                    primaryButton: 'bg-rose-600 hover:bg-rose-700 text-white',
                    secondaryButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                    progress: 'bg-rose-500'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    iconWrap: 'bg-amber-100 text-amber-600',
                    heading: 'text-slate-900',
                    text: 'text-slate-500',
                    primaryButton: 'bg-amber-600 hover:bg-amber-700 text-white',
                    secondaryButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                    progress: 'bg-amber-500'
                };
            case 'info':
            default:
                return {
                    icon: Info,
                    iconWrap: 'bg-indigo-100 text-indigo-600',
                    heading: 'text-slate-900',
                    text: 'text-slate-500',
                    primaryButton: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                    secondaryButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                    progress: 'bg-indigo-500'
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

    const config = useMemo(() => getNotificationConfig(), [type]);
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center z-[80] p-4" onClick={handleBackdropClick}>
            <div className={`relative bg-white rounded-3xl border border-slate-200 shadow-2xl ${getSizeClasses()} w-full transform transition-all duration-300 overflow-hidden ${
                isLeaving 
                    ? 'opacity-0 scale-95' 
                    : 'opacity-100 scale-100'
            }`}>
                {/* Close button */}
                {showCloseButton && (
                    <div className="absolute right-4 top-4 z-10">
                        <button
                            type="button"
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center"
                            onClick={handleClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${config.iconWrap}`}>
                            <IconComponent className="w-6 h-6" />
                        </div>
                        
                        {/* Text content */}
                        <div className="flex-1">
                            {title && (
                                <h3 className={`text-lg font-bold ${config.heading} mb-1.5 pr-10`}>
                                    {title}
                                </h3>
                            )}
                            {message && (
                                <div className={`text-sm leading-relaxed ${config.text} mb-4`}>
                                    <p>{message}</p>
                                </div>
                            )}
                            {details && (
                                <details className="mt-3">
                                    <summary className={`cursor-pointer text-sm font-semibold ${config.heading} hover:underline`}>
                                        Show Details
                                    </summary>
                                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
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
                    <div className="px-6 sm:px-7 py-4 bg-slate-50 border-t border-slate-100 flex flex-row-reverse gap-2.5">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                    action.primary ? config.primaryButton : config.secondaryButton
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
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${config.primaryButton}`}
                                onClick={handleClose}
                            >
                                Okay
                            </button>
                        )}
                    </div>
                )}

                {/* Auto-close progress bar */}
                {autoClose && autoCloseDelay > 0 && (
                    <div className="h-1.5 bg-slate-100">
                        <div
                            key={progressKey}
                            className={`h-full ${config.progress}`}
                            style={{
                                animation: `notification-shrink ${autoCloseDelay}ms linear forwards`
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
    @keyframes notification-shrink {
        from { width: 100%; }
        to { width: 0%; }
    }
`;
if (!document.head.querySelector('style[data-notification-animations]')) {
    style.setAttribute('data-notification-animations', 'true');
    document.head.appendChild(style);
}

export default NotificationModal;