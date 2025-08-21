// AgreementsList.jsx
import React, { useState } from 'react';
import { CheckIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { AGREEMENT_TYPE_LABELS } from '../../types/agreements';
import { formatDate } from '../../utils/formatters';
import { agreementService } from '../../services/agreementService';
import { useNotification } from '../../context/NotificationContext';

const AgreementsList = ({ agreements, userAgreements, loading, filter, setFilter }) => {
    const [acceptingAgreement, setAcceptingAgreement] = useState(null);
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

    const filteredAgreements = agreements.filter(agreement => {
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
                <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
                <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Pending</button>
                <button onClick={() => setFilter('accepted')} className={`px-3 py-1 rounded ${filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Accepted</button>
            </div>

            <div className="space-y-6">
                {filteredAgreements.map(agreement => {
                    const status = getUserAgreementStatus(agreement.agreementId);
                    const StatusIcon = status.icon;
                    return (
                        <div key={agreement.agreementId} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{AGREEMENT_TYPE_LABELS[agreement.agreementType]}</h3>
                                        <p className="text-sm text-gray-500">Version: {agreement.version} | Updated: {formatDate(agreement.updatedDate)}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${status.bgColor} ${status.borderColor} border`}>
                                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                                    <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
                                </div>
                            </div>

                            <div className="mb-4 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto prose prose-sm max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: agreement.content }} />
                            </div>

                            {status.status === 'pending' && (
                                <div className="flex justify-end">
                                    <button
                                        disabled={acceptingAgreement === agreement.agreementId}
                                        onClick={() => handleAcceptAgreement(agreement)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {acceptingAgreement === agreement.agreementId ? 'Accepting...' : <><CheckIcon className="h-4 w-4 mr-2" /> Accept</>}
                                    </button>
                                </div>
                            )}

                            {status.acceptedDate && <p className="text-green-700 text-sm mt-2">Accepted on: {formatDate(status.acceptedDate)}</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AgreementsList;
