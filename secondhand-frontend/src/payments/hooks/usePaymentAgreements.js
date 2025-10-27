import { useState, useCallback } from 'react';

export const usePaymentAgreements = () => {
  const [acceptedAgreements, setAcceptedAgreements] = useState(new Set());

  const handleAgreementToggle = useCallback((agreementId) => {
    setAcceptedAgreements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agreementId)) {
        newSet.delete(agreementId);
      } else {
        newSet.add(agreementId);
      }
      return newSet;
    });
  }, []);

  const resetAgreements = useCallback(() => {
    setAcceptedAgreements(new Set());
  }, []);

  const areAllAgreementsAccepted = () => {
    // This will be handled by PaymentAgreementsSection component
    return acceptedAgreements.size > 0;
  };

  const getAcceptedAgreementIds = () => {
    return Array.from(acceptedAgreements);
  };

  return {
    acceptedAgreements,
    handleAgreementToggle,
    resetAgreements,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds
  };
};

export default usePaymentAgreements;
