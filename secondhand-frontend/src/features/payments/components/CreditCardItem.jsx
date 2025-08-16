import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { CREDIT_CARD_FIELD_LABELS } from '../../../types/creditCards';

const CreditCardItem = ({ card, onDelete, isDeleting }) => {
    const formatAmount = (amount) => formatCurrency(amount, 'TRY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium opacity-90">
                    {CREDIT_CARD_FIELD_LABELS.number.split(' ')[0]} {CREDIT_CARD_FIELD_LABELS.number.split(' ')[1]}
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
                    <p className="opacity-75 mb-1">{CREDIT_CARD_FIELD_LABELS.expiryMonth} / {CREDIT_CARD_FIELD_LABELS.expiryYear}</p>
                    <p className="font-mono">
                        {card.expiryMonth?.padStart(2, '0')}/{card.expiryYear?.slice(-2)}
                    </p>
                </div>
                <div>
                    <p className="opacity-75 mb-1">{CREDIT_CARD_FIELD_LABELS.cvv}</p>
                    <p className="font-mono">{card.cvv || '***'}</p>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="opacity-75">{CREDIT_CARD_FIELD_LABELS.amount}</p>
                        <p className="font-semibold">
                            {formatAmount(parseFloat(card.amount) || 0)}
                        </p>
                    </div>
                    <div>
                        <p className="opacity-75">{CREDIT_CARD_FIELD_LABELS.limit}</p>
                        <p className="font-semibold">
                            {formatAmount(parseFloat(card.limit) || 0)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button 
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Credit Card"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CreditCardItem;
