import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Button from '../../common/components/ui/Button.jsx';
import TimeRangeSelector from './TimeRangeSelector.jsx';


/** White card with an optional title row (title, short description, link on the right). */
export const DashboardCard = ({ title, description, action, children, className = '' }) => (
  <section className={`rounded border border-border bg-background-primary p-5 ${className}`}>
    {(title || action) && (
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title && <h2 className="text-sm font-semibold text-text-primary">{title}</h2>}
          {description && <p className="mt-0.5 text-xs text-text-tertiary">{description}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
);

export const CardLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
  >
    {children}
    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
  </Link>
);

export const CardEmpty = ({ children }) => (
  <p className="py-10 text-center text-sm text-text-tertiary">{children}</p>
);

/** Page shell: title row with the date range on the right, then the content. */
export const DashboardShell = ({ title, subtitle, range, children }) => (
  <div className="min-h-screen bg-background-secondary">
    <PageContainer className="space-y-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
        {range && <TimeRangeSelector {...range} />}
      </div>
      {children}
    </PageContainer>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6" aria-busy="true">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {['a', 'b', 'c', 'd'].map(k => (
        <div key={k} className="space-y-3 rounded border border-border bg-background-primary p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
    <div className="rounded border border-border bg-background-primary p-5">
      <Skeleton className="h-64 w-full" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded border border-border bg-background-primary p-5"><Skeleton className="h-48 w-full" /></div>
      <div className="rounded border border-border bg-background-primary p-5"><Skeleton className="h-48 w-full" /></div>
    </div>
  </div>
);

export const DashboardError = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <Alert
      type="error"
      message={t('dash_load_error', 'Veriler yüklenemedi. Bağlantını kontrol edip tekrar dene.')}
      action={onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>{t('try_again', 'Tekrar dene')}</Button>
      )}
    />
  );
};
