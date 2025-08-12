import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreditCard } from '../../features/payments/hooks/useCreditCard';
import CreditCardCreateForm from '../../features/payments/components/CreditCardCreateForm';
import { CreditCardDTO } from '../../types/payments';
import { useNotification } from '../../context/NotificationContext';

const CreditCardsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [showAddForm, setShowAddForm] = useState(false);
    
    const {
        creditCards,
        isLoading,
        error,
        createCreditCard,
        deleteCreditCard,
    } = useCreditCard();

    const handleCreateCreditCard = async (creditCardData) => {
        await createCreditCard(creditCardData);
        setShowAddForm(false);
    };

    const handleDeleteCreditCard = async () => {
        if (!window.confirm('Are you sure you want to delete this credit card?')) {
            return;
        }

        try {
            await deleteCreditCard();
            notification.showSuccess('Başarılı', 'Kredi kartı başarıyla silindi!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error occurred while deleting credit card';
            notification.showError('Hata', errorMessage);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };


    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border p-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Go Back
                </button>
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Credit Cards
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage Your Credit Cards
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Card
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {creditCards.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Kayıtlı Kredi Kartı Bulunamadı
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Henüz sistemde kayıtlı kredi kartınız bulunmuyor.
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Add your first card
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creditCards.map((card, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium opacity-90">
                                    Credit Card
                                </span>
                                <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-lg font-mono tracking-wider">
                                    {card.number || '**** **** **** ****'}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="opacity-75 mb-1">Expiry Date</p>
                                    <p className="font-mono">
                                        {card.expiryMonth?.padStart(2, '0')}/{card.expiryYear?.slice(-2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="opacity-75 mb-1">CVV</p>
                                    <p className="font-mono">{card.cvv || '***'}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="opacity-75">Current Amount</p>
                                        <p className="font-semibold">
                                            {formatCurrency(parseFloat(card.amount) || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="opacity-75">Limit</p>
                                        <p className="font-semibold">
                                            {formatCurrency(parseFloat(card.limit) || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button 
                                    onClick={handleDeleteCreditCard}
                                    className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                                    title="Delete Credit Card"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Card Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Yeni Kredi Kartı Ekle</h3>
                        <CreditCardCreateForm
                            onSuccess={() => setShowAddForm(false)}
                            onCancel={() => setShowAddForm(false)}
                            onSubmit={handleCreateCreditCard}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCardsPage;