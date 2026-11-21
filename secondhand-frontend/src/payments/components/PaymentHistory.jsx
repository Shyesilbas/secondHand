import { useTranslation } from "react-i18next";
import { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Receipt, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatLongDate } from '../../common/formatters.js';
import { PAYMENT_DIRECTIONS, PAYMENT_STATUSES, transactionTypeLabel } from '../paymentSchema.js';
import { Badge, EmptyState, Skeleton } from '../../common/components/ui/index.js';
import ErrorState from '../../common/components/ui/ErrorState.jsx';

const TIME_ZONE = 'Europe/Istanbul';

// Calendar day in the marketplace time zone (YYYY-MM-DD), so grouping does not drift with the browser zone.
const dayKey = (value) => (value ? new Date(value).toLocaleDateString('en-CA', { timeZone: TIME_ZONE }) : '');
const timeOf = (value) => (value
  ? new Date(value).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIME_ZONE })
  : '');

// Status matrix: money held or waiting is warning, settled is success, failed is error, refunds are neutral.
const STATUS_VARIANTS = {
  [PAYMENT_STATUSES.ESCROW]: ['warning', 'payment_status_escrow'],
  [PAYMENT_STATUSES.PENDING]: ['warning', 'payment_status_pending'],
  [PAYMENT_STATUSES.DISPUTED]: ['warning', 'payment_status_disputed'],
  [PAYMENT_STATUSES.PAID]: ['success', 'payment_status_completed'],
  [PAYMENT_STATUSES.COMPLETED]: ['success', 'payment_status_completed'],
  [PAYMENT_STATUSES.REFUNDED]: ['neutral', 'payment_status_refunded'],
  [PAYMENT_STATUSES.PARTIALLY_REFUNDED]: ['neutral', 'payment_status_partially_refunded'],
  [PAYMENT_STATUSES.FAILED]: ['error', 'payment_status_failed'],
  [PAYMENT_STATUSES.CANCELLED]: ['error', 'payment_status_cancelled'],
};

const PaymentStatusBadge = ({ payment }) => {
  const { t } = useTranslation();
  const [variant, key] = STATUS_VARIANTS[payment.status]
    ?? (payment.isSuccess ? ['success', 'payment_status_completed'] : ['error', 'payment_status_failed']);
  return <Badge variant={variant} size="sm">{t(key)}</Badge>;
};

const PaymentRow = ({ payment, onShowReceipt }) => {
  const { t } = useTranslation();
  const isIncoming = payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING;
  const isEscrow = payment.status === PAYMENT_STATUSES.ESCROW;
  const Icon = isEscrow ? ShieldCheck : isIncoming ? ArrowDownLeft : ArrowUpRight;
  const counterpart = isIncoming ? payment.senderDisplayName : payment.receiverDisplayName;
  const meta = [timeOf(payment.processedAt || payment.createdAt), payment.listingTitle || counterpart].filter(Boolean).join(' · ');

  return (
    <li>
      <button
        type="button"
        onClick={() => onShowReceipt(payment)}
        className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus"
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isIncoming ? 'bg-status-success-bg text-status-success-text' : 'bg-background-secondary text-text-secondary'}`}>
          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-text-primary">
            {transactionTypeLabel(t, payment.transactionType)}
          </span>
          <span className="block truncate text-sm text-text-tertiary tabular-nums">{meta}</span>
        </span>
        <span className="hidden shrink-0 sm:block">
          <PaymentStatusBadge payment={payment} />
        </span>
        <span className="flex shrink-0 flex-col items-end">
          <span className={`text-sm font-semibold tabular-nums ${isIncoming ? 'text-status-success-text' : 'text-text-primary'}`}>
            {isIncoming ? '+' : '−'}{formatCurrency(payment.amount, payment.currency)}
          </span>
          <span className="sm:hidden"><PaymentStatusBadge payment={payment} /></span>
        </span>
        <ChevronRight className="hidden h-4 w-4 shrink-0 text-text-tertiary transition-colors group-hover:text-text-secondary sm:block" strokeWidth={1.5} aria-hidden />
      </button>
    </li>
  );
};

const HistorySkeleton = () => (
  <div className="divide-y divide-border-light" aria-hidden>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-5 py-3.5">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
);

/** Transactions grouped by day (newest first, as the backend sends them); a row opens the receipt. */
const PaymentHistory = ({ payments, onShowReceipt, hasActiveFilters, onClearFilters, isLoading, error, onRetry }) => {
  const { t } = useTranslation();

  const groups = useMemo(() => {
    const today = dayKey(new Date());
    const yesterday = dayKey(Date.now() - 24 * 60 * 60 * 1000);
    const out = [];
    for (const payment of payments ?? []) {
      const at = payment.processedAt || payment.createdAt;
      const key = dayKey(at);
      let group = out[out.length - 1];
      if (!group || group.key !== key) {
        const label = key === today ? t('today') : key === yesterday ? t('yesterday') : formatLongDate(at);
        group = { key, label, items: [] };
        out.push(group);
      }
      group.items.push(payment);
    }
    return out;
  }, [payments, t]);

  if (isLoading) return <HistorySkeleton />;
  if (error) {
    return <ErrorState bordered={false} title={t('payments_load_failed')} description={error} onRetry={onRetry} />;
  }
  if (!payments?.length) {
    return (
      <EmptyState
        icon={Receipt}
        title={t("no_activity_found")}
        description={hasActiveFilters ? t("no_transactions_match_filters") : t("transaction_history_empty")}
        primaryAction={hasActiveFilters ? { label: t("reset_filters"), onClick: onClearFilters } : undefined}
        className="border-0"
      />
    );
  }

  return (
    <div>
      {groups.map((group, index) => (
        <section key={group.key || 'unknown'} aria-label={group.label}>
          <h3 className={`border-b border-border-light bg-background-secondary px-5 py-2 text-sm font-medium text-text-secondary ${index > 0 ? 'border-t' : ''}`}>
            {group.label}
          </h3>
          <ul className="divide-y divide-border-light">
            {group.items.map((payment, idx) => (
              <PaymentRow key={payment.paymentId || payment.id || idx} payment={payment} onShowReceipt={onShowReceipt} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default PaymentHistory;
