import React, { useState } from 'react';
import {
    CreditCard,
    Plus as PlusIcon,
    Shield,
    Trash2,
    X,
} from 'lucide-react';
import EmptyState from '../../../common/components/ui/EmptyState.jsx';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { useCreditCard } from '../../hooks/useFinancialAccountManager.js';
import CreditCardVisual from './CreditCardVisual.jsx';

const CreditCardsSection = () => {
    const notification = useNotification();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deletingCardId, setDeletingCardId] = useState(null);
    const [cardMode, setCardMode] = useState('mock');
    const [creditCardLimit, setCreditCardLimit] = useState('');
    const [cardLabel, setCardLabel] = useState('');
    const [manualCard, setManualCard] = useState({ cardNumber: '', cvv: '', expiryMonth: '', expiryYear: '' });

    const {
        creditCards,
        isLoading,
        isDeleting,
        error,
        createCreditCard,
        deleteCreditCard,
    } = useCreditCard();

    const resetModal = () => {
        setShowCreateModal(false);
        setCardMode('mock');
        setCreditCardLimit('');
        setCardLabel('');
        setManualCard({ cardNumber: '', cvv: '', expiryMonth: '', expiryYear: '' });
    };

    const formatCardNumberInput = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const handleCreateCreditCard = async () => {
        if (!creditCardLimit || isNaN(parseFloat(creditCardLimit))) {
            notification.showError('Error', 'Please enter a valid limit amount');
            return;
        }
        try {
            const cardData = cardMode === 'manual'
                ? { ...manualCard, cardLabel: cardLabel || undefined }
                : (cardLabel ? { cardLabel } : null);
            await createCreditCard(parseFloat(creditCardLimit), cardData);
            resetModal();
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Error occurred while creating credit card';
            notification.showError('Error', errorMessage);
        }
    };

    const handleDeleteConfirmed = async () => {
        try {
            await deleteCreditCard(deletingCardId);
            setDeletingCardId(null);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Error occurred while deleting credit card';
            notification.showError('Error', errorMessage);
            setDeletingCardId(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-base font-bold text-slate-900">Saved Cards</h2>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Encrypted &amp; secure
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Card
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-pulse">
                    {[1, 2].map(i => (
                        <div key={i} className="h-44 rounded-2xl bg-slate-200" />
                    ))}
                </div>
            ) : creditCards.length === 0 ? (
                <EmptyState
                    title="No Credit Cards Found"
                    description="You don't have any credit cards registered yet."
                    variant="blue"
                    primaryAction={{
                        label: 'Add your first card',
                        onClick: () => setShowCreateModal(true),
                        variant: 'blue'
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {creditCards.map((card, index) => (
                        <CreditCardVisual
                            key={card.id || card.number || index}
                            card={card}
                            isDefault={index === 0}
                            onDeleteClick={() => setDeletingCardId(card.id)}
                            isDeleting={isDeleting && deletingCardId === card.id}
                        />
                    ))}
                </div>
            )}

            {deletingCardId && (
                <div
                    className="fixed inset-0 z-[90] p-4 sm:p-6 flex items-center justify-center bg-slate-900/65 backdrop-blur-md"
                    onClick={() => !isDeleting && setDeletingCardId(null)}
                >
                    <div
                        className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-24px_rgba(15,23,42,0.55)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                                    <Trash2 className="w-5 h-5 text-rose-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-slate-900">Delete Credit Card</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !isDeleting && setDeletingCardId(null)}
                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingCardId(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirmed}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm font-semibold disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div
                    className="fixed inset-0 z-[90] p-4 sm:p-6 flex items-center justify-center bg-slate-900/65 backdrop-blur-md"
                    onClick={resetModal}
                >
                    <div
                        className="w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-24px_rgba(15,23,42,0.55)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Add Credit Card</h3>
                                        <p className="text-xs text-slate-500">Secure card registration</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetModal}
                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-5 gap-1">
                                <button
                                    onClick={() => setCardMode('mock')}
                                    type="button"
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${cardMode === 'mock' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Auto Generate
                                </button>
                                <button
                                    onClick={() => setCardMode('manual')}
                                    type="button"
                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${cardMode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Enter Manually
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                        Card Label <span className="font-normal text-slate-400">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={50}
                                        placeholder="e.g. Personal, Business, Travel..."
                                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                        value={cardLabel}
                                        onChange={(e) => setCardLabel(e.target.value)}
                                    />
                                </div>

                                {cardMode === 'manual' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Card Number</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={19}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 font-mono tracking-wider text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                                value={manualCard.cardNumber}
                                                onChange={(e) => setManualCard(p => ({ ...p, cardNumber: formatCardNumberInput(e.target.value) }))}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVV</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={4}
                                                    placeholder="123"
                                                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                                    value={manualCard.cvv}
                                                    onChange={(e) => setManualCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Month</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={2}
                                                    placeholder="MM"
                                                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                                    value={manualCard.expiryMonth}
                                                    onChange={(e) => setManualCard(p => ({ ...p, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Year</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={4}
                                                    placeholder="YYYY"
                                                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                                    value={manualCard.expiryYear}
                                                    onChange={(e) => setManualCard(p => ({ ...p, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {cardMode === 'mock' && (
                                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                                        <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-blue-700">
                                            A valid card number, CVV and expiry date will be automatically generated for you.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Credit Limit</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                                        placeholder="e.g. 5000"
                                        value={creditCardLimit}
                                        onChange={(e) => setCreditCardLimit(e.target.value)}
                                    />
                                    {creditCardLimit && !isNaN(parseFloat(creditCardLimit)) && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatCurrency(parseFloat(creditCardLimit))}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={resetModal}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-semibold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateCreditCard}
                                disabled={isLoading}
                                className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-semibold text-sm"
                            >
                                {isLoading ? 'Adding...' : 'Add Card'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCardsSection;
