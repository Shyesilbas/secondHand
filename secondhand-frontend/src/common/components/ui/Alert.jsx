import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const ICONS = { error: XCircle, success: CheckCircle2, warning: AlertTriangle, info: Info };

// Inline message for a failed action or form submit, or a notice. `action` renders on the right.
// Content that failed to load uses ErrorState instead.
const Alert = ({ type = 'error', message, action }) => {
 if (!message) return null;

 const colors = {
 error: { bg: 'bg-status-error-bg', border: 'border-status-error-border', text: 'text-status-error-text', icon: 'text-status-error' },
 success: { bg: 'bg-status-success-bg', border: 'border-status-success-border', text: 'text-status-success-text', icon: 'text-status-success' },
 warning: { bg: 'bg-status-warning-bg', border: 'border-status-warning-border', text: 'text-status-warning-text', icon: 'text-status-warning-text' },
 info: { bg: 'bg-status-info-bg', border: 'border-status-info-border', text: 'text-status-info-text', icon: 'text-status-info-icon' },
 };

 const c = colors[type] || colors.error;
 const Icon = ICONS[type] || ICONS.error;

 return (
 <div role="alert" className={`${c.bg} ${c.border} flex flex-col gap-3 rounded border px-4 py-3 sm:flex-row sm:items-center`}>
 <div className="flex min-w-0 flex-1 items-start gap-2.5">
 <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${c.icon}`} strokeWidth={1.5} aria-hidden />
 <p className={`text-sm ${c.text}`}>{message}</p>
 </div>
 {action ? <div className="shrink-0 pl-6 sm:pl-0">{action}</div> : null}
 </div>
 );
};

export default Alert;
