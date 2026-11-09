import { useTranslation } from 'react-i18next';
import { AlertCircle, Check } from 'lucide-react';
import { ORDER_STATUSES } from '../../constants/orderUiConstants.js';

const MEETUP_STEPS = [
  { key: ORDER_STATUSES.PENDING, labelKey: 'order_status_pending', label: 'Sipariş Alındı' },
  { key: ORDER_STATUSES.MEETUP_PENDING, labelKey: 'order_status_meetup_pending', label: 'Buluşma Bekleniyor' },
  { key: ORDER_STATUSES.HANDOVER_CONFIRMED, labelKey: 'order_status_handover_confirmed', label: 'Teslimat Doğrulandı' },
  { key: ORDER_STATUSES.COMPLETED, labelKey: 'order_status_completed', label: 'Tamamlandı' },
];

const CARGO_STEPS = [
  { key: ORDER_STATUSES.PENDING, labelKey: 'order_status_pending', label: 'Sipariş Alındı' },
  { key: ORDER_STATUSES.CONFIRMED, labelKey: 'order_status_confirmed', label: 'Onaylandı' },
  { key: ORDER_STATUSES.PROCESSING, labelKey: 'order_status_processing', label: 'Hazırlanıyor' },
  { key: ORDER_STATUSES.SHIPPED, labelKey: 'order_status_shipped', label: 'Kargoya Verildi' },
  { key: ORDER_STATUSES.DELIVERED, labelKey: 'order_status_delivered', label: 'Teslim Edildi' },
];

const OrderStepper = ({ currentStatus, deliveryMethod }) => {
  const { t } = useTranslation();
  const steps = deliveryMethod === 'SAFE_MEETUP' ? MEETUP_STEPS : CARGO_STEPS;
  const isCompleted = currentStatus === ORDER_STATUSES.COMPLETED;
  const rawIndex = steps.findIndex((s) => s.key === currentStatus);
  const currentIndex = isCompleted ? steps.length - 1 : rawIndex !== -1 ? rawIndex : 0;
  const isFailed =
    currentStatus === ORDER_STATUSES.CANCELLED ||
    currentStatus === ORDER_STATUSES.REFUNDED ||
    currentStatus === ORDER_STATUSES.VERIFICATION_LOCKED;

  return (
    <div className="py-2">
      <ol className="relative z-0 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
        <div className="absolute left-0 top-4 z-0 hidden h-0.5 w-full bg-background-tertiary md:block" aria-hidden />
        <div
          className="absolute left-0 top-4 z-0 hidden h-0.5 bg-primary transition-all duration-200 ease-out md:block"
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
          aria-hidden
        />
        {steps.map((step, idx) => {
          const isDone = isCompleted || idx < currentIndex;
          const isCurrent = isCompleted ? idx === steps.length - 1 : idx === currentIndex;
          return (
            <li
              key={step.key}
              className="relative z-10 flex w-full items-center gap-3 md:w-auto md:flex-col md:gap-0"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border bg-background-primary text-sm tabular-nums ${isDone
                    ? 'border-primary bg-primary text-white'
                    : isCurrent
                      ? 'border-primary font-medium text-text-primary'
                      : 'border-border text-text-muted'
                  }`}
              >
                {isDone ? <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : idx + 1}
              </div>
              <span
                className={`text-sm md:mt-3 ${isDone || isCurrent ? 'font-medium text-text-primary' : 'text-text-tertiary'
                  }`}
              >
                {t(step.labelKey, step.label)}
              </span>
            </li>
          );
        })}
      </ol>
      {isFailed && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-status-error-text">
          <AlertCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden /> {t('status', 'Durum')}: {currentStatus}
        </p>
      )}
    </div>
  );
};

export default OrderStepper;
