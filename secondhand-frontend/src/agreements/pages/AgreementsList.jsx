import React, {useMemo, useState} from 'react';
import AgreementCard from '../components/AgreementCard.jsx';
import AgreementModal from '../components/AgreementModal.jsx';
import {Check as CheckIcon, Clock as ClockIcon} from 'lucide-react';
import {agreementService} from '../services/agreementService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';

const FILTER_TABS = [
    {key: 'all', label: 'All'},
    {key: 'pending', label: 'Pending', dotColor: 'bg-amber-500'},
    {key: 'accepted', label: 'Accepted', dotColor: 'bg-emerald-500'},
];

const AgreementsList = ({agreements, userAgreements, loading, filter, setFilter, onAccepted}) => {
    const [acceptingAgreement, setAcceptingAgreement] = useState(null);
    const [modalAgreement, setModalAgreement] = useState(null);
    const notification = useNotification();

    const handleAcceptAgreement = async (agreement) => {
        try {
            setAcceptingAgreement(agreement.agreementId);
            await agreementService.acceptAgreement({
                agreementId: agreement.agreementId,
                isAcceptedTheLastVersion: true,
            });
            notification.showSuccess('Success', 'Agreement accepted.');
            if (onAccepted) onAccepted();
        } catch (err) {
            notification.showError('Error', 'Failed to accept agreement.');
        } finally {
            setAcceptingAgreement(null);
        }
    };

    const getUserAgreementStatus = (agreementId) => {
        const ua = userAgreements.find(ua => ua.agreementId === agreementId);
        if (!ua) return {status: 'pending', text: 'Pending', icon: ClockIcon, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200'};
        if (ua.isAcceptedTheLastVersion) return {status: 'accepted', text: 'Accepted', icon: CheckIcon, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', acceptedDate: ua.acceptedDate};
        return {status: 'pending', text: 'Pending', icon: ClockIcon, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200'};
    };

    const counts = useMemo(() => {
        const result = {all: 0, pending: 0, accepted: 0};
        for (const a of agreements) {
            result.all += 1;
            const ua = userAgreements.find((u) => u.agreementId === a.agreementId);
            if (!ua) { result.pending += 1; continue; }
            if (ua.isAcceptedTheLastVersion) { result.accepted += 1; continue; }
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
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 p-5 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                            </div>
                            <div className="h-6 w-20 bg-gray-100 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
                {FILTER_TABS.map((tab) => {
                    const isActive = filter === tab.key;
                    const count = counts[tab.key] ?? 0;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilter(tab.key)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                isActive
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor}`} />}
                            {tab.label}
                            <span className={`tabular-nums ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Agreements list */}
            {filteredAgreements.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-sm font-medium text-gray-500">No agreements match this filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
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
            )}

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
