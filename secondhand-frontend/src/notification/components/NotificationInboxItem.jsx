import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { getNotificationConfig, formatRelativeTime } from '../notificationConstants.js';

const NotificationInboxItem = ({
  notification,
  isSelected = false,
  onSelect,
  onMarkAsRead
}) => {
  const isUnread = !notification.isRead;
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const handleSelect = (e) => {
    e.preventDefault();
    onSelect?.(notification);
  };

  const handleQuickMarkRead = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(e);
        }
      }}
      className={`group relative flex w-full cursor-pointer items-start gap-3 border-b border-slate-100 p-3.5 sm:p-4 text-left transition-all duration-200 focus:outline-none ${
        isSelected
          ? 'bg-indigo-50/40 shadow-inner'
          : isUnread
          ? 'bg-white hover:bg-slate-50/80'
          : 'bg-white/70 opacity-80 hover:bg-slate-50/70 hover:opacity-100'
      }`}
    >
      {/* Left Active/Selected Accent Bar */}
      {isSelected && (
        <span
          className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r"
          aria-hidden="true"
        />
      )}

      {/* Unread Glow Dot */}
      {isUnread && (
        <span
          className="absolute left-2.5 top-5 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-indigo-100"
          title="Okunmadı"
          aria-hidden="true"
        />
      )}

      {/* Category Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
          config.iconBgClass
        } ${isUnread ? 'ml-2 sm:ml-2.5 shadow-xs' : 'ml-0'}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      {/* Text Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.badgeClass}`}
          >
            {config.badge}
          </span>
          <span className="shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <h4
          className={`text-xs sm:text-sm leading-snug truncate ${
            isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
          }`}
          title={notification.title}
        >
          {notification.title}
        </h4>

        {notification.message && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 font-normal">
            {notification.message}
          </p>
        )}
      </div>

      {/* Action / Arrow / Quick Read */}
      <div className="flex shrink-0 items-center self-center pl-1">
        {isUnread && (
          <button
            type="button"
            onClick={handleQuickMarkRead}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/70 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Okundu olarak işaretle"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        <ChevronRight
          className={`h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 ${
            isSelected ? 'text-indigo-600' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default NotificationInboxItem;
