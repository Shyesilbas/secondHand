import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { agreementService } from '../../services/agreementService';
import { AGREEMENT_TYPE_LABELS } from '../../types/agreements';
import { CheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/formatters';

const PendingAgreementsPage = () => {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingAgreement, setAcceptingAgreement] = useState(null);
    const notification = useNotification();

    useEffect(() => {
        loadPendingAgreements();
    }, []);

    const loadPendingAgreements = async () => {
        try {
            setLoading(true);
            const pendingAgreements = await agreementService.getPendingAgreements();
            setAgreements(pendingAgreements);
        } catch (error) {
            console.error('Error loading pending agreements:', error);
            notification.showError('Hata', 'Bekleyen sözleşmeler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptAgreement = async (agreement) => {
        try {
            setAcceptingAgreement(agreement.agreementId);
            
            const acceptRequest = {
                agreementId: agreement.agreementId,
                isAcceptedTheLastVersion: true
            };
            
            await agreementService.acceptAgreement(acceptRequest);
            
            notification.showSuccess('Başarılı', `${AGREEMENT_TYPE_LABELS[agreement.agreementType]} sözleşmesi başarıyla onaylandı.`);
            
            // Remove the accepted agreement from the list
            setAgreements(prev => prev.filter(a => a.agreementId !== agreement.agreementId));
            
        } catch (error) {
            console.error('Error accepting agreement:', error);
            notification.showError('Hata', 'Sözleşme onaylanırken bir hata oluştu.');
        } finally {
            setAcceptingAgreement(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (agreements.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <CheckIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Tüm Sözleşmeler Onaylandı!
                    </h2>
                    <p className="text-gray-600">
                        Bekleyen sözleşmeniz bulunmuyor. Tüm gerekli sözleşmeleri onaylamış durumdasınız.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Bekleyen Sözleşmeler
                </h1>
                <p className="text-gray-600">
                    Aşağıdaki sözleşmeleri onaylamanız gerekmektedir. Her sözleşmeyi okuyup onaylayabilirsiniz.
                </p>
            </div>

            <div className="space-y-6">
                {agreements.map((agreement) => (
                    <div key={agreement.agreementId} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
                                    </h3>
                                                                            <p className="text-sm text-gray-500">
                                            Versiyon: {agreement.version} | Güncellenme: {formatDate(agreement.updatedDate)}
                                        </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <div className="prose prose-sm max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: agreement.content }} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => handleAcceptAgreement(agreement)}
                                disabled={acceptingAgreement === agreement.agreementId}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {acceptingAgreement === agreement.agreementId ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Onaylanıyor...
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="h-4 w-4 mr-2" />
                                        Sözleşmeyi Onayla
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingAgreementsPage;
