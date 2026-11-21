import { useTranslation } from "react-i18next";
import { Check as CheckIcon, Clock as ClockIcon, FileText, ExternalLink, Calendar } from 'lucide-react';
import { agreementLabel } from '../agreements.js';
import { formatDate } from '../../common/formatters.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
const AgreementCard = ({
 agreement,
 status = {},
 onAccept,
 accepting,
 onRead
}) => {
 const {
 t
 } = useTranslation();
 const StatusIcon = status.icon || ClockIcon;
 const isPending = status.status === 'pending' || status.status === 'outdated';
 return <div className="rounded border border-border-light bg-background-primary transition-colors duration-150 hover:border-border-dark">
 <div className="p-5">
 <div className="flex items-start justify-between gap-4">
 {/* Left: icon + info */}
 <div className="flex items-start gap-3.5 min-w-0">
 <FileText className="shrink-0 h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
 <div className="min-w-0">
 <h3 className="text-sm font-medium text-text-primary">
 {agreementLabel(t, agreement.agreementType)}
 </h3>
 <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
 <span className="tabular-nums">{t("v")}{agreement.version}</span>
 <span className="inline-flex items-center gap-1">
 <Calendar className="w-3 h-3" strokeWidth={1.5} />
 {formatDate(agreement.updatedDate)}
 </span>
 </div>
 {status.acceptedDate && <p className="mt-1.5 text-xs text-status-success-text font-medium">{t("accepted_on")}{formatDate(status.acceptedDate)}
 </p>}
 </div>
 </div>

 {/* Right: status badge */}
 <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold shrink-0 border ${status.bgColor} ${status.borderColor} ${status.color}`}>
 <StatusIcon className="w-3 h-3" strokeWidth={1.5} />
 {status.text}
 </div>
 </div>

 {/* Action row */}
 <div className="mt-4 flex items-center justify-between">
 <button type="button" onClick={() => onRead(agreement)} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-150">
 <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />{t("read_agreement")}</button>

 {isPending && <button disabled={accepting} onClick={() => onAccept(agreement)} className={buttonClasses('primary', 'sm')}>
 {accepting ? <>
 <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t("accepting")}</> : <>
 <CheckIcon className="w-3.5 h-3.5" strokeWidth={1.5} />{t("accept")}</>}
 </button>}
 </div>
 </div>
 </div>;
};
export default AgreementCard;