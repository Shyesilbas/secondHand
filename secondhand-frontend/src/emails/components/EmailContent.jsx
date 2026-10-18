import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../common/formatters.js';
import { Check, ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { EMAIL_TYPE_DOT_COLORS, EMAIL_TYPE_LABELS, stripEmailEmojis } from '../emails.js';
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

const EDITORIAL_EMAIL_STYLE = `
<style id="sh-editorial-email-style">
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background-color: rgb(255 255 255) !important;
    color: rgb(15 23 42) !important;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    font-variant-numeric: tabular-nums !important;
    -webkit-font-smoothing: antialiased !important;
  }
  .container {
    max-width: 720px !important;
    margin: 0 !important;
    padding: 16px 24px 20px 24px !important;
    background-color: rgb(255 255 255) !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .header,
  .brand-badge,
  .crown-icon,
  .benefit-icon {
    display: none !important;
  }
  .content {
    padding: 0 !important;
    color: rgb(51 65 85) !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
  }
  .content p,
  .greeting,
  .intro-text {
    margin: 0 0 10px 0 !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    color: rgb(51 65 85) !important;
  }
  .greeting {
    font-weight: 600 !important;
    color: rgb(15 23 42) !important;
  }
  .order-card,
  .receipt-card,
  .offer-card,
  .offer-box,
  .earning-card,
  .code-card,
  .badge-card,
  .details-box,
  .action-box,
  .listing-card {
    background-color: rgb(248 250 252) !important;
    border: 1px solid rgb(226 232 240) !important;
    border-radius: 8px !important;
    padding: 12px 16px !important;
    margin: 12px 0 !important;
    text-align: left !important;
    box-shadow: none !important;
  }
  .order-label,
  .receipt-label,
  .offer-label,
  .earning-label,
  .code-label {
    font-size: 12px !important;
    font-weight: 500 !important;
    color: rgb(100 116 139) !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    margin: 0 0 2px 0 !important;
  }
  .order-amount,
  .receipt-amount,
  .offer-amount,
  .offer-box h2,
  .earning-amount,
  .listing-price {
    font-size: 22px !important;
    font-weight: 600 !important;
    color: rgb(15 23 42) !important;
    letter-spacing: -0.02em !important;
    margin: 2px 0 0 0 !important;
    font-variant-numeric: tabular-nums !important;
  }
  .code-value,
  .pin-box {
    display: inline-block !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
    font-size: 24px !important;
    font-weight: 600 !important;
    letter-spacing: 0.2em !important;
    color: rgb(15 23 42) !important;
    background-color: rgb(255 255 255) !important;
    border: 1px solid rgb(203 213 225) !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    margin: 6px 0 !important;
    box-shadow: none !important;
    font-variant-numeric: tabular-nums !important;
  }
  .details-table,
  table[role="presentation"] {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 12px 0 !important;
    background-color: rgb(255 255 255) !important;
    border: 1px solid rgb(226 232 240) !important;
    border-radius: 8px !important;
    overflow: hidden !important;
  }
  .details-table td,
  table[role="presentation"] td {
    padding: 7px 14px !important;
    font-size: 13px !important;
    border-bottom: 1px solid rgb(241 245 249) !important;
    color: rgb(51 65 85) !important;
  }
  .details-table tr:last-child td,
  table[role="presentation"] tr:last-child td {
    border-bottom: none !important;
  }
  .detail-key,
  .detail-label {
    color: rgb(100 116 139) !important;
    font-weight: 500 !important;
    font-size: 13px !important;
  }
  .detail-val,
  .detail-value {
    color: rgb(15 23 42) !important;
    font-weight: 600 !important;
    text-align: right !important;
    font-size: 13px !important;
    font-variant-numeric: tabular-nums !important;
  }
  .detail-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 6px 0 !important;
    margin: 0 !important;
    border-bottom: 1px solid rgb(226 232 240) !important;
    font-size: 13px !important;
  }
  .detail-row:last-child {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
  .item-row,
  .benefit-row {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 9px 14px !important;
    border: 1px solid rgb(226 232 240) !important;
    border-radius: 8px !important;
    margin-bottom: 6px !important;
    background-color: rgb(255 255 255) !important;
  }
  .item-title,
  .benefit-title,
  .listing-title,
  .badge-title {
    font-weight: 600 !important;
    font-size: 14px !important;
    color: rgb(15 23 42) !important;
    margin: 0 !important;
  }
  .item-meta,
  .benefit-desc,
  .listing-city,
  .badge-desc {
    font-size: 12px !important;
    color: rgb(100 116 139) !important;
    margin-top: 2px !important;
    font-weight: 400 !important;
  }
  .item-price,
  .highlight {
    font-weight: 600 !important;
    font-size: 14px !important;
    color: rgb(15 23 42) !important;
    font-variant-numeric: tabular-nums !important;
  }
  .listing-img {
    width: 60px !important;
    height: 60px !important;
    border-radius: 8px !important;
    background-color: rgb(241 245 249) !important;
    margin-right: 14px !important;
  }
  .listing-img img {
    border-radius: 8px !important;
  }
  .button,
  a.button {
    display: inline-block !important;
    background: rgb(15 23 42) !important;
    background-color: rgb(15 23 42) !important;
    color: rgb(255 255 255) !important;
    text-decoration: none !important;
    padding: 9px 16px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    letter-spacing: 0 !important;
    margin-top: 8px !important;
    box-shadow: none !important;
  }
  .signoff {
    margin-top: 14px !important;
    padding-top: 10px !important;
    border-top: 1px solid rgb(241 245 249) !important;
    font-size: 13px !important;
    color: rgb(71 85 105) !important;
  }
  .footer {
    background-color: transparent !important;
    padding: 10px 0 0 0 !important;
    margin-top: 12px !important;
    text-align: left !important;
    font-size: 12px !important;
    color: rgb(148 163 184) !important;
    border-top: 1px solid rgb(241 245 249) !important;
  }
  @media (max-width: 640px) {
    .container {
      padding: 14px !important;
    }
  }
</style>
`;

const getProcessedContent = (content) => {
  if (!content) return '';
  const raw = String(content);
  const htmlEndIdx = raw.toLowerCase().indexOf('</html>');
  const bounded = htmlEndIdx !== -1 ? raw.slice(0, htmlEndIdx + 7) : raw;
  const cleaned = stripEmailEmojis(bounded);

  const isHtml = /<[a-z][\s\S]*>/i.test(cleaned);
  if (isHtml) {
    if (/<\/head>/i.test(cleaned)) {
      return cleaned.replace(/<\/head>/i, `<base target="_top">${EDITORIAL_EMAIL_STYLE}</head>`);
    }
    if (/<head>/i.test(cleaned)) {
      return cleaned.replace(/<head>/i, `<head><base target="_top">${EDITORIAL_EMAIL_STYLE}`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_top">${EDITORIAL_EMAIL_STYLE}</head><body><div class="container"><div class="content">${cleaned}</div></div></body></html>`;
  }

  const escaped = cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_top">${EDITORIAL_EMAIL_STYLE}</head><body><div class="container"><div class="content" style="white-space: pre-wrap; word-wrap: break-word;">${escaped}</div></div></body></html>`;
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
      <header className="shrink-0 border-b border-border bg-background-primary px-5 py-3 sm:px-7">
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
        <h2 className="mt-1.5 text-lg font-semibold leading-snug text-text-primary">
          {cleanSubject}
        </h2>

        {/* Sender & Recipient Meta */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
          <span>
            {t('sender', 'Gönderen')}: <span className="font-medium text-text-secondary">{email.senderEmail}</span>
          </span>
          {email.recipientEmail && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {t('recipient', 'Alıcı')}: <span className="text-text-secondary">{email.recipientEmail}</span>
              </span>
            </>
          )}
        </div>
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