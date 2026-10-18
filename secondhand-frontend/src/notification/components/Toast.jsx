import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
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
 return <div className="flex items-start gap-3 min-w-72 max-w-sm p-4 bg-background-primary rounded border border-border shadow-sm" role="alert">
 <CheckCircleIcon className="h-5 w-5 shrink-0 text-status-success" strokeWidth={1.5} aria-hidden />
 <div className="flex-1 min-w-0">
 {title && <p className="text-sm font-semibold text-text-primary">{title}</p>}
 <p className="text-sm text-text-secondary">{message}</p>
 </div>
 <button type="button" onClick={() => {
 setVisible(false);
 setTimeout(onClose, 200);
 }} className="flex-shrink-0 p-1 text-text-muted hover:text-text-secondary rounded" aria-label={t("close")}>
 <XMarkIcon className="w-5 h-5" />
 </button>
 </div>;
};
export default Toast;