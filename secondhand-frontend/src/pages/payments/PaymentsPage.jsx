import React from 'react';

const PaymentsPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Ödemeler
            </h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-600">
                    Ödeme geçmişi yakında tamamlanacak...
                </p>
            </div>
        </div>
    );
};

export default PaymentsPage;