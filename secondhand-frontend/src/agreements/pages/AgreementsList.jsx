import React, { useState } from 'react';
import AgreementCard from '../components/AgreementCard.jsx';
import AgreementModal from '../components/AgreementModal.jsx';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { agreementService } from '../service/agreementService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

const AgreementsList = ({ agreements, userAgreements, loading, filter, setFilter }) => {
    const [acceptingAgreement, setAcceptingAgreement] = useState(null);
    const [modalAgreement, setModalAgreement] = useState(null);
    const notification = useNotification();

    const handleAcceptAgreement = async (agreement) => {
        try {
            setAcceptingAgreement(agreement.agreementId);
            await agreementService.acceptAgreement({
                agreementId: agreement.agreementId,
                isAcceptedTheLastVersion: true
            });
            notification.showSuccess('Success', 'Agreement accepted.');
        } catch (err) {
            notification.showError('Error', 'Failed to accept agreement.');
        } finally {
            setAcceptingAgreement(null);
        }
    };

    const getUserAgreementStatus = (agreementId) => {
        const ua = userAgreements.find(ua => ua.agreementId === agreementId);
        if (!ua) return { status: 'pending', text: 'Pending', icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
        if (ua.isAcceptedTheLastVersion) return { status: 'accepted', text: 'Accepted', icon: CheckIcon, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', acceptedDate: ua.acceptedDate };
        return { status: 'outdated', text: 'Outdated', icon: ClockIcon, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    };

    const filteredAgreements = agreements.filter((agreement) => {
        const ua = userAgreements.find(ua => ua.agreementId === agreement.agreementId);
        const isAccepted = ua?.isAcceptedTheLastVersion;
        if (filter === 'all') return true;
        if (filter === 'pending') return !isAccepted;
        if (filter === 'accepted') return isAccepted;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex space-x-2 mb-6">
                <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-btn-primary text-white' : 'bg-gray-100 text-text-secondary'}`}>All</button>
                <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-text-secondary'}`}>Pending</button>
                <button onClick={() => setFilter('accepted')} className={`px-3 py-1 rounded ${filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-100 text-text-secondary'}`}>Accepted</button>
            </div>

            <div className="space-y-6">
                {filteredAgreements.map((agreement) => {
                    const status = getUserAgreementStatus(agreement.agreementId);
                    return (
                        <AgreementCard
                            key={agreement.agreementId}
                            agreement={agreement}
                            status={status}
                            onAccept={handleAcceptAgreement}
                            accepting={acceptingAgreement === agreement.agreementId}
                            onRead={(agreement) => setModalAgreement(agreement)}
                        />
                    );
                })}
            </div>

            {modalAgreement && (
                <AgreementModal
                    open={!!modalAgreement}
                    agreement={modalAgreement}
                    onClose={() => setModalAgreement(null)}
                />
            )}
        </div>
    );
};

export default AgreementsList;
