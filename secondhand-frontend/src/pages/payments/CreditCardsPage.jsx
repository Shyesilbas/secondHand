import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreditCard } from '../../features/payments/hooks/useCreditCard';
import { useNotification } from '../../context/NotificationContext';
import CreditCardItem from '../../features/payments/components/CreditCardItem';
import EmptyCreditCards from '../../features/payments/components/EmptyCreditCards';
import CreditCardModal from '../../features/payments/components/CreditCardModal';

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
        notification.showConfirmation(
            'Delete Credit Card',
            'Are you sure you want to delete this credit card?',
            async () => {
                try {
                    await deleteCreditCard();
                    notification.showSuccess('Success', 'Credit card deleted successfully!');
                } catch (err) {
                    const errorMessage = err.response?.data?.message || 'Error occurred while deleting credit card';
                    notification.showError('Error', errorMessage);
                }
            }
        );
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
                <EmptyCreditCards onCreate={() => setShowAddForm(true)} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creditCards.map((card, index) => (
                        <CreditCardItem
                            key={index}
                            card={card}
                            onDelete={handleDeleteCreditCard}
                            isDeleting={isLoading}
                        />
                    ))}
                </div>
            )}

            <CreditCardModal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                onSubmit={handleCreateCreditCard}
                isLoading={isLoading}
            />
        </div>
    );
};

export default CreditCardsPage;