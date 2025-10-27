import React, { useState } from 'react';
import AgreementsList from './AgreementsList.jsx';
import { useAgreements, useUserAgreements } from '../hooks/useAgreements.js';

const AgreementsPage = () => {
    const [filter, setFilter] = useState('all');
    const [category, setCategory] = useState('registration'); // registration, payment
    const { agreements, isLoading: agreementsLoading } = useAgreements();
    const { userAgreements, isLoading: userAgreementsLoading } = useUserAgreements();
    
    const loading = agreementsLoading || userAgreementsLoading;

    // Filter agreements by category
    const filteredAgreements = agreements.filter(agreement => {
        if (category === 'registration') {
            return ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'KVKK'].includes(agreement.agreementType);
        } else if (category === 'payment') {
            return ['DISTANCE_SELLING', 'PAYMENT_TERMS'].includes(agreement.agreementType);
        }
        return true;
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Agreements</h1>
            
            {/* Category Filter */}
            <div className="mb-6">
                <div className="flex space-x-2 mb-4">
                    <button 
                        onClick={() => setCategory('registration')} 
                        className={`px-4 py-2 rounded ${category === 'registration' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-text-secondary'}`}
                    >
                        Registration Agreements
                    </button>
                    <button 
                        onClick={() => setCategory('payment')} 
                        className={`px-4 py-2 rounded ${category === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-text-secondary'}`}
                    >
                        Payment Agreements
                    </button>
                </div>
            </div>

            <AgreementsList
                agreements={filteredAgreements}
                userAgreements={userAgreements}
                loading={loading}
                filter={filter}
                setFilter={setFilter}
            />
        </div>
    );
};

export default AgreementsPage;
