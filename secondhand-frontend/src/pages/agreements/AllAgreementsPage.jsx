import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { agreementService } from '../../services/agreementService';
import { AGREEMENT_TYPE_LABELS } from '../../types/agreements';
import { DocumentTextIcon, CalendarIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/formatters';

const AllAgreementsPage = () => {
    const [agreements, setAgreements] = useState([]);
    const [userAgreements, setUserAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const notification = useNotification();

    useEffect(() => {
        loadAllAgreements();
    }, []);

    const loadAllAgreements = async () => {
        try {
            setLoading(true);
            const [allAgreements, userAgreementsData] = await Promise.all([
                agreementService.getAllAgreements(),
                agreementService.getUserAgreements()
            ]);
            
            setAgreements(allAgreements);
            setUserAgreements(userAgreementsData);
        } catch (error) {
            console.error('Error loading agreements:', error);
            notification.showError('Hata', 'Sözleşmeler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const getUserAgreementStatus = (agreementId) => {
        const userAgreement = userAgreements.find(ua => ua.agreementId === agreementId);
        if (!userAgreement) {
            return { status: 'pending', text: 'Onaylanmadı', icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
        }
        if (userAgreement.isAcceptedTheLastVersion) {
            return { 
                status: 'accepted', 
                text: 'Onaylandı', 
                icon: CheckIcon, 
                color: 'text-green-600', 
                bgColor: 'bg-green-50', 
                borderColor: 'border-green-200',
                acceptedDate: userAgreement.acceptedDate
            };
        }
        return { status: 'outdated', text: 'Güncel Değil', icon: ClockIcon, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Tüm Sözleşmeler
                </h1>
                <p className="text-gray-600">
                    Mevcut tüm sözleşmeler ve onay durumlarınız aşağıda listelenmiştir.
                </p>
            </div>

            <div className="space-y-6">
                {agreements.map((agreement) => {
                    const status = getUserAgreementStatus(agreement.agreementId);
                    const StatusIcon = status.icon;
                    
                    return (
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
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${status.bgColor} ${status.borderColor} border`}>
                                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                                    <span className={`text-sm font-medium ${status.color}`}>
                                        {status.text}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                    <div className="prose prose-sm max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: agreement.content }} />
                                    </div>
                                </div>
                            </div>

                            <div className={`${status.bgColor} ${status.borderColor} border rounded-lg p-4`}>
                                <div className="flex items-center space-x-2">
                                    <StatusIcon className={`h-5 w-5 ${status.color}`} />
                                    <div>
                                        <span className={`font-medium ${status.color}`}>
                                            Durum: {status.text}
                                        </span>
                                        {status.acceptedDate && (
                                            <p className={`text-sm ${status.color.replace('text-', 'text-').replace('-600', '-700')} mt-1`}>
                                                Onay tarihi: {formatDate(status.acceptedDate)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-1">
                            Sözleşme Durumları
                        </h3>
                        <div className="space-y-2 text-blue-800 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckIcon className="h-4 w-4 text-green-600" />
                                <span><strong>Onaylandı:</strong> Sözleşmeyi onayladınız ve güncel versiyonunu kabul ettiniz.</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="h-4 w-4 text-yellow-600" />
                                <span><strong>Onaylanmadı:</strong> Bu sözleşmeyi henüz onaylamadınız.</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="h-4 w-4 text-orange-600" />
                                <span><strong>Güncel Değil:</strong> Sözleşme güncellendi, yeni versiyonu onaylamanız gerekebilir.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllAgreementsPage;
