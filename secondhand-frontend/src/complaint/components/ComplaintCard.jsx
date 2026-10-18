import { useTranslation } from "react-i18next";
import { ComplaintReason } from '../types/complaintTypes.js';
import { formatDate as formatDateCommon } from '../../common/formatters.js';
const COMPLAINT_REASONS = {
 [ComplaintReason.INAPPROPRIATE_CONTENT]: 'Inappropriate Content',
 [ComplaintReason.HARASSMENT]: 'Harassment',
 [ComplaintReason.SCAM_FRAUD]: 'Scam/Fraud Listing',
 [ComplaintReason.FALSE_ADVERTISING]: 'False Advertising',
 [ComplaintReason.COPYRIGHT_VIOLATION]: 'Copyright Violation',
 [ComplaintReason.SPAM]: 'Spam',
 [ComplaintReason.OTHER]: 'Other'
};
const ComplaintCard = ({
 complaint
}) => {
 const {
 t
 } = useTranslation();
 if (!complaint) return null;
 const getReasonLabel = reason => COMPLAINT_REASONS[reason] || reason || 'UNKNOWN REASON';
 const getStatusText = resolvedAt => resolvedAt ? 'Resolved' : 'Under Review';
 const formatDate = dateString => {
 const formatted = formatDateCommon(dateString);
 return formatted || 'N/A';
 };
 return <div className="relative flex h-full overflow-hidden rounded border border-border bg-background-primary">
 <div className="px-6 pt-5 pb-5 flex-1">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div>
 <h3 className="text-sm font-medium text-text-primary tracking-tight">{t("complaint")}</h3>
 <p className="text-xs text-text-tertiary leading-relaxed">{formatDate(complaint.createdAt)}</p>
 </div>
 </div>
 <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
 <span className={`h-1.5 w-1.5 rounded-full ${complaint.resolvedAt ? 'bg-status-success' : 'bg-status-warning'}`} aria-hidden />
 {getStatusText(complaint.resolvedAt)}
 </span>
 </div>

 <div className="mt-4">
 <span className="inline-flex items-center rounded bg-background-secondary px-3 py-1 text-xs font-medium text-text-secondary">
 {getReasonLabel(complaint.reason)}
 </span>
 </div>

 {complaint.description && <div className="mt-4">
 <div className="text-sm leading-relaxed text-text-primary">
 {complaint.description}
 </div>
 </div>}

 <div className="mt-5 grid grid-cols-1 gap-3 text-sm">
 <div className="flex items-center justify-between">
 <span className="text-text-tertiary">{t("complained_user")}</span>
 <span className="max-w-[60%] truncate text-right font-medium text-text-primary">
 {complaint.complainedUserFullName || `${complaint.complainedUserName || ''} ${complaint.complainedUserSurname || ''}`.trim() || complaint.complainedUserId}
 </span>
 </div>
 {complaint.listingTitle && <div className="flex items-center justify-between">
 <span className="text-text-tertiary">{t("listing")}</span>
 <span className="max-w-[60%] truncate text-right font-medium text-text-primary">{complaint.listingTitle}</span>
 </div>}
 {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && <div className="flex items-center justify-between">
 <span className="text-text-tertiary">{t("last_updated")}</span>
 <span className="font-medium text-text-primary">{formatDate(complaint.updatedAt)}</span>
 </div>}
 {complaint.resolvedAt && <div className="flex items-center justify-between">
 <span className="text-text-tertiary">{t("resolved")}</span>
 <span className="font-medium text-text-primary">{formatDate(complaint.resolvedAt)}</span>
 </div>}
 </div>
 </div>
 </div>;
};
export default ComplaintCard;