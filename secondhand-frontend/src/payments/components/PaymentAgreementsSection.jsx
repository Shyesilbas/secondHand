import React, { useState, useEffect } from 'react';
import { agreementService } from '../../agreements/services/agreementService.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { AGREEMENT_TYPE_LABELS } from '../../agreements/agreements.js';
import logger from '../../common/utils/logger.js';

const PaymentAgreementsSection = ({ 
  acceptedAgreements, 
  onToggle, 
  onRead, 
  error,
  onRequiredAgreementsChange
}) => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const areAllAgreementsAccepted = () => {
    if (agreements.length === 0) return true;
    return agreements.every(agreement => 
      acceptedAgreements.has(agreement.agreementId)
    );
  };

  useEffect(() => {
    const fetchAgreements = async () => {
      try {
        const data = await agreementService.getRequiredAgreementsForPayment();
        setAgreements(data);
        if (onRequiredAgreementsChange) {
          onRequiredAgreementsChange(data);
        }
      } catch (error) {
        logger.error('Error fetching payment agreements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgreements();
  }, [onRequiredAgreementsChange]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4 text-sm text-gray-500">
        <LoadingIndicator size="h-5 w-5" />
        <span className="ml-2">Loading Payment Agreements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Payment Agreements</h3>
      <p className="text-sm text-gray-600">
        Please review and accept the following agreements to proceed with payment:
      </p>
      
      {agreements.map((agreement) => (
        <div key={agreement.agreementId} className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id={`agreement-${agreement.agreementId}`}
              name={`agreement-${agreement.agreementId}`}
              type="checkbox"
              checked={acceptedAgreements.has(agreement.agreementId)}
              onChange={() => handleAgreementToggle(agreement.agreementId)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <label
              htmlFor={`agreement-${agreement.agreementId}`}
              className="font-medium text-gray-900 cursor-pointer"
            >
              {AGREEMENT_TYPE_LABELS[agreement.agreementType] || agreement.agreementType}
            </label>
            <p className="text-gray-500">
              <button
                type="button"
                onClick={() => handleAgreementClick(agreement)}
                className="text-indigo-600 hover:text-indigo-500 underline"
              >
                Read full agreement
              </button>
            </p>
          </div>
        </div>
      ))}

      {(error || (!areAllAgreementsAccepted() && agreements.length > 0)) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error || "Please accept all payment agreements to proceed"}
        </div>
      )}

      <AgreementModal 
        agreement={selectedAgreement} 
        open={showAgreementModal} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default PaymentAgreementsSection;
