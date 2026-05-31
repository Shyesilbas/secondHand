import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmailsPage from '../../emails/pages/EmailsPage.jsx';
import ChatPage from '../../chat/pages/ChatPage.jsx';
import InboxNotificationsPanel from '../../notification/components/InboxNotificationsPanel.jsx';
import { INBOX_TABS, normalizeInboxTab } from '../inboxConstants.js';

const InboxPage = () => {
  const [searchParams] = useSearchParams();
  const activeTab = useMemo(() => normalizeInboxTab(searchParams.get('tab')), [searchParams]);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-70px)] bg-slate-50/90 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 mx-auto w-full max-w-[min(100%,1420px)] p-4 sm:p-6 lg:p-8">
        {activeTab === INBOX_TABS.EMAILS && <EmailsPage embedded />}
        {activeTab === INBOX_TABS.NOTIFICATIONS && <InboxNotificationsPanel />}
        {activeTab === INBOX_TABS.CHAT && <ChatPage embedded />}
      </div>
    </div>
  );
};

export default InboxPage;
