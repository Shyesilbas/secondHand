import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { BANK_FIELD_LABELS } from '../../../types/banks';

const BankAccountCard = ({ account, onDelete, isDeleting }) => {
    const formatAmount = (amount) => formatCurrency(amount, 'TRY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {BANK_FIELD_LABELS.IBAN.split(' ')[0]} {BANK_FIELD_LABELS.IBAN.split(' ')[1]}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Current Account
                        </p>
                    </div>
                </div>
                
                <div className="flex space-x-2">
                    <button 
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Account"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <p className="text-xs text-gray-500 mb-1">{BANK_FIELD_LABELS.IBAN}</p>
                    <p className="font-mono text-sm text-gray-900">
                        {account.IBAN}
                    </p>
                </div>
                
                <div>
                    <p className="text-xs text-gray-500 mb-1">{BANK_FIELD_LABELS.holderName}</p>
                    <p className="text-sm text-gray-900">
                        {account.holderName} {account.holderSurname}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Balance</span>
                    <span className="text-xl font-bold text-green-600">
                        {formatAmount(parseFloat(account.balance) || 0)}
                    </span>
                </div>
            </div>

            <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Deposit
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Transfer
                </button>
            </div>
        </div>
    );
};

export default BankAccountCard;
