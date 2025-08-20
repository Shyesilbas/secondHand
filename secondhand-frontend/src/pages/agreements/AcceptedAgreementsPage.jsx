import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { agreementService } from '../../services/agreementService';
import { AGREEMENT_TYPE_LABELS } from '../../types/agreements';
import { CheckIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/formatters';

const AcceptedAgreementsPage = () => {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const notification = useNotification();

    useEffect(() => {
        loadAcceptedAgreements();
    }, []);

    const loadAcceptedAgreements = async () => {
        try {
            setLoading(true);
            const acceptedAgreements = await agreementService.getAcceptedAgreements();
            setAgreements(acceptedAgreements);
        } catch (error) {
            console.error('Error loading accepted agreements:', error);
            notification.showError('Hata', 'Onaylanan sözleşmeler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
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
                    <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Henüz Sözleşme Onaylamadınız
                    </h2>
                    <p className="text-gray-600">
                        Onayladığınız sözleşme bulunmuyor. Sözleşmeleri onayladıktan sonra burada görünecektir.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Onayladığım Sözleşmeler
                </h1>
                <p className="text-gray-600">
                    Aşağıda onayladığınız sözleşmelerin listesi bulunmaktadır.
                </p>
            </div>

            <div className="space-y-6">
                {agreements.map((agreement) => (
                    <div key={agreement.userAgreementId} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                    <CheckIcon className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {AGREEMENT_TYPE_LABELS[agreement.agreementType]}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Versiyon: {agreement.agreementVersion}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4" />
                                <span>
                                    Onaylanma: {formatDate(agreement.acceptedDate)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <CheckIcon className="h-5 w-5 text-green-600" />
                                <span className="text-green-800 font-medium">
                                    Bu sözleşmeyi onayladınız
                                </span>
                            </div>
                            <p className="text-green-700 text-sm mt-1">
                                Onay tarihi: {formatDate(agreement.acceptedDate)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-1">
                            Sözleşme Bilgileri
                        </h3>
                        <p className="text-blue-800 text-sm">
                            Onayladığınız sözleşmeler, hesabınızın aktif olması için gereklidir. 
                            Sözleşmeler güncellendiğinde, yeni versiyonları onaylamanız gerekebilir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptedAgreementsPage;
