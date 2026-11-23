import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import AgreementCard from '../components/AgreementCard.jsx';
import AgreementModal from '../components/AgreementModal.jsx';
import { agreementService } from '../services/agreementService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { Card, EmptyState, SkeletonList, Tabs } from '../../common/components/ui/index.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

const AgreementsList = ({
  agreements,
  userAgreements,
  loading,
  filter,
  setFilter,
  onAccepted
}) => {
  const { t } = useTranslation();
  const [acceptingAgreement, setAcceptingAgreement] = useState(null);
  const [modalAgreement, setModalAgreement] = useState(null);
  const notification = useNotification();

  const handleAcceptAgreement = async (agreement) => {
    try {
      setAcceptingAgreement(agreement.agreementId);
      await agreementService.acceptAgreement({
        agreementId: agreement.agreementId,
        isAcceptedTheLastVersion: true
      });
      notification.showSuccess(null, t('agreement_accepted_success', 'Sözleşme onaylandı.'), { toast: true });
      onAccepted?.();
    } catch (err) {
      notification.showError(null, getErrorMessage(err, t('agreement_accept_failed', 'Sözleşme onaylanamadı.')), { toast: true });
    } finally {
      setAcceptingAgreement(null);
    }
  };

  const getUserAgreementStatus = (agreementId) => {
    const ua = userAgreements.find((item) => item.agreementId === agreementId);
    if (ua?.isAcceptedTheLastVersion) {
      return {
        status: 'accepted',
        text: t('agreement_status_accepted', 'Onaylandı'),
        acceptedDate: ua.acceptedDate,
      };
    }
    return {
      status: 'pending',
      text: t('agreement_status_pending', 'Onay bekliyor'),
    };
  };

  const counts = useMemo(() => {
    const result = { all: 0, pending: 0, accepted: 0 };
    for (const a of agreements) {
      result.all += 1;
      const ua = userAgreements.find((u) => u.agreementId === a.agreementId);
      if (ua?.isAcceptedTheLastVersion) {
        result.accepted += 1;
      } else {
        result.pending += 1;
      }
    }
    return result;
  }, [agreements, userAgreements]);

  const filteredAgreements = useMemo(() => {
    return agreements.filter((agreement) => {
      const ua = userAgreements.find((item) => item.agreementId === agreement.agreementId);
      const isAcceptedLatest = ua?.isAcceptedTheLastVersion === true;
      if (filter === 'pending') return !isAcceptedLatest;
      if (filter === 'accepted') return isAcceptedLatest;
      return true;
    });
  }, [agreements, userAgreements, filter]);

  if (loading) {
    return (
      <Card padding="none" className="divide-y divide-border-light overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-4 sm:p-5">
            <SkeletonList rows={1} />
          </div>
        ))}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          variant="underline"
          borderBottom={false}
          ariaLabel={t('agreements', 'Sözleşmeler')}
          activeKey={filter}
          onChange={setFilter}
          items={[
            { key: 'all', label: t('all', 'Tümü'), count: counts.all },
            {
              key: 'pending',
              label: t('agreement_status_pending', 'Onay bekliyor'),
              count: counts.pending,
              highlight: counts.pending > 0,
            },
            { key: 'accepted', label: t('agreement_status_accepted', 'Onaylandı'), count: counts.accepted },
          ]}
        />

        {counts.all > 0 && (
          <span className="text-sm tabular-nums text-text-tertiary">
            {t('agreements_accepted_summary', {
              defaultValue: '{{accepted}} / {{total}} onaylandı',
              accepted: counts.accepted,
              total: counts.all,
            })}
          </span>
        )}
      </div>

      {filteredAgreements.length === 0 ? (
        <EmptyState
          icon={FileText}
          size="compact"
          titleAs="h2"
          title={t('no_agreements_match_this_filter', 'Bu filtreye uyan sözleşme bulunamadı')}
          className="shadow-sm"
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <ul role="list" className="divide-y divide-border-light">
            {filteredAgreements.map((agreement) => {
              const status = getUserAgreementStatus(agreement.agreementId);
              return (
                <AgreementCard
                  key={agreement.agreementId}
                  agreement={agreement}
                  status={status}
                  onAccept={handleAcceptAgreement}
                  accepting={acceptingAgreement === agreement.agreementId}
                  onRead={setModalAgreement}
                />
              );
            })}
          </ul>
        </Card>
      )}

      {modalAgreement && (
        <AgreementModal
          open={Boolean(modalAgreement)}
          agreement={modalAgreement}
          onClose={() => setModalAgreement(null)}
          onAccept={async (agreement) => {
            await handleAcceptAgreement(agreement);
            setModalAgreement(null);
          }}
          accepting={acceptingAgreement === modalAgreement.agreementId}
          isAccepted={getUserAgreementStatus(modalAgreement.agreementId).status === 'accepted'}
        />
      )}
    </div>
  );
};

export default AgreementsList;