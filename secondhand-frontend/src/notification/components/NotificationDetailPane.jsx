import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  getNotificationConfig,
  getNotificationTargetRoute,
  formatFullDateTime,
  formatRelativeTime
} from '../notificationConstants.js';

const NotificationDetailPane = ({
  notification,
  onBackToList,
  onMarkAsRead
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const parsedMetadata = useMemo(() => {
    if (!notification?.metadata) return null;
    if (typeof notification.metadata === 'object') return notification.metadata;
    try {
      return JSON.parse(notification.metadata);
    } catch {
      return null;
    }
  }, [notification?.metadata]);

  if (!notification) {
    return (
      <div className="flex h-full min-h-[360px] flex-1 flex-col items-center justify-center gap-3.5 p-8 text-center bg-slate-50/40">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white border border-slate-200/80 shadow-xs text-slate-300">
          <Bell className="h-8 w-8 text-slate-300" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            {t('select_notification_to_read', 'Okumak İçin Bir Bildirim Seçin')}
          </h3>
          <p className="mt-1 max-w-xs text-xs text-slate-400 leading-relaxed font-medium">
            {t(
              'select_notification_desc',
              'Detayları görüntülemek ve ilgili sayfaya gitmek için soldaki listeden bir bildirim seçin.'
            )}
          </p>
        </div>
      </div>
    );
  }

  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;
  const targetRoute = getNotificationTargetRoute(notification);
  const isUnread = !notification.isRead;

  const handleActionClick = () => {
    if (isUnread) {
      onMarkAsRead?.(notification.id);
    }
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleMarkAsReadClick = () => {
    if (isUnread) {
      onMarkAsRead?.(notification.id);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white overflow-hidden">
      {/* Top Bar for Mobile Navigation & Actions */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200/90 bg-slate-50/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToList}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 lg:hidden transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('back_to_list', 'Listeye Dön')}</span>
          </button>

          <span
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.badgeClass}`}
          >
            <Icon className="h-3 w-3" />
            {config.categoryLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isUnread ? (
            <button
              type="button"
              onClick={handleMarkAsReadClick}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t('mark_as_read', 'Okundu İşaretle')}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t('read', 'Okundu')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Block */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs ${config.iconBgClass} ${config.badgeClass}`}
          >
            <Icon className="h-6 w-6" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {formatFullDateTime(notification.createdAt)}
              </span>
              <span>•</span>
              <span className="text-slate-500 font-semibold">
                ({formatRelativeTime(notification.createdAt)})
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
              {notification.title}
            </h2>
          </div>
        </div>

        {/* Message Container Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 text-slate-700 text-sm leading-relaxed whitespace-pre-line shadow-2xs font-normal">
          {notification.message || 'Bu bildirim için ek açıklama metni bulunmuyor.'}
        </div>

        {/* Dynamic Metadata Block (if present) */}
        {parsedMetadata && Object.keys(parsedMetadata).length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700">
              <Info className="h-4 w-4 text-indigo-600" />
              <span>{t('details', 'Bildirim Detayları')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(parsedMetadata).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) return null;
                return (
                  <div
                    key={key}
                    className="flex flex-col bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-100"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {key}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary Action Button Banner */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleActionClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-slate-900 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.99] transition-all"
          >
            <span>{config.actionLabel}</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailPane;
