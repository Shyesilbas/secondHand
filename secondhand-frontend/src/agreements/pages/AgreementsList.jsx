import React, { useMemo, useState } from 'react';
import AgreementCard from '../components/AgreementCard.jsx';
import AgreementModal from '../components/AgreementModal.jsx';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { agreementService } from '../services/agreementService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

const AgreementsList = ({ agreements, userAgreements, loading, filter, setFilter, onAccepted }) => {
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
            if (onAccepted) {
                onAccepted();
            }
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
        return { status: 'pending', text: 'Pending', icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    };

    const counts = useMemo(() => {
        const result = { all: 0, pending: 0, accepted: 0 };
        for (const a of agreements) {
            result.all += 1;
            const ua = userAgreements.find((u) => u.agreementId === a.agreementId);
            if (!ua) {
                result.pending += 1;
                continue;
            }
            if (ua.isAcceptedTheLastVersion) {
                result.accepted += 1;
                continue;
            }
            result.pending += 1;
        }
        return result;
    }, [agreements, userAgreements]);

    const filteredAgreements = useMemo(() => {
        return agreements.filter((agreement) => {
            const ua = userAgreements.find((ua) => ua.agreementId === agreement.agreementId);
            const isAcceptedLatest = ua?.isAcceptedTheLastVersion === true;
            if (filter === 'all') return true;
            if (filter === 'pending') return !isAcceptedLatest;
            if (filter === 'accepted') return isAcceptedLatest;
            return true;
        });
    }, [agreements, userAgreements, filter]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        filter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    All ({counts.all})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        filter === 'pending' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    Pending ({counts.pending})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('accepted')}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        filter === 'accepted' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    Accepted ({counts.accepted})
                </button>
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
                    onAccept={async (agreement) => {
                        await handleAcceptAgreement(agreement);
                        setModalAgreement(null);
                    }}
                    accepting={acceptingAgreement === modalAgreement.agreementId}
                />
            )}
        </div>
    );
};

export default AgreementsList;
