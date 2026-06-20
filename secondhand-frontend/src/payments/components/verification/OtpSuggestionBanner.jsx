import { useTranslation } from "react-i18next";
import React, { useCallback, useMemo } from 'react';
import { Copy, CornerDownRight, Mail } from 'lucide-react';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { OTP_CODE_LENGTH } from '../../../common/constants/otp.js';

/**
 * Strip HTML tags, decode common entities, and collapse whitespace
 * so email content is safe to render as plain text.
 */
const sanitizeEmailContent = raw => {
  if (!raw || typeof raw !== 'string') return '';
  let t = raw.replace(/<[^>]+>/g, ' ');
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
  return <div className="overflow-hidden rounded-lg border border-[#e5e3df] bg-background-primary shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-[#f0efed] bg-[#fafaf9] px-4 py-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#111] text-white">
          <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#111]">
            {emailSubject || 'Payment Verification'}
          </p>
          {emailDate && <p className="text-caption text-[#999]">
              {new Date(emailDate).toLocaleString()}
            </p>}
        </div>
      </div>

      {/* Email content preview */}
      {emailPreview && <div className="border-b border-[#f0efed] px-4 py-3">
          <p className="text-xs leading-relaxed text-[#555]">
            {emailPreview}
          </p>
        </div>}

      {/* Code + actions */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3">
        <span className="inline-flex rounded-md border border-[#e5e3df] bg-[#fafaf9] px-3 py-1.5 font-mono text-lg font-bold tabular-nums tracking-[0.3em] text-[#111]" aria-label={t("suggested_verification_code")}>
          {String(suggestedCode)}
        </span>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-[#1466c6] bg-[#1466c6] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#0f529e]">
          <Copy className="h-3.5 w-3.5 shrink-0" />{t("copy")}</button>
        <button type="button" onClick={apply} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e3df] bg-background-primary px-3 py-1.5 text-xs font-medium text-[#111] transition-all hover:bg-[#fafaf9]">
          <CornerDownRight className="h-3.5 w-3.5 shrink-0" />{t("fill_inputs")}</button>
      </div>
    </div>;
};
export default OtpSuggestionBanner;