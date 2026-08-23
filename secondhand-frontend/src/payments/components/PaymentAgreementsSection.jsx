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
 <div className="space-y-2">
 {agreements.map(agreement => {
 const isChecked = acceptedAgreements.has(agreement.agreementId);
 return (
 <div
 key={agreement.agreementId}
 className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all text-xs ${
 isChecked
 ? 'bg-slate-100/60 border-slate-300/80 text-slate-900'
 : 'bg-slate-50/60 border-slate-200/60 text-slate-600 hover:border-slate-300'
 }`}
 >
 <input
 id={`agreement-${agreement.agreementId}`}
 type="checkbox"
 checked={isChecked}
 onChange={() => handleAgreementToggle(agreement.agreementId)}
 className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
 />
 <label
 htmlFor={`agreement-${agreement.agreementId}`}
 className="flex-1 font-medium cursor-pointer truncate"
 >
 {AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType}
 </label>
 <button
 type="button"
 onClick={() => handleAgreementClick(agreement)}
 className="text-[11px] font-bold text-slate-900 hover:underline flex-shrink-0"
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