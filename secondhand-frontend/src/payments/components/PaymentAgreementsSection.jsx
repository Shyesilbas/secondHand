import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { useRequiredAgreements } from '../../agreements/hooks/useAgreements.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { AGREEMENT_TYPE_LABELS } from '../../agreements/agreements.js';

const PaymentAgreementsSection = ({
 acceptedAgreements,
 onToggle,
 onRequiredAgreementsChange
}) => {
 const { t } = useTranslation();
 const { requiredAgreements: agreements, isLoading: loading } = useRequiredAgreements('ONLINE_PAYMENT');
 const [selectedAgreement, setSelectedAgreement] = useState(null);
 const [showAgreementModal, setShowAgreementModal] = useState(false);

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
 return (
 <div className="flex items-center gap-2 text-xs text-text-tertiary py-1">
 <LoadingIndicator size="h-4 w-4" />
 <span>{t("loading_payment_agreements")}...</span>
 </div>
 );
 }

  return (
    <div className="space-y-2">
      {agreements.map(agreement => {
        const isChecked = acceptedAgreements.has(agreement.agreementId);
        const agreementName = AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType;
        return (
          <div
            key={agreement.agreementId}
            className="flex items-center gap-2 text-xs"
          >
            <input
              id={`agreement-${agreement.agreementId}`}
              type="checkbox"
              checked={isChecked}
              onChange={() => handleAgreementToggle(agreement.agreementId)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
            />
            <label 
              htmlFor={`agreement-${agreement.agreementId}`}
              className="cursor-pointer select-none text-text-secondary"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleAgreementClick(agreement);
                }}
                className="underline hover:text-text-primary text-xs cursor-pointer mr-1 font-medium text-text-primary"
              >
                {agreementName}
              </button>
              <span>{t("kosullarini_kabul_ediyorum", "metnini okudum, onaylıyorum.")}</span>
            </label>
          </div>
        );
      })}

      <AgreementModal
        agreement={selectedAgreement}
        open={showAgreementModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PaymentAgreementsSection;