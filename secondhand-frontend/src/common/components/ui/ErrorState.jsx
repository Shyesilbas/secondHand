import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CloudOff, RotateCw } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Error state for content that failed to load: it takes the place of the list or section, like
 * EmptyState, instead of a red banner. Neutral surface, one error-tinted icon, a short reason and a
 * retry button. For a failed action or form submit use `Alert` instead.
 *
 * `size="compact"` is a single row for small panels (a tab, a sidebar block, a list inside a card).
 */
const ErrorState = ({
  title,
  description,
  onRetry,
  size = 'default',
  bordered = true,
  className = ''
}) => {
  const { t } = useTranslation();
  const [retrying, setRetrying] = useState(false);
  const heading = title || t('error_state_title', 'İçerik yüklenemedi');
  const body = description === undefined ? t('error_state_desc', 'Bağlantını kontrol edip tekrar dene.') : description;

  const retry = onRetry ? async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  } : null;

  const retryButton = retry && (
    <Button variant="secondary" size="sm" onClick={retry} disabled={retrying} className="shrink-0">
      <RotateCw className={`h-4 w-4 ${retrying ? 'animate-spin motion-reduce:animate-none' : ''}`} strokeWidth={1.5} aria-hidden />
      {t('try_again', 'Tekrar dene')}
    </Button>
  );
  const surface = bordered ? 'rounded border border-border-light bg-background-primary shadow-sm' : '';
  const icon = (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-error-bg text-status-error-text">
      <CloudOff className="h-5 w-5" strokeWidth={1.5} aria-hidden />
    </span>
  );

  if (size === 'compact') {
    return (
      <div role="alert" className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${surface} ${className}`}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {icon}
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">{heading}</p>
            {body && <p className="text-sm text-text-secondary">{body}</p>}
          </div>
        </div>
        {retryButton}
      </div>
    );
  }

  return (
    <div role="alert" className={`flex flex-col items-center px-6 py-10 text-center ${surface} ${className}`}>
      {icon}
      <p className="mt-3 text-base font-semibold text-text-primary">{heading}</p>
      {body && <p className="mt-1 max-w-md text-sm text-text-secondary">{body}</p>}
      {retryButton && <div className="mt-5">{retryButton}</div>}
    </div>
  );
};

export default ErrorState;
