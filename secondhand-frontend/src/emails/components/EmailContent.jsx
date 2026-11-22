import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../common/formatters.js';
import { Check, ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { Badge, Button } from '../../common/components/ui/index.js';
import { EMAIL_TYPE_BADGE_VARIANTS, EMAIL_TYPE_LABELS, getProcessedContent, stripEmailEmojis } from '../emails.js';
import { extractOtpFromEmailRecord } from '../../payments/utils/otp.js';

const DEFAULT_IFRAME_HEIGHT = 320;

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
  const [iframeHeight, setIframeHeight] = useState(DEFAULT_IFRAME_HEIGHT);
  const scrollContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const detectedCode = useMemo(() => extractOtpFromEmailRecord(email), [email]);
  const processedHtml = useMemo(() => getProcessedContent(email?.content), [email?.content]);

  const measureIframeHeight = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    const body = doc?.body;
    if (!body) return;
    const measured = Math.ceil(body.scrollHeight);
    if (measured > 0) {
      setIframeHeight(measured + 8);
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    resizeObserverRef.current?.disconnect();
    measureIframeHeight();

    const body = iframeRef.current?.contentDocument?.body;
    if (body && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        measureIframeHeight();
      });
      observer.observe(body);
      resizeObserverRef.current = observer;
    }
  }, [measureIframeHeight]);

  useEffect(() => {
    setCopiedCode(false);
    setIframeHeight(DEFAULT_IFRAME_HEIGHT);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [email?.id]);

  useEffect(() => () => {
    resizeObserverRef.current?.disconnect();
  }, []);

  if (!email) return null;

  const cleanSubject = stripEmailEmojis(email.subject || '').trim() || t('untitled_email', '(Başlıksız e-posta)');
  const categoryLabel = EMAIL_TYPE_LABELS[email.emailType] || email.emailType || t('email', 'Bildirim');
  const badgeVariant = EMAIL_TYPE_BADGE_VARIANTS[email.emailType] || 'neutral';
  const showSender = Boolean(email.senderEmail && !email.senderEmail.toLowerCase().includes('noreply'));

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
      {/* Slim fixed utility bar: keeps navigation and delete reachable without consuming reading height */}
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border-light bg-background-primary px-5 sm:px-6">
        <Badge variant={badgeVariant} dot>
          {categoryLabel}
        </Badge>

        <div className="flex shrink-0 items-center gap-1">
          {detectedCode && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCode}
              title={t('copy_verification_code', 'Doğrulama kodunu kopyala')}
              className="mr-1 tabular-nums"
            >
              {copiedCode ? (
                <>
                  <Check className="h-3.5 w-3.5 text-status-success" strokeWidth={1.75} aria-hidden />
                  <span>{t('copied', 'Kopyalandı')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  <span>{t('copy_code', 'Kodu kopyala')}: {detectedCode}</span>
                </>
              )}
            </Button>
          )}

          {(onSelectPrev || onSelectNext) && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSelectPrev}
                disabled={!hasPrev}
                title={t('previous_email', 'Önceki e-posta')}
                aria-label={t('previous_email', 'Önceki e-posta')}
              >
                <ChevronUp className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSelectNext}
                disabled={!hasNext}
                title={t('next_email', 'Sonraki e-posta')}
                aria-label={t('next_email', 'Sonraki e-posta')}
              >
                <ChevronDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </Button>
            </>
          )}

          {onDelete && (
            <Button
              variant="danger"
              size="icon"
              onClick={() => onDelete(email.id, cleanSubject)}
              disabled={isDeleting}
              title={t('delete', 'Sil')}
              aria-label={`${t('delete_email', 'E-postayı sil')}: ${cleanSubject}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {/* Single unified reading scroll surface: subject, metadata and auto-sized email body scroll together */}
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background-primary">
        <header className="px-5 pt-5 pb-4 sm:px-6">
          <h2 className="text-xl font-semibold leading-snug text-text-primary">
            {cleanSubject}
          </h2>

          {(email.sentAt || showSender) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-tertiary">
              {email.sentAt && (
                <time className="tabular-nums" dateTime={email.sentAt}>
                  {formatFullEmailDate(email.sentAt)}
                </time>
              )}
              {email.sentAt && showSender && <span aria-hidden>·</span>}
              {showSender && (
                <span>
                  {t('sender', 'Gönderen')}: <span className="font-medium text-text-secondary">{email.senderEmail}</span>
                </span>
              )}
            </div>
          )}

          <div className="mt-4 border-b border-border-light" />
        </header>

        <iframe
          ref={iframeRef}
          srcDoc={processedHtml}
          onLoad={handleIframeLoad}
          title={t('email_content', 'E-posta içeriği')}
          style={{ height: `${iframeHeight}px` }}
          className="block w-full border-0"
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

export default EmailContent;
