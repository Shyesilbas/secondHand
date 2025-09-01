import React, { useState, useEffect } from 'react';
import AgreementsList from './AgreementsList.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { agreementService } from '../service/agreementService.js';

const AgreementsPage = () => {
    const [agreements, setAgreements] = useState([]);
    const [userAgreements, setUserAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const notification = useNotification();

    useEffect(() => {
        const loadAgreements = async () => {
            try {
                setLoading(true);
                const [all, user] = await Promise.all([
                    agreementService.getAllAgreements(),
                    agreementService.getUserAgreements()
                ]);
                setAgreements(all);
                setUserAgreements(user);
            } catch (err) {
                notification.showError('Error', 'Failed to load agreements.');
            } finally {
                setLoading(false);
            }
        };
        loadAgreements();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Agreements</h1>
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
