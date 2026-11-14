import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../common/formatters.js';
import { Check, ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { EMAIL_TYPE_DOT_COLORS, EMAIL_TYPE_LABELS, getProcessedContent, stripEmailEmojis } from '../emails.js';
import { extractOtpFromEmailRecord } from '../../payments/utils/otp.js';

const formatFullEmailDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return formatDateTime(dateString);
    const datePart = d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return formatDateTime(dateString);
  }
};

const EmailContent = ({
  email,
  onDelete,
  isDeleting,
  onSelectPrev,
  onSelectNext,
  hasPrev = false,
  hasNext = false
}) => {
  const { t } = useTranslation();
  const [copiedCode, setCopiedCode] = useState(false);

  const detectedCode = useMemo(() => extractOtpFromEmailRecord(email), [email]);

  useEffect(() => {
    setCopiedCode(false);
  }, [email?.id]);

  if (!email) return null;

  const cleanSubject = stripEmailEmojis(email.subject || '').trim() || t('untitled_email', '(Başlıksız E-Posta)');
  const categoryLabel = EMAIL_TYPE_LABELS[email.emailType] || email.emailType || t('email', 'Bildirim');
  const dotClass = EMAIL_TYPE_DOT_COLORS[email.emailType] || 'bg-text-muted';

  const handleCopyCode = async () => {
    if (!detectedCode) return;
    try {
      await navigator.clipboard.writeText(detectedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background-primary">
      {/* Editorial Reading Header */}
      <header className="shrink-0 border-b border-border bg-background-primary px-4 py-2.5 sm:px-6 sm:py-3">
        {/* Top Meta & Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-text-secondary">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
            <span className="font-medium text-text-primary">{categoryLabel}</span>
            {email.sentAt && (
              <>
                <span className="text-text-muted" aria-hidden="true">·</span>
                <time className="tabular-nums text-text-secondary" dateTime={email.sentAt}>
                  {formatFullEmailDate(email.sentAt)}
                </time>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {detectedCode && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-border bg-background-secondary px-2.5 text-xs font-semibold text-text-primary tabular-nums transition-colors hover:border-card-border-hover hover:bg-background-tertiary"
                title={t('copy_verification_code', 'Doğrulama kodunu kopyala')}
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-status-success" strokeWidth={1.75} />
                    <span>{t('copied', 'Kopyalandı')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.5} />
                    <span>{t('copy_code', 'Kodu Kopyala')}: {detectedCode}</span>
                  </>
                )}
              </button>
            )}

            {(onSelectPrev || onSelectNext) && (
              <div className="inline-flex items-center rounded border border-border bg-background-primary">
                <button
                  type="button"
                  onClick={onSelectPrev}
                  disabled={!hasPrev}
                  className="flex h-8 w-8 items-center justify-center border-r border-border-light text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary disabled:opacity-30"
                  title={t('previous_email', 'Önceki e-posta')}
                  aria-label={t('previous_email', 'Önceki e-posta')}
                >
                  <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={onSelectNext}
                  disabled={!hasNext}
                  className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary disabled:opacity-30"
                  title={t('next_email', 'Sonraki e-posta')}
                  aria-label={t('next_email', 'Sonraki e-posta')}
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(email.id, cleanSubject)}
                disabled={isDeleting}
                className="flex h-8 w-8 items-center justify-center rounded border border-border text-text-secondary transition-colors hover:border-status-error hover:bg-background-secondary hover:text-status-error disabled:opacity-40"
                title={t('delete', 'Sil')}
                aria-label={t('delete', 'Sil')}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Subject */}
        <h2 className="mt-1 text-base sm:text-lg font-semibold leading-snug text-text-primary">
          {cleanSubject}
        </h2>

        {/* Sender Meta (shown if non-system or custom sender) */}
        {email.senderEmail && !email.senderEmail.toLowerCase().includes('noreply') && (
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-text-tertiary">
            <span>
              {t('sender', 'Gönderen')}: <span className="font-medium text-text-secondary">{email.senderEmail}</span>
            </span>
          </div>
        )}
      </header>

      {/* Body: Normalized Sandboxed Iframe */}
      <div className="relative min-h-0 flex-1 bg-background-primary">
        <iframe
          srcDoc={getProcessedContent(email.content)}
          title={t('email_content', 'E-Posta İçeriği')}
          className="absolute inset-0 h-full w-full border-0"
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

export default EmailContent;