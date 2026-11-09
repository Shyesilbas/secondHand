import PageContainer from '@/common/components/layout/PageContainer';
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
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background-secondary">
      <PageContainer className={`flex flex-col flex-1 min-h-0 w-full max-w-screen-2xl ${activeTab === INBOX_TABS.EMAILS ? 'px-2 py-2 sm:px-4 sm:py-2.5 lg:px-6' : 'py-3 sm:py-4'}`}>
        {activeTab === INBOX_TABS.EMAILS && <EmailsPage embedded />}
        {activeTab === INBOX_TABS.NOTIFICATIONS && <InboxNotificationsPanel />}
        {activeTab === INBOX_TABS.CHAT && <ChatPage embedded />}
      </PageContainer>
    </div>
  );
};

export default InboxPage;
