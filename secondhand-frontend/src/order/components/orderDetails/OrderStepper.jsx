import { useTranslation } from 'react-i18next';
import { AlertCircle, Check } from 'lucide-react';
import { ORDER_STATUSES } from '../../constants/orderUiConstants.js';

const MEETUP_STEPS = [
  { key: ORDER_STATUSES.PENDING, labelKey: 'order_status_pending', label: 'Beklemede' },
  { key: ORDER_STATUSES.MEETUP_PENDING, labelKey: 'order_status_meetup_pending', label: 'Buluşma bekleniyor' },
  { key: ORDER_STATUSES.HANDOVER_CONFIRMED, labelKey: 'order_status_handover_confirmed', label: 'Teslimat doğrulandı' },
  { key: ORDER_STATUSES.COMPLETED, labelKey: 'order_status_completed', label: 'Tamamlandı' },
];

const CARGO_STEPS = [
  { key: ORDER_STATUSES.PENDING, labelKey: 'order_status_pending', label: 'Beklemede' },
  { key: ORDER_STATUSES.CONFIRMED, labelKey: 'order_status_confirmed', label: 'Onaylandı' },
  { key: ORDER_STATUSES.PROCESSING, labelKey: 'order_status_processing', label: 'Hazırlanıyor' },
  { key: ORDER_STATUSES.SHIPPED, labelKey: 'order_status_shipped', label: 'Kargoya verildi' },
  { key: ORDER_STATUSES.DELIVERED, labelKey: 'order_status_delivered', label: 'Teslim edildi' },
];

const OrderStepper = ({ currentStatus, deliveryMethod, statusLabel }) => {
  const { t } = useTranslation();
  const steps = deliveryMethod === 'SAFE_MEETUP' ? MEETUP_STEPS : CARGO_STEPS;
  const isCompleted = currentStatus === ORDER_STATUSES.COMPLETED;
  const rawIndex = steps.findIndex((s) => s.key === currentStatus);
  const currentIndex = isCompleted ? steps.length - 1 : rawIndex !== -1 ? rawIndex : 0;
  const isFailed =
    currentStatus === ORDER_STATUSES.CANCELLED ||
    currentStatus === ORDER_STATUSES.REFUNDED ||
    currentStatus === ORDER_STATUSES.VERIFICATION_LOCKED;

  const desktopGridClass = steps.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-5';

  return (
    <div className="py-0.5">
      <ol className={`flex flex-col gap-3 md:grid ${desktopGridClass} md:gap-0`}>
        {steps.map((step, idx) => {
          const isDone = !isFailed && (isCompleted || idx < currentIndex);
          const isCurrent = !isFailed && (isCompleted ? idx === steps.length - 1 : idx === currentIndex);
          const leftActive = !isFailed && idx <= currentIndex;
          const rightActive = !isFailed && idx < currentIndex;

          return (
            <li
              key={step.key}
              className="relative flex items-center gap-3 md:flex-col md:items-center md:gap-0"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {idx > 0 && (
                <span
                  aria-hidden
                  className={`hidden md:block absolute left-0 right-1/2 top-3.5 h-0.5 transition-colors duration-150 ${
                    leftActive ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
              {idx < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`hidden md:block absolute left-1/2 right-0 top-3.5 h-0.5 transition-colors duration-150 ${
                    rightActive ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors duration-150 ${
                  isDone
                    ? 'border-primary bg-primary text-text-inverse'
                    : isCurrent
                      ? 'border-accent-teal bg-background-primary text-text-primary ring-1 ring-accent-teal'
                      : 'border-border bg-background-primary text-text-tertiary'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> : idx + 1}
              </div>
              <span
                className={`text-xs md:mt-2 md:px-1 md:text-center ${
                  isDone || isCurrent
                    ? 'font-semibold text-text-primary'
                    : 'font-normal text-text-tertiary'
                }`}
              >
                {t(step.labelKey, step.label)}
              </span>
            </li>
          );
        })}
      </ol>

      {isFailed && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-status-error-text">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{t('status', 'Durum')}: {statusLabel || currentStatus}</span>
        </p>
      )}
    </div>
  );
};

export default OrderStepper;
