import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import ErrorState from '../../common/components/ui/ErrorState.jsx';
import Card from '../../common/components/ui/Card.jsx';
import PageHeader from '../../common/components/ui/PageHeader.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import TimeRangeSelector from './TimeRangeSelector.jsx';

/** White card with an optional title row (title, short description, link on the right). */
export const DashboardCard = ({ title, description, action, children, className = '' }) => (
  <Card as="section" className={className}>
    {(title || action) && (
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </Card>
);

export const CardLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-1 rounded text-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
  >
    {children}
    <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
  </Link>
);

export const CardEmpty = ({ children }) => (
  <p className="py-10 text-center text-sm text-text-tertiary">{children}</p>
);

/** The KPI row: one panel, cells split by hairlines (the 1px gap shows the panel's light fill). */
export const MetricGrid = ({ children }) => (
  <div className="grid grid-cols-2 gap-px overflow-hidden rounded border border-border-light bg-border-light shadow-sm lg:grid-cols-4">
    {children}
  </div>
);

const ROLE_TABS = [
  { to: ROUTES.BUYER_DASHBOARD, labelKey: 'dash_tab_buyer', fallback: 'Alışlarım' },
  { to: ROUTES.SELLER_DASHBOARD, labelKey: 'dash_tab_seller', fallback: 'Satışlarım' },
];

const tabClass = ({ isActive }) =>
  `-mb-px inline-flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
    isActive ? 'border-primary text-text-primary' : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'
  }`;

/** Page shell: title, buyer/seller tabs with the date range on the same line, then the content. */
export const DashboardShell = ({ title, subtitle, range, children }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background-page">
      <PageContainer className="py-8">
        <PageHeader title={title} subtitle={subtitle} />
        <div className="mt-6 flex flex-col gap-3 border-b border-border-light lg:flex-row lg:items-end lg:justify-between">
          <nav className="flex gap-1" aria-label={t('dash_role_nav', 'Panel')}>
            {ROLE_TABS.map((tab) => (
              <NavLink key={tab.to} to={tab.to} end className={tabClass}>
                {t(tab.labelKey, tab.fallback)}
              </NavLink>
            ))}
          </nav>
          {range && <div className="pb-3"><TimeRangeSelector {...range} /></div>}
        </div>
        <div className="mt-6 space-y-6">{children}</div>
      </PageContainer>
    </div>
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-6" aria-busy="true">
    <MetricGrid>
      {['a', 'b', 'c', 'd'].map(k => (
        <div key={k} className="space-y-3 bg-background-primary p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </MetricGrid>
    <div className="rounded border border-border-light bg-background-primary p-5 shadow-sm">
      <Skeleton className="h-64 w-full" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded border border-border-light bg-background-primary p-5 shadow-sm"><Skeleton className="h-48 w-full" /></div>
      <div className="rounded border border-border-light bg-background-primary p-5 shadow-sm"><Skeleton className="h-48 w-full" /></div>
    </div>
  </div>
);

export const DashboardError = ({ onRetry }) => {
  const { t } = useTranslation();
  return (
    <ErrorState title={t('dash_load_error_title', 'Veriler yüklenemedi')} onRetry={onRetry} />
  );
};
