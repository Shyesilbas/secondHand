import React, { useEffect, useMemo, useState } from 'react';
import AgreementsList from './AgreementsList.jsx';
import { useAgreements, useUserAgreements } from '../hooks/useAgreements.js';
import { agreementService } from '../services/agreementService.js';

const AgreementsPage = () => {
    const [filter, setFilter] = useState('all');
    const [category, setCategory] = useState('registration'); // registration, payment
    const { agreements, isLoading: agreementsLoading } = useAgreements();
    const { userAgreements, isLoading: userAgreementsLoading, refetch: refetchUserAgreements } = useUserAgreements();
    const [requiredRegisterAgreements, setRequiredRegisterAgreements] = useState([]);
    const [requiredPaymentAgreements, setRequiredPaymentAgreements] = useState([]);
    
    const loading = agreementsLoading || userAgreementsLoading;

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const [reg, pay] = await Promise.all([
                    agreementService.getRequiredAgreementsForRegister(),
                    agreementService.getRequiredAgreementsForPayment(),
                ]);
                if (!mounted) return;
                setRequiredRegisterAgreements(Array.isArray(reg) ? reg : []);
                setRequiredPaymentAgreements(Array.isArray(pay) ? pay : []);
            } catch {
                if (!mounted) return;
                setRequiredRegisterAgreements([]);
                setRequiredPaymentAgreements([]);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        setFilter('all');
    }, [category]);

    const requiredIds = useMemo(() => {
        const list = category === 'registration' ? requiredRegisterAgreements : requiredPaymentAgreements;
        return new Set((list || []).map((a) => a?.agreementId).filter(Boolean));
    }, [category, requiredRegisterAgreements, requiredPaymentAgreements]);

    const filteredAgreements = useMemo(() => {
        if (!agreements?.length) return [];
        if (requiredIds.size === 0) return [];
        return agreements.filter((a) => requiredIds.has(a.agreementId));
    }, [agreements, requiredIds]);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tighter text-slate-900">Agreements</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Review updated legal documents and keep your account compliant.
                    </p>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setCategory('registration')}
                        className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-colors ${
                            category === 'registration'
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Registration
                    </button>
                    <button
                        type="button"
                        onClick={() => setCategory('payment')}
                        className={`px-4 py-2 rounded-2xl text-sm font-semibold border transition-colors ${
                            category === 'payment'
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Payment
                    </button>
                </div>

                <div className="rounded-[2rem] border border-slate-200/60 bg-white/90 px-4 py-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)] sm:px-6">
                    {(!loading && requiredIds.size === 0) ? (
                        <div className="py-10 text-center">
                            <div className="text-sm font-semibold text-slate-900">No required agreements configured</div>
                            <div className="mt-1 text-sm text-slate-500">
                                This section has no required agreements in the database.
                            </div>
                        </div>
                    ) : (
                        <AgreementsList
                            agreements={filteredAgreements}
                            userAgreements={userAgreements}
                            loading={loading}
                            filter={filter}
                            setFilter={setFilter}
                            onAccepted={() => {
                                if (refetchUserAgreements) refetchUserAgreements();
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgreementsPage;
