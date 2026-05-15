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
    <div className="min-h-screen bg-slate-50/90">
      <div className="mx-auto max-w-[min(100%,1420px)] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {activeTab === INBOX_TABS.EMAILS && <EmailsPage embedded />}
        {activeTab === INBOX_TABS.NOTIFICATIONS && <InboxNotificationsPanel />}
        {activeTab === INBOX_TABS.CHAT && <ChatPage embedded />}
      </div>
    </div>
  );
};

export default InboxPage;
