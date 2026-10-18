import { AlertCircle, Check } from 'lucide-react';
import { ORDER_STATUSES } from '../../constants/orderUiConstants.js';

const MEETUP_STEPS = [
 { key: ORDER_STATUSES.PENDING, label: 'Sipariş Alındı' },
 { key: ORDER_STATUSES.MEETUP_PENDING, label: 'Buluşma Bekleniyor' },
 { key: ORDER_STATUSES.HANDOVER_CONFIRMED, label: 'Teslimat Doğrulandı' },
 { key: ORDER_STATUSES.COMPLETED, label: 'Tamamlandı' },
];

const CARGO_STEPS = [
 { key: ORDER_STATUSES.PENDING, label: 'Sipariş Alındı' },
 { key: ORDER_STATUSES.CONFIRMED, label: 'Onaylandı' },
 { key: ORDER_STATUSES.PROCESSING, label: 'Hazırlanıyor' },
 { key: ORDER_STATUSES.SHIPPED, label: 'Kargoya Verildi' },
 { key: ORDER_STATUSES.DELIVERED, label: 'Teslim Edildi' },
];

const OrderStepper = ({ currentStatus, deliveryMethod }) => {
 const steps = deliveryMethod === 'SAFE_MEETUP' ? MEETUP_STEPS : CARGO_STEPS;
 const isCompleted = currentStatus === ORDER_STATUSES.COMPLETED;
 const rawIndex = steps.findIndex(s => s.key === currentStatus);
 const currentIndex = isCompleted ? steps.length - 1 : (rawIndex !== -1 ? rawIndex : 0);
 const isFailed = currentStatus === ORDER_STATUSES.CANCELLED || currentStatus === ORDER_STATUSES.REFUNDED || currentStatus === ORDER_STATUSES.VERIFICATION_LOCKED;

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
 <li key={step.key} className="relative z-10 flex w-full items-center gap-3 md:w-auto md:flex-col md:gap-0" aria-current={isCurrent ? 'step' : undefined}>
 <div
 className={`flex h-8 w-8 items-center justify-center rounded-full border bg-background-primary text-sm tabular-nums ${
 isDone ? 'border-primary bg-primary text-white' : isCurrent ? 'border-primary font-medium text-text-primary' : 'border-border text-text-muted'
 }`}
 >
 {isDone ? <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : idx + 1}
 </div>
 <span className={`text-sm md:mt-3 ${isDone || isCurrent ? 'font-medium text-text-primary' : 'text-text-tertiary'}`}>{step.label}</span>
 </li>
 );
 })}
 </ol>
 {isFailed && (
 <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-status-error-text">
 <AlertCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Durum: {currentStatus}
 </p>
 )}
 </div>
 );
};

export default OrderStepper;
