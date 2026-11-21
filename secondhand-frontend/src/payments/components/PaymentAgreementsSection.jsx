import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useRequiredAgreements } from '../../agreements/hooks/useAgreements.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { agreementLabel } from '../../agreements/agreements.js';

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
      <div className="flex items-center gap-2 py-1 text-sm text-text-tertiary">
        <LoadingIndicator size="h-4 w-4" />
        <span>{t('loading_payment_agreements', 'Sözleşmeler yükleniyor')}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {agreements.map((agreement) => {
        const isChecked = acceptedAgreements.has(agreement.agreementId);
        const agreementName = agreementLabel(t, agreement.agreementType);
        return (
          <div
            key={agreement.agreementId}
            className={`flex items-center gap-3 rounded border px-4 py-3 text-sm transition-colors duration-150 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-border-focus ${
              isChecked
                ? 'border-accent-teal bg-accent-teal-50'
                : 'border-border bg-background-primary hover:border-card-border-hover'
            }`}
          >
            {/* The label covers the row, so a click anywhere but "Read" toggles the checkbox. */}
            <label htmlFor={`agreement-${agreement.agreementId}`} className="flex min-w-0 flex-1 cursor-pointer select-none items-center gap-3">
              <input
                id={`agreement-${agreement.agreementId}`}
                type="checkbox"
                checked={isChecked}
                onChange={() => handleAgreementToggle(agreement.agreementId)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded-sm border-border accent-accent-teal focus-visible:outline-none"
              />
              <span className="text-text-secondary">
                <span className="font-medium text-text-primary">{agreementName}</span>{' '}
                {t('kosullarini_kabul_ediyorum', 'metnini okudum, onaylıyorum.')}
              </span>
            </label>
            <button
              type="button"
              onClick={() => handleAgreementClick(agreement)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <FileText className="h-4 w-4" strokeWidth={1.5} aria-hidden />
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
