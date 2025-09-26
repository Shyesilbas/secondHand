import React from 'react';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import CreditCardItem from './CreditCardItem.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useCreditCard } from '../hooks/useCreditCard.js';
import { formatCurrency } from '../../common/formatters.js';

const CreditCardsSection = () => {
    const notification = useNotification();
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [creditCardLimit, setCreditCardLimit] = React.useState('');

    const {
        creditCards,
        isLoading,
        error,
        createCreditCard,
        deleteCreditCard,
    } = useCreditCard();

    const handleCreateCreditCard = async () => {
        if (!creditCardLimit || isNaN(parseFloat(creditCardLimit))) {
            notification.showError('Error', 'Please enter a valid limit amount');
            return;
        }
        try {
            await createCreditCard(parseFloat(creditCardLimit));
            setShowCreateModal(false);
            setCreditCardLimit('');
        } catch {
                    }
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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                    Credit Cards ({creditCards.length})
                </h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-btn-primary text-white px-6 py-3 rounded-lg hover:bg-btn-primary-hover transition-colors flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m-6-6h6m-6 0H6" />
                    </svg>
                    Create Credit Card
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {creditCards.length === 0 ? (
                <EmptyState
                    title="No Credit Cards Found"
                    description="You don't have any credit cards registered yet."
                    variant="blue"
                    primaryAction={{
                        label: 'Create your first credit card',
                        onClick: () => setShowCreateModal(true),
                        variant: 'blue'
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creditCards.map((card, index) => (
                        <CreditCardItem
                            key={card.number || card.cardNumber || card.last4 || index}
                            card={card}
                            onDelete={handleDeleteCreditCard}
                            isDeleting={isLoading}
                        />
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Create Credit Card</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Credit Limit
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent"
                                    placeholder="Enter credit limit"
                                    value={creditCardLimit}
                                    onChange={(e) => setCreditCardLimit(e.target.value)}
                                />
                                {creditCardLimit && !isNaN(parseFloat(creditCardLimit)) && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Preview: {formatCurrency(parseFloat(creditCardLimit))}
                                    </p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateCreditCard}
                                    disabled={isLoading}
                                    className="flex-1 bg-btn-primary text-white px-4 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Creating...' : 'Create Card'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCardsSection;


