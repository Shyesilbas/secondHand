import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from 'react';
import { Copy, CornerDownRight, Mail } from 'lucide-react';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { OTP_CODE_LENGTH } from '../../../common/constants/otp.js';

/**
 * Strip HTML tags, decode common entities, and collapse whitespace
 * so email content is safe to render as plain text.
 */
const sanitizeEmailContent = raw => {
 if (!raw || typeof raw !== 'string') return '';
 let t = raw
 .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
 .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
 t = t.replace(/<[^>]+>/g, ' ');
 t = t.replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
 t = t.replace(/\s+/g, ' ').trim();
 return t;
};

/** Suggested code from latest payment email: shows sanitized email preview, copy or apply to inputs. */
const OtpSuggestionBanner = ({
 suggestedCode,
 sourceEmail,
 onApply
}) => {
 const {
 t
 } = useTranslation();
 const notification = useNotification();
 const copy = useCallback(async () => {
 if (!suggestedCode?.length || suggestedCode.length !== OTP_CODE_LENGTH) return;
 try {
 await navigator.clipboard.writeText(suggestedCode);
 notification.showSuccess('Copied', `The ${OTP_CODE_LENGTH}-digit code was copied to your clipboard.`);
 } catch {
 notification.showWarning('Clipboard', 'Could not copy — select the code manually.');
 }
 }, [notification, suggestedCode]);
 const apply = useCallback(() => {
 onApply?.(suggestedCode);
 }, [onApply, suggestedCode]);
 const emailPreview = useMemo(() => {
 if (!sourceEmail) return null;
 const content = sourceEmail.content || sourceEmail.body || '';
 const sanitized = sanitizeEmailContent(content);
 if (!sanitized) return null;
 // Show a reasonable amount — truncate at ~280 chars
 return sanitized.length > 280 ? sanitized.slice(0, 280) + '…' : sanitized;
 }, [sourceEmail]);
 const emailSubject = sourceEmail?.subject || null;
 const emailDate = sourceEmail?.sentAt || sourceEmail?.createdAt || null;
 if (!suggestedCode || String(suggestedCode).length !== OTP_CODE_LENGTH) return null;
 return <div className="overflow-hidden rounded border border-border bg-background-primary">
 {/* Header */}
 <div className="flex items-center gap-2.5 border-b border-border-light bg-background-secondary px-4 py-2.5">
 <Mail className="shrink-0 h-5 w-5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <div className="min-w-0 flex-1">
 <p className="text-xs font-semibold text-text-primary">
 {emailSubject || 'Payment Verification'}
 </p>
 {emailDate && <p className="text-xs text-text-muted">
 {new Date(emailDate).toLocaleString()}
 </p>}
 </div>
 </div>

 {/* Email content preview */}
 {emailPreview && <div className="border-b border-border-light px-4 py-3">
 <p className="text-xs leading-relaxed text-text-tertiary">
 {emailPreview}
 </p>
 </div>}

 {/* Code + actions */}
 <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
 <span className="inline-flex rounded-md border border-border bg-background-secondary px-3 py-1.5 text-lg font-semibold tabular-nums text-text-primary" aria-label={t("suggested_verification_code")}>
 {String(suggestedCode)}
 </span>
 <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded border border-border-dark bg-secondary-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary">
 <Copy className="h-3.5 w-3.5 shrink-0" />{t("copy")}</button>
 <button type="button" onClick={apply} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3">
 <CornerDownRight className="h-3.5 w-3.5 shrink-0" />{t("fill_inputs")}</button>
 </div>
 </div>;
};
export default OtpSuggestionBanner;