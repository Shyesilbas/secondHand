import { useTranslation } from 'react-i18next';
import { useCallback, useRef, useState } from 'react';
import { Check, ChevronDown, Copy, Mail } from 'lucide-react';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { OTP_CODE_LENGTH } from '../../../common/constants/otp.js';
import Button from '../../../common/components/ui/Button.jsx';

const looksLikeHtml = (text) => /<\/?[a-z][\s\S]*>/i.test(text);

/**
 * The email as it was sent. HTML renders in a sandboxed iframe: no scripts, no navigation;
 * `allow-same-origin` only lets this page read the frame height to size it.
 */
const EmailBody = ({ content }) => {
  const { t } = useTranslation();
  const frameRef = useRef(null);
  const [height, setHeight] = useState(240);

  if (!looksLikeHtml(content)) {
    return <p className="whitespace-pre-line text-sm text-text-secondary">{content}</p>;
  }

  const fitHeight = () => {
    const doc = frameRef.current?.contentDocument;
    if (doc?.body) setHeight(Math.min(Math.max(doc.body.scrollHeight + 16, 160), 560));
  };

  return (
    <iframe
      ref={frameRef}
      title={t('payment_email_preview', 'Doğrulama e-postası')}
      srcDoc={content}
      sandbox="allow-same-origin"
      referrerPolicy="no-referrer"
      onLoad={fitHeight}
      style={{ height }}
      className="block w-full rounded-md border border-border-light bg-background-primary"
    />
  );
};

/** Code found in the latest payment email: one row with the code and "use it", the email itself on demand. */
const OtpSuggestionBanner = ({ suggestedCode, sourceEmail, onApply, appliedCode }) => {
  const { t, i18n } = useTranslation();
  const notification = useNotification();
  const [emailOpen, setEmailOpen] = useState(false);
  const code = String(suggestedCode || '');

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      notification.showSuccess(t('copied', 'Kopyalandı'), t('otp_code_copied', 'Kod panoya kopyalandı.'));
    } catch {
      notification.showWarning(t('copy_failed', 'Kopyalanamadı'), t('otp_copy_manually', 'Kodu elle seçip kopyala.'));
    }
  }, [code, notification, t]);

  if (code.length !== OTP_CODE_LENGTH) return null;

  const content = sourceEmail?.content || sourceEmail?.body || '';
  const sentAt = sourceEmail?.sentAt || sourceEmail?.createdAt || null;
  const sentAtText = sentAt
    ? new Date(sentAt).toLocaleTimeString(i18n.language?.startsWith('tr') ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    : null;
  const isApplied = appliedCode === code;

  return (
    <div className="rounded-md border border-border bg-background-primary shadow-sm">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Mail className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-tertiary">
            {[t('otp_code_in_email', 'E-postandaki kod'), sentAtText].filter(Boolean).join(' · ')}
          </p>
          <p className="text-lg font-semibold tracking-widest tabular-nums text-text-primary" aria-label={t('suggested_verification_code', 'Önerilen doğrulama kodu')}>
            {code}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={copy} aria-label={t('copy', 'Kopyala')} className="!px-2">
            <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <Button variant={isApplied ? 'secondary' : 'primary'} size="sm" onClick={() => onApply?.(code)} disabled={isApplied}>
            {isApplied && <Check className="h-4 w-4" strokeWidth={2} aria-hidden />}
            {isApplied ? t('otp_code_applied', 'Kod girildi') : t('otp_use_code', 'Kodu kullan')}
          </Button>
        </div>
      </div>

      {content && (
        <div className="border-t border-border-light">
          <button
            type="button"
            onClick={() => setEmailOpen(open => !open)}
            aria-expanded={emailOpen}
            className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            <span className="truncate">
              {emailOpen ? t('hide_email', 'E-postayı gizle') : t('show_email', 'E-postayı göster')}
              {sourceEmail?.subject && <span className="text-text-tertiary"> · {sourceEmail.subject}</span>}
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-150 ${emailOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} aria-hidden />
          </button>
          {emailOpen && (
            <div className="px-4 pb-4">
              <EmailBody content={content} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OtpSuggestionBanner;
