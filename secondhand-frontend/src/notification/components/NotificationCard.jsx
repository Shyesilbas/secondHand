import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight
} from 'lucide-react';
import {
  getNotificationConfig,
  getNotificationTargetRoute,
  formatRelativeTime
} from '../notificationConstants.js';

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  const isUnread = !notification.isRead;
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;
  const targetRoute = getNotificationTargetRoute(notification);

  const parsedMetadata = useMemo(() => {
    if (!notification?.metadata) return null;
    if (typeof notification.metadata === 'object') return notification.metadata;
    try {
      return JSON.parse(notification.metadata);
    } catch {
      return null;
    }
  }, [notification?.metadata]);

  const handleCardClick = () => {
    if (isUnread) {
      onMarkAsRead?.(notification.id);
    }
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleQuickMarkRead = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative flex flex-col gap-3 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isUnread
          ? 'bg-white border-l-4 border-l-indigo-600 border-y border-r border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
          : 'bg-white/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs opacity-90 hover:opacity-100'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon Badge */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${
              config.iconBgClass
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${config.badgeClass}`}
              >
                {config.badge}
              </span>

              {isUnread && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  Yeni
                </span>
              )}
            </div>

            <h3
              className={`text-sm sm:text-base mt-1 truncate tracking-tight ${
                isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
              }`}
              title={notification.title}
            >
              {notification.title}
            </h3>
          </div>
        </div>

        {/* Right Info & Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium text-slate-400 tabular-nums whitespace-nowrap">
            {formatRelativeTime(notification.createdAt)}
          </span>

          {isUnread && (
            <button
              type="button"
              onClick={handleQuickMarkRead}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-all border border-transparent hover:border-slate-200"
              title="Okundu olarak işaretle"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Body */}
      {notification.message && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-0 sm:pl-13">
          {notification.message}
        </p>
      )}

      {/* Metadata Chips if present */}
      {parsedMetadata && Object.keys(parsedMetadata).length > 0 && (
        <div className="flex flex-wrap gap-2 pl-0 sm:pl-13 pt-1">
          {Object.entries(parsedMetadata).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600"
              >
                <span className="text-slate-400 font-semibold">{key}:</span>
                <span className="text-slate-800 font-bold truncate max-w-[200px]">
                  {String(value)}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Bottom Action Strip */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 mt-1 pl-0 sm:pl-13">
        <span className="text-[11px] font-medium text-slate-400">
          {config.categoryLabel}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-all"
        >
          <span>{config.actionLabel}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
