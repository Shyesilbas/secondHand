import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import AgreementCard from '../components/AgreementCard.jsx';
import AgreementModal from '../components/AgreementModal.jsx';
import { Check as CheckIcon, Clock as ClockIcon } from 'lucide-react';
import { agreementService } from '../services/agreementService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { SkeletonList } from '../../common/components/ui/index.js';
const FILTER_TABS = [{
  key: 'all',
  label: 'All'
}, {
  key: 'pending',
  label: 'Pending',
  dotColor: 'bg-status-warning'
}, {
  key: 'accepted',
  label: 'Accepted',
  dotColor: 'bg-status-success'
}];
const AgreementsList = ({
  agreements,
  userAgreements,
  loading,
  filter,
  setFilter,
  onAccepted
}) => {
  const {
    t
  } = useTranslation();
  const [acceptingAgreement, setAcceptingAgreement] = useState(null);
  const [modalAgreement, setModalAgreement] = useState(null);
  const notification = useNotification();
  const handleAcceptAgreement = async agreement => {
    try {
      setAcceptingAgreement(agreement.agreementId);
      await agreementService.acceptAgreement({
        agreementId: agreement.agreementId,
        isAcceptedTheLastVersion: true
      });
      notification.showSuccess('Success', 'Agreement accepted.');
      if (onAccepted) onAccepted();
    } catch (err) {
      console.error('Failed to accept agreement', err);
      notification.showError('Error', 'Failed to accept agreement.');
    } finally {
      setAcceptingAgreement(null);
    }
  };
  const getUserAgreementStatus = agreementId => {
    const ua = userAgreements.find(ua => ua.agreementId === agreementId);
    if (!ua) return {
      status: 'pending',
      text: 'Pending',
      icon: ClockIcon,
      color: 'text-status-warning',
      bgColor: 'bg-status-warning-bg',
      borderColor: 'border-status-warning-border'
    };
    if (ua.isAcceptedTheLastVersion) return {
      status: 'accepted',
      text: 'Accepted',
      icon: CheckIcon,
      color: 'text-status-success',
      bgColor: 'bg-status-success-bg',
      borderColor: 'border-status-success-border',
      acceptedDate: ua.acceptedDate
    };
    return {
      status: 'pending',
      text: 'Pending',
      icon: ClockIcon,
      color: 'text-status-warning',
      bgColor: 'bg-status-warning-bg',
      borderColor: 'border-status-warning-border'
    };
  };
  const counts = useMemo(() => {
    const result = {
      all: 0,
      pending: 0,
      accepted: 0
    };
    for (const a of agreements) {
      result.all += 1;
      const ua = userAgreements.find(u => u.agreementId === a.agreementId);
      if (!ua) {
        result.pending += 1;
        continue;
      }
      if (ua.isAcceptedTheLastVersion) {
        result.accepted += 1;
        continue;
      }
      result.pending += 1;
    }
    return result;
  }, [agreements, userAgreements]);
  const filteredAgreements = useMemo(() => {
    return agreements.filter(agreement => {
      const ua = userAgreements.find(ua => ua.agreementId === agreement.agreementId);
      const isAcceptedLatest = ua?.isAcceptedTheLastVersion === true;
      if (filter === 'all') return true;
      if (filter === 'pending') return !isAcceptedLatest;
      if (filter === 'accepted') return isAcceptedLatest;
      return true;
    });
  }, [agreements, userAgreements, filter]);
  if (loading) {
    return <div className="space-y-4">
                {[...Array(3)].map((_, i) => <SkeletonList key={i} />)}
            </div>;
  }
  return <div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 mb-6 p-1 bg-background-secondary rounded-xl w-fit">
                {FILTER_TABS.map(tab => {
        const isActive = filter === tab.key;
        const count = counts[tab.key] ?? 0;
        return <button key={tab.key} type="button" onClick={() => setFilter(tab.key)} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
                            {tab.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor}`} />}
                            {tab.label}
                            <span className={`tabular-nums ${isActive ? 'text-text-muted' : 'text-text-muted'}`}>
                                {count}
                            </span>
                        </button>;
      })}
            </div>

            {/* Agreements list */}
            {filteredAgreements.length === 0 ? <div className="py-12 text-center">
                    <p className="text-sm font-medium text-text-muted">{t("no_agreements_match_this_filter")}</p>
                </div> : <div className="space-y-3">
                    {filteredAgreements.map(agreement => {
        const status = getUserAgreementStatus(agreement.agreementId);
        return <AgreementCard key={agreement.agreementId} agreement={agreement} status={status} onAccept={handleAcceptAgreement} accepting={acceptingAgreement === agreement.agreementId} onRead={agreement => setModalAgreement(agreement)} />;
      })}
                </div>}

            {modalAgreement && <AgreementModal open={!!modalAgreement} agreement={modalAgreement} onClose={() => setModalAgreement(null)} onAccept={async agreement => {
      await handleAcceptAgreement(agreement);
      setModalAgreement(null);
    }} accepting={acceptingAgreement === modalAgreement.agreementId} />}
        </div>;
};
export default AgreementsList;