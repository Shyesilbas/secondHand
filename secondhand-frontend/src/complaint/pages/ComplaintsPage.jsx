import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSearch, ShieldAlert } from 'lucide-react';
import PageContainer from '@/common/components/layout/PageContainer';
import { Alert, Button, EmptyState, PageHeader, Skeleton, Tabs } from '../../common/components/ui/index.js';
import { useMyComplaints, useReceivedComplaints } from '../hooks/useComplaints.js';
import { getComplaintErrorMessage } from '../utils/complaintError.js';
import { COMPLAINT_TABS } from '../complaintConstants.js';
import ComplaintCard from '../components/ComplaintCard.jsx';
import ComplaintDetailModal from '../components/ComplaintDetailModal.jsx';
import AppealModal from '../components/AppealModal.jsx';
import RestrictionBanner from '../components/RestrictionBanner.jsx';

const ComplaintsPage = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(COMPLAINT_TABS.FILED);
  const [appealing, setAppealing] = useState(null);
  // Only the id is kept locally; the complaint itself is read from the query so the modal reflects server state.
  const [openedId, setOpenedId] = useState(null);
  const filed = useMyComplaints({ enabled: tab === COMPLAINT_TABS.FILED });
  const received = useReceivedComplaints({ enabled: tab === COMPLAINT_TABS.RECEIVED });
  const query = tab === COMPLAINT_TABS.FILED ? filed : received;
  const complaints = query.data || [];
  const opened = complaints.find((c) => c.complaintId === openedId) || null;

  const tabs = [
    { key: COMPLAINT_TABS.FILED, label: t('complaints_filed', 'Filed by me') },
    { key: COMPLAINT_TABS.RECEIVED, label: t('complaints_received', 'About me') },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="border-b border-border-light bg-background-secondary">
        <PageContainer className="py-4">
          <PageHeader
            icon={ShieldAlert}
            title={t('my_complaints')}
            subtitle={t('track_and_manage_your_submissions_to_our')}
          />
        </PageContainer>
        <PageContainer>
          <Tabs
            items={tabs}
            activeKey={tab}
            onChange={setTab}
            ariaLabel={t('complaint_views', 'Complaint views')}
            borderBottom={false}
          />
        </PageContainer>
      </div>

      <PageContainer className="space-y-6 pb-10 pt-6">
        <RestrictionBanner />
        {query.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
          </div>
        ) : query.isError ? (
          <Alert
            type="error"
            message={getComplaintErrorMessage(query.error, t('unable_to_load_complaints'))}
            action={<Button variant="secondary" size="sm" onClick={() => query.refetch()}>{t('try_again')}</Button>}
          />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title={tab === COMPLAINT_TABS.FILED ? t('no_complaints_submitted') : t('no_complaints_received', 'No complaints about you')}
            description={tab === COMPLAINT_TABS.FILED
              ? t('if_you_encounter_inappropriate_behavior_')
              : t('no_complaints_received_hint', 'Complaints decided against you would appear here.')}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((complaint) => (
              <ComplaintCard
                key={complaint.complaintId}
                complaint={complaint}
                side={tab}
                onOpen={(c) => setOpenedId(c.complaintId)}
                onAppeal={setAppealing}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <ComplaintDetailModal
        complaint={opened}
        side={tab}
        isOpen={Boolean(opened)}
        onClose={() => setOpenedId(null)}
      />
      <AppealModal complaint={appealing} isOpen={Boolean(appealing)} onClose={() => setAppealing(null)} />
    </div>
  );
};

export default ComplaintsPage;
