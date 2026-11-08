import {useState} from 'react';
import {useRequiredAgreements} from './useAgreements.js';

export const useRegisterAgreements = () => {
 const { requiredAgreements: agreements, isLoading: agreementsLoading } = useRequiredAgreements('REGISTER');
 const [acceptedAgreements, setAcceptedAgreements] = useState(new Set());
 const [selectedAgreement, setSelectedAgreement] = useState(null);
 const [showAgreementModal, setShowAgreementModal] = useState(false);

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

 const handleAcceptFromModal = (agreement) => {
 const id = agreement?.agreementId || selectedAgreement?.agreementId;
 if (id) {
 setAcceptedAgreements(prev => {
 const newSet = new Set(prev);
 newSet.add(id);
 return newSet;
 });
 }
 handleCloseModal();
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
 handleCloseModal,
 handleAcceptFromModal
 };
};

