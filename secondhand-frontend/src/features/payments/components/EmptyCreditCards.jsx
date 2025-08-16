import React from 'react';

const EmptyCreditCards = ({ onCreate }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Credit Cards Found
            </h3>
            <p className="text-gray-600 mb-6">
                You don't have any credit cards registered yet.
            </p>
            <button
                onClick={onCreate}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Add your first card
            </button>
        </div>
    );
};

export default EmptyCreditCards;
