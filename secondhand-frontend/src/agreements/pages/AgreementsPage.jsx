import React, { useState } from 'react';
import AgreementsList from './AgreementsList.jsx';
import { useAgreements, useUserAgreements } from '../hooks/useAgreements.js';

const AgreementsPage = () => {
    const [filter, setFilter] = useState('all');
    const { agreements, isLoading: agreementsLoading } = useAgreements();
    const { userAgreements, isLoading: userAgreementsLoading } = useUserAgreements();
    
    const loading = agreementsLoading || userAgreementsLoading;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-text-primary mb-4">Agreements</h1>
            <AgreementsList
                agreements={agreements}
                userAgreements={userAgreements}
                loading={loading}
                filter={filter}
                setFilter={setFilter}
            />
        </div>
    );
};

export default AgreementsPage;
