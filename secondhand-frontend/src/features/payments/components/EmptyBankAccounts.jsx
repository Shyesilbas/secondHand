import React from 'react';

const EmptyBankAccounts = ({ onCreate, isCreating }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Bank Account Found
            </h3>
            <p className="text-gray-600 mb-6">
                You don't have a registered bank account yet.
            </p>
            <button
                onClick={onCreate}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                disabled={isCreating}
            >
                {isCreating ? 'Creating...' : 'Create Bank Account'}
            </button>
        </div>
    );
};

export default EmptyBankAccounts;
