import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
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
 <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
 <LoadingIndicator size="h-4 w-4" />
 <span>{t("loading_payment_agreements")}...</span>
 </div>
 );
 }

  return (
    <div className="space-y-1.5">
      {agreements.map(agreement => {
        const isChecked = acceptedAgreements.has(agreement.agreementId);
        const agreementName = AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType;
        return (
          <div
            key={agreement.agreementId}
            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border transition-all text-xs ${
              isChecked
                ? 'bg-slate-50 border-slate-300 text-slate-900'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <label 
              htmlFor={`agreement-${agreement.agreementId}`}
              className="flex items-center gap-2.5 cursor-pointer select-none flex-1 min-w-0"
            >
              <input
                id={`agreement-${agreement.agreementId}`}
                type="checkbox"
                checked={isChecked}
                onChange={() => handleAgreementToggle(agreement.agreementId)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900 shrink-0"
              />
              <span className="font-medium truncate text-[11px] text-slate-700">
                {agreementName}
              </span>
            </label>
            <button
              type="button"
              onClick={() => handleAgreementClick(agreement)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 underline shrink-0 cursor-pointer transition-colors"
            >
              {t("read_full_agreement")}
            </button>
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