import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useInAppNotificationsContext } from '../../notification/InAppNotificationContext.jsx';
import { useBadgeCounts } from '../../common/hooks/useBadgeCounts.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import EmailsPage from '../../emails/pages/EmailsPage.jsx';
import ChatPage from '../../chat/pages/ChatPage.jsx';
import InboxNotificationsPanel from '../../notification/components/InboxNotificationsPanel.jsx';
import { INBOX_TABS, normalizeInboxTab } from '../inboxConstants.js';

const InboxPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthState();
  const { unreadCount: inAppUnread } = useInAppNotificationsContext();
  const { emailCount, chatCount } = useBadgeCounts({ enabled: isAuthenticated, userId: user?.id });

  const activeTab = useMemo(() => normalizeInboxTab(searchParams.get('tab')), [searchParams]);

  const setTab = useCallback(
    (tab) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', tab);
          if (tab !== INBOX_TABS.CHAT) {
            next.delete('room');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const tabDef = useMemo(
    () => [
      { id: INBOX_TABS.EMAILS, label: 'Mail', icon: Mail, count: emailCount },
      { id: INBOX_TABS.NOTIFICATIONS, label: 'Notifications', icon: Bell, count: inAppUnread },
      { id: INBOX_TABS.CHAT, label: 'Chat', icon: MessageSquare, count: chatCount },
    ],
    [emailCount, inAppUnread, chatCount]
  );

  return (
    <div className="min-h-screen bg-slate-50/90">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/5">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 border-l-[3px] border-teal-700 pl-3">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Inbox</h1>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">Mail, alerts and messages in one place.</p>
            </div>
          </div>

          <div className="border-b border-slate-100 px-3 py-3 sm:px-4">
            <div className="inline-flex w-full max-w-xl rounded-2xl bg-slate-100 p-1 sm:w-auto">
              {tabDef.map(({ id, label, icon, count }) => {
                const TabIcon = icon;
                return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition sm:flex-initial sm:px-4 sm:text-sm ${
                    activeTab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TabIcon className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      activeTab === id ? 'bg-slate-200/80 text-slate-600' : 'bg-slate-200/60 text-slate-500'
                    }`}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                </button>
              );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === INBOX_TABS.EMAILS && <EmailsPage embedded />}
          {activeTab === INBOX_TABS.NOTIFICATIONS && <InboxNotificationsPanel />}
          {activeTab === INBOX_TABS.CHAT && <ChatPage embedded />}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
