import { useTranslation } from "react-i18next";
import { Bell, CheckCheck, RefreshCw, Loader2 } from 'lucide-react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';
import NotificationItem from './NotificationItem.jsx';
const MS_BORDER = '#edebe9';
const MS_HEADER = '#f3f2f1';

/** Tam sayfa bildirim listesi — Mailbox ile aynı kabuk ve üst şerit. */
const InboxNotificationsPanel = () => {
  const {
    t
  } = useTranslation();
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch
  } = useInAppNotificationsContext();
  if (isLoading) {
    return <div className="flex h-[clamp(540px,min(88vh,920px))] flex-col overflow-hidden rounded-2xl border border-border-light/80 bg-background-primary shadow-lg shadow-slate-100/50">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-100 bg-slate-50/60 px-5" />
        <div className="flex flex-1 items-center justify-center px-6 text-sm text-slate-400 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />{t("bildirimler_y_kleniyor")}</div>
      </div>;
  }
  return <div className="flex h-[clamp(540px,min(88vh,920px))] flex-col overflow-hidden rounded-2xl border border-border-light/80 bg-background-primary/95 backdrop-blur-xl shadow-lg shadow-slate-100/40 relative">
      {/* Premium Header Bar */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100/90 bg-slate-50/70 px-5 sm:px-6 relative z-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-primary text-primary shadow-sm">
            <Bell className="h-5 w-5 animate-[swing_1s_ease-in-out_infinite]" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-text-primary truncate tracking-tight">{t("bildirim_kutusu")}</h1>
            <p className="truncate text-xs text-slate-400 font-medium mt-0.5">
              {notifications?.length ? `${notifications.length} bildirim mevcut` : 'Uyarilar ve güncellemeleriniz'}
            </p>
          </div>
          {unreadCount > 0 && <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white shadow-sm shadow-indigo-900/10">
              {unreadCount > 99 ? '99+' : unreadCount}{t("yeni")}</span>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => refetch()} className="p-2 text-slate-400 hover:text-primary rounded-xl hover:bg-indigo-50 border border-transparent hover:border-primary/50 transition-all shadow-none hover:shadow-sm" title={t("yenile")}>
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          {unreadCount > 0 && <button type="button" onClick={markAllAsRead} className="inline-flex items-center gap-1.5 rounded-xl border border-border-light/80 bg-background-primary px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100" title={t("hepsini_okundu_olarak_i_aretle")}>
              <CheckCheck className="h-4 w-4 text-status-success" />
              <span className="hidden sm:inline">{t("hepsini_okundu_yap")}</span>
            </button>}
        </div>
      </header>

      {notifications.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center bg-gradient-to-b from-white to-slate-50/30">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-border-light/80 flex items-center justify-center mb-4 shadow-sm">
            <Bell className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-sm font-medium text-text-primary tracking-tight">{t("harika_her_ey_yolunda")}</h3>
          <p className="max-w-xs text-sm text-slate-400 leading-relaxed font-medium">{t("u_anda_yeni_bir_bildiriminiz_yok_teklifl")}</p>
        </div> : <div className="min-h-0 flex-1 overflow-y-auto bg-background-primary divide-y divide-slate-100/50">
          {notifications.map(n => <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} />)}
        </div>}
    </div>;
};
export default InboxNotificationsPanel;