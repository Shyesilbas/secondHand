import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, title, onClose, autoClose = true, autoCloseDelay = 2500 }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!autoClose || autoCloseDelay <= 0) return;
        const t = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 200);
        }, autoCloseDelay);
        return () => clearTimeout(t);
    }, [autoClose, autoCloseDelay, onClose]);

    if (!visible) return null;

    return (
        <div
            className="flex items-start gap-3 min-w-[280px] max-w-sm p-4 bg-white rounded-lg shadow-lg border border-slate-200"
            role="alert"
        >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
                {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
                <p className="text-sm text-slate-600">{message}</p>
            </div>
            <button
                type="button"
                onClick={() => { setVisible(false); setTimeout(onClose, 200); }}
                className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded"
                aria-label="Close"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Toast;
