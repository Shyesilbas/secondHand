import { useState, useCallback } from 'react';

export const usePaymentAgreements = () => {
  const [acceptedAgreements, setAcceptedAgreements] = useState(new Set());
  const [requiredAgreementIds, setRequiredAgreementIds] = useState(new Set());

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

  const setRequiredAgreements = useCallback((agreements) => {
    if (!Array.isArray(agreements)) {
      setRequiredAgreementIds(new Set());
      return;
    }
    const ids = agreements
      .map((a) => (typeof a === 'string' ? a : a?.agreementId))
      .filter(Boolean);
    setRequiredAgreementIds(new Set(ids));
  }, []);

  const resetAgreements = useCallback(() => {
    setAcceptedAgreements(new Set());
    setRequiredAgreementIds(new Set());
  }, []);

  const areAllAgreementsAccepted = useCallback(() => {
    if (requiredAgreementIds.size === 0) return true;
    for (const id of requiredAgreementIds) {
      if (!acceptedAgreements.has(id)) return false;
    }
    return true;
  }, [acceptedAgreements, requiredAgreementIds]);

  const getAcceptedAgreementIds = () => {
    return Array.from(acceptedAgreements);
  };

  return {
    acceptedAgreements,
    setRequiredAgreements,
    handleAgreementToggle,
    resetAgreements,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds
  };
};

export default usePaymentAgreements;
