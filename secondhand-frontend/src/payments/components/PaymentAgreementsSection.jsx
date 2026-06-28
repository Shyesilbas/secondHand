import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { useRequiredAgreements } from '../../agreements/hooks/useAgreements.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { AGREEMENT_TYPE_LABELS } from '../../agreements/agreements.js';
const PaymentAgreementsSection = ({
  acceptedAgreements,
  onToggle,
  error,
  onRequiredAgreementsChange
}) => {
  const {
    t
  } = useTranslation();
  const { requiredAgreements: agreements, isLoading: loading } = useRequiredAgreements('ONLINE_PAYMENT');
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const areAllAgreementsAccepted = () => {
    if (agreements.length === 0) return true;
    return agreements.every(agreement => acceptedAgreements.has(agreement.agreementId));
  };
  useEffect(() => {
    if (onRequiredAgreementsChange && agreements && agreements.length > 0) {
      onRequiredAgreementsChange(agreements);
    }
  }, [agreements, onRequiredAgreementsChange]);
  const handleAgreementToggle = agreementId => {
    onToggle(agreementId);
  };
  const handleAgreementClick = agreement => {
    setSelectedAgreement(agreement);
    setShowAgreementModal(true);
  };
  const handleCloseModal = () => {
    setShowAgreementModal(false);
    setSelectedAgreement(null);
  };
  if (loading) {
    return <div className="flex justify-center items-center py-4 text-sm text-text-muted">
        <LoadingIndicator size="h-5 w-5" />
        <span className="ml-2">{t("loading_payment_agreements")}</span>
      </div>;
  }
  return <div className="space-y-4">
      <h3 className="text-sm font-medium text-text-primary">{t("payment_agreements")}</h3>
      <p className="text-sm text-text-secondary">{t("please_review_and_accept_the_following_a")}</p>
      
      {agreements.map(agreement => <div key={agreement.agreementId} className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input id={`agreement-${agreement.agreementId}`} name={`agreement-${agreement.agreementId}`} type="checkbox" checked={acceptedAgreements.has(agreement.agreementId)} onChange={() => handleAgreementToggle(agreement.agreementId)} className="h-4 w-4 text-primary border-border-DEFAULT rounded focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <label htmlFor={`agreement-${agreement.agreementId}`} className="font-medium text-text-primary cursor-pointer">
              {AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType}
            </label>
            <p className="text-text-muted">
              <button type="button" onClick={() => handleAgreementClick(agreement)} className="text-primary hover:text-primary underline">{t("read_full_agreement")}</button>
            </p>
          </div>
        </div>)}

      {(error || !areAllAgreementsAccepted() && agreements.length > 0) && <div className="p-3 bg-status-error-bg border border-status-error-border rounded text-status-error text-sm">
          {error || "Please accept all payment agreements to proceed"}
        </div>}

      <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
    </div>;
};
export default PaymentAgreementsSection;