import { useCallback, useEffect, useState } from 'react';
import { agreementService } from '../../../services/agreementService';
import { useNotification } from '../../../context/NotificationContext';

export const useRegisterAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [agreementsLoading, setAgreementsLoading] = useState(true);
  const [acceptedAgreements, setAcceptedAgreements] = useState(new Set());
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const notification = useNotification();

  const loadRequiredAgreements = useCallback(async () => {
    try {
      setAgreementsLoading(true);
      const requiredAgreements = await agreementService.getRequiredAgreements();
      setAgreements(requiredAgreements);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading agreements:', error);
      notification.showError('Hata', 'Sözleşmeler yüklenirken bir hata oluştu.');
    } finally {
      setAgreementsLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    loadRequiredAgreements();
  }, [loadRequiredAgreements]);

  const handleAgreementToggle = (agreementId) => {
    setAcceptedAgreements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agreementId)) {
        newSet.delete(agreementId);
      } else {
        newSet.add(agreementId);
      }
      return newSet;
    });
  };

  const handleAgreementClick = (agreement) => {
    setSelectedAgreement(agreement);
    setShowAgreementModal(true);
  };

  const handleCloseModal = () => {
    setShowAgreementModal(false);
    setSelectedAgreement(null);
  };

  return {
    agreements,
    agreementsLoading,
    acceptedAgreements,
    setAcceptedAgreements,
    selectedAgreement,
    showAgreementModal,
    handleAgreementToggle,
    handleAgreementClick,
    handleCloseModal
  };
};

export default useRegisterAgreements;


