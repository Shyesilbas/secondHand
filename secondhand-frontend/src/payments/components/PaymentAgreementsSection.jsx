import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useRequiredAgreements } from '../../agreements/hooks/useAgreements.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { AGREEMENT_TYPE_LABELS } from '../../agreements/agreements.js';

const PaymentAgreementsSection = ({
  acceptedAgreements,
  onToggle,
  onRequiredAgreementsChange,
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

  const handleAgreementToggle = (agreementId) => {
    onToggle(agreementId);
  };

  const handleAgreementClick = (agreement) => {
    setSelectedAgreement(agreement);
    setShowAgreementModal(true);
  };

  const handleCloseModal = () => {
    setShowAgreementModal(false);
    setSelectedAgreement(null);
  };

  const handleAcceptFromModal = (agreement) => {
    if (agreement?.agreementId && !acceptedAgreements.has(agreement.agreementId)) {
      onToggle(agreement.agreementId);
    }
    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-1 text-xs text-text-tertiary">
        <LoadingIndicator size="h-4 w-4" />
        <span>{t('loading_payment_agreements', 'Sözleşmeler yükleniyor')}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {agreements.map((agreement) => {
        const isChecked = acceptedAgreements.has(agreement.agreementId);
        const agreementName = AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType;
        return (
          <div
            key={agreement.agreementId}
            className={`flex items-start justify-between gap-3 rounded border px-3 py-2.5 text-xs transition-colors duration-150 ${
              isChecked
                ? 'border-border bg-background-secondary/70'
                : 'border-border-light bg-background-primary hover:border-card-border-hover'
            }`}
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <input
                id={`agreement-${agreement.agreementId}`}
                type="checkbox"
                checked={isChecked}
                onChange={() => handleAgreementToggle(agreement.agreementId)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-sm border-border text-primary accent-primary focus:ring-primary"
              />
              <label
                htmlFor={`agreement-${agreement.agreementId}`}
                className="cursor-pointer select-none leading-relaxed text-text-secondary"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAgreementClick(agreement);
                  }}
                  className="mr-1 cursor-pointer font-medium text-text-primary underline hover:text-primary"
                >
                  {agreementName}
                </button>
                <span>{t('kosullarini_kabul_ediyorum', 'metnini okudum, onaylıyorum.')}</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => handleAgreementClick(agreement)}
              className="inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              <span>{t('read', 'Oku')}</span>
            </button>
          </div>
        );
      })}

      <AgreementModal
        agreement={selectedAgreement}
        open={showAgreementModal}
        onClose={handleCloseModal}
        onAccept={handleAcceptFromModal}
        isAccepted={Boolean(selectedAgreement && acceptedAgreements.has(selectedAgreement.agreementId))}
      />
    </div>
  );
};

export default PaymentAgreementsSection;
