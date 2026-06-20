import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from 'react';
import { CheckCircle as CheckCircleIcon, X as XMarkIcon } from 'lucide-react';
const Toast = ({
  message,
  title,
  onClose,
  autoClose = true,
  autoCloseDelay = 2500
}) => {
  const {
    t
  } = useTranslation();
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
  return <div className="flex items-start gap-3 min-w-[280px] max-w-sm p-4 bg-background-primary rounded-lg shadow-lg border border-border-light" role="alert">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-status-success-bg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-status-success" />
            </div>
            <div className="flex-1 min-w-0">
                {title && <p className="text-sm font-semibold text-text-primary">{title}</p>}
                <p className="text-sm text-slate-600">{message}</p>
            </div>
            <button type="button" onClick={() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }} className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded" aria-label={t("close")}>
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>;
};
export default Toast;