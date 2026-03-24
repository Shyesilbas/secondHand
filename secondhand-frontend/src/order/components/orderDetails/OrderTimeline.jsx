import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Home,
  Package2,
  Timer,
  Truck,
} from 'lucide-react';
import { ORDER_STATUSES, ORDER_TIME } from '../../constants/orderUiConstants.js';

const DeliveryCountdown = ({ deliveredAt }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!deliveredAt) return;

    const update = () => {
      const deadline = new Date(new Date(deliveredAt).getTime() + ORDER_TIME.DELIVERY_CONFIRMATION_WINDOW_MS);
      const diff = deadline - new Date();
      if (diff <= 0) {
        setTimeRemaining({ expired: true });
        return;
      }
      setTimeRemaining({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };

    update();
    const timer = setInterval(update, ORDER_TIME.SECOND_MS);
    return () => clearInterval(timer);
  }, [deliveredAt]);

  if (!timeRemaining) return null;

  const critical = !timeRemaining.expired;
  const cardClass = `rounded-2xl border backdrop-blur-sm transition-all mt-5 p-4 ${
    critical
      ? 'bg-slate-900 text-white border-white/10 shadow-lg shadow-slate-900/10'
      : 'bg-white/80 border-slate-200/60 shadow-sm'
  }`;

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md ${critical ? 'bg-white/10' : 'bg-slate-200'}`}>
            <Timer className={`w-3.5 h-3.5 ${critical ? 'text-emerald-400' : 'text-slate-600'}`} />
          </div>
          <div>
            <p className={`text-xs font-semibold ${critical ? 'text-white' : 'text-slate-900'}`}>Confirmation Window</p>
            <p className={`text-[11px] font-medium mt-0.5 ${critical ? 'text-slate-400' : 'text-slate-500'}`}>
              {timeRemaining.expired ? 'Window closed. Order finalizing...' : 'Verify your items before the timer ends'}
            </p>
          </div>
        </div>
        {critical ? (
          <div className="flex gap-1.5 items-baseline">
            <span className="text-lg font-mono font-semibold text-emerald-400">{String(timeRemaining.h).padStart(2, '0')}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">h</span>
            <span className="text-lg font-mono font-semibold text-emerald-400">{String(timeRemaining.m).padStart(2, '0')}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">m</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const OrderProgressStepper = ({ currentStatus, variant = 'compact' }) => {
  const steps = [
    { key: ORDER_STATUSES.PENDING, label: 'Placed', icon: Clock },
    { key: ORDER_STATUSES.CONFIRMED, label: 'Confirmed', icon: CheckCircle2 },
    { key: ORDER_STATUSES.PROCESSING, label: 'Preparing', icon: Package2 },
    { key: ORDER_STATUSES.SHIPPED, label: 'On Way', icon: Truck },
    { key: ORDER_STATUSES.DELIVERED, label: 'Delivered', icon: Home },
    { key: ORDER_STATUSES.COMPLETED, label: 'Finalized', icon: Check },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStatus);
  const isFailed = currentStatus === ORDER_STATUSES.CANCELLED || currentStatus === ORDER_STATUSES.REFUNDED;

  if (variant === 'wide') {
    return (
      <div className="py-8 px-2">
        <div className="relative flex justify-between">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-10" />
          <div
            className="absolute top-5 left-0 h-[2px] bg-emerald-500 transition-all duration-1000 -z-10"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center group">
                <div className="relative">
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" aria-hidden />
                  )}
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100'
                        : 'bg-white/90 backdrop-blur-sm border-slate-200/80 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-500/30 ring-offset-2 ring-offset-white' : ''}`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5px]" />
                  </div>
                </div>
                <span
                  className={`mt-3 text-[11px] font-semibold uppercase tracking-tight ${
                    isDone ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        {isFailed ? (
          <div className="mt-4 flex justify-center">
            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full border border-rose-100 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Status: {currentStatus}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="py-6 px-1">
      <div className="relative flex items-center">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center group relative z-10">
                <div className="relative">
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" aria-hidden />
                  )}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'bg-white/90 backdrop-blur-sm border-slate-200/80 text-slate-400'
                    } ${isCurrent ? 'ring-2 ring-emerald-500/30 ring-offset-1' : ''}`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium uppercase tracking-wide ${
                    isDone ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast ? (
                <div className="flex-1 mx-1.5 relative" style={{ height: '1.5px' }}>
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-100" />
                  {isDone ? <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 w-full" /> : null}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      {isFailed ? (
        <div className="mt-4 flex justify-center">
          <span className="px-2.5 py-1 bg-rose-50/80 text-rose-600 text-[10px] font-medium rounded-md border border-rose-200/60 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" /> {currentStatus}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export { DeliveryCountdown, OrderProgressStepper };
