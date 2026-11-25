import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../common/formatters.js';
import { Check, ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { Button } from '../../common/components/ui/index.js';
import { getProcessedContent, stripEmailEmojis } from '../emails.js';
import { useColorScheme } from '../../common/hooks/useColorScheme.js';
import { extractOtpFromEmailRecord } from '../../payments/utils/otp.js';

const DEFAULT_IFRAME_HEIGHT = 320;

const formatFullEmailDate = (dateString, locale = 'tr-TR') => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return formatDateTime(dateString);
    const datePart = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString(locale, {
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
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith('en') ? 'en-US' : 'tr-TR';
  const [copiedCode, setCopiedCode] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(DEFAULT_IFRAME_HEIGHT);
  const scrollContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const { colorScheme } = useColorScheme();
  const detectedCode = useMemo(() => extractOtpFromEmailRecord(email), [email]);
  const processedHtml = useMemo(
    () => getProcessedContent(email?.content, { colorScheme }),
    [email?.content, colorScheme]
  );

  const measureIframeHeight = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    const body = doc?.body;
    const html = doc?.documentElement;
    if (!body || !html) return;
    // Measure natural box height (offsetHeight + body.scrollHeight) rather than html.scrollHeight
    // so the iframe grows to eliminate internal scrollbars and can also shrink on wider viewports.
    const measured = Math.ceil(Math.max(body.offsetHeight, body.scrollHeight, html.offsetHeight));
    if (measured > 0) {
      setIframeHeight(measured + 4);
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    resizeObserverRef.current?.disconnect();
    measureIframeHeight();

    const doc = iframeRef.current?.contentDocument;
    const body = doc?.body;
    const html = doc?.documentElement;

    if (doc?.fonts?.ready) {
      doc.fonts.ready.then(measureIframeHeight).catch(() => {});
    }

    if (body && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        measureIframeHeight();
      });
      observer.observe(body);
      if (html) observer.observe(html);
      resizeObserverRef.current = observer;
    }

    doc?.querySelectorAll('img').forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', measureIframeHeight, { once: true });
        img.addEventListener('error', measureIframeHeight, { once: true });
      }
    });
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
      {/* Single compact reading header: subject, date/sender and actions in one row */}
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border-light bg-background-primary px-5 py-3.5 sm:px-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-snug text-text-primary">
            {cleanSubject}
          </h2>

          {(email.sentAt || showSender) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-text-tertiary">
              {email.sentAt && (
                <time className="tabular-nums" dateTime={email.sentAt}>
                  {formatFullEmailDate(email.sentAt, dateLocale)}
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
        </div>

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
                  <Check className="h-3.5 w-3.5 text-status-success" strokeWidth={1.5} aria-hidden />
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
      </header>

      {/* Single unified reading scroll surface for the auto-sized email body */}
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background-primary">
        <iframe
          key={`${email.id}-${colorScheme}`}
          ref={iframeRef}
          srcDoc={processedHtml}
          onLoad={handleIframeLoad}
          title={t('email_content', 'E-posta içeriği')}
          style={{ height: `${iframeHeight}px`, colorScheme }}
          className="block w-full border-0 bg-background-primary"
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

export default EmailContent;
