import { useTranslation } from "react-i18next";
import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { Button, Modal } from '../common/components/ui/index.js';

const TYPE_ICON = {
 success: [CheckCircle2, 'text-status-success'],
 error: [XCircle, 'text-status-error'],
 warning: [AlertTriangle, 'text-status-warning'],
 info: [Info, 'text-text-tertiary']
};

// Without a close button the dialog only closes through its actions (e.g. a confirm that must reset caller state).
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
 size = 'md'
}) => {
 const {
 t
 } = useTranslation();
 useEffect(() => {
 if (!isOpen || !autoClose || autoCloseDelay <= 0) return undefined;
 const timer = setTimeout(() => onClose?.(), autoCloseDelay);
 return () => clearTimeout(timer);
 }, [isOpen, autoClose, autoCloseDelay, onClose]);
 const close = () => onClose?.();
 const [Icon, iconColor] = TYPE_ICON[type] || TYPE_ICON.info;
 const header = <header className="flex items-start gap-3 border-b border-border-light px-5 py-4">
 <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} strokeWidth={1.5} aria-hidden />
 <h2 className="flex-1 text-base font-semibold text-text-primary">{title}</h2>
 {showCloseButton && <button type="button" onClick={close} aria-label={t("close")} className="rounded p-1 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>}
 </header>;
 const footer = actions.length > 0 ? actions.map((action, index) => <Button key={`action-${action.label || ''}-${index}`} variant={action.primary ? 'primary' : 'secondary'} onClick={() => {
 action.onClick?.();
 if (action.closeOnClick !== false) close();
 }}>
 {action.label}
 </Button>) : !autoClose ? <Button onClick={close}>{t("okay")}</Button> : null;
 return <Modal isOpen={isOpen} onClose={showCloseButton ? close : () => {}} title={title || type} header={header} footer={footer} size={size}>
 {message && <p className="text-sm leading-relaxed text-text-secondary">{message}</p>}
 {details && <details className="mt-3">
 <summary className="cursor-pointer text-sm font-medium text-text-primary hover:underline">{t("show_details")}</summary>
 <pre className="mt-2 whitespace-pre-wrap rounded border border-border-light bg-background-secondary p-3 text-xs text-text-secondary">
 {typeof details === 'object' ? JSON.stringify(details, null, 2) : details}
 </pre>
 </details>}
 </Modal>;
};
export default NotificationModal;
