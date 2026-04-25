import React, {useEffect, useMemo, useState} from 'react';
import AgreementsList from './AgreementsList.jsx';
import {useAgreements, useUserAgreements} from '../hooks/useAgreements.js';
import {agreementService} from '../services/agreementService.js';
import {FileText, UserCheck, CreditCard} from 'lucide-react';

const CATEGORIES = [
    {key: 'registration', label: 'Registration', icon: UserCheck, description: 'Account & privacy agreements'},
    {key: 'payment', label: 'Payment', icon: CreditCard, description: 'Transaction & payment terms'},
];

const AgreementsPage = () => {
    const [filter, setFilter] = useState('all');
    const [category, setCategory] = useState('registration');
    const {agreements, isLoading: agreementsLoading} = useAgreements();
    const {userAgreements, isLoading: userAgreementsLoading, refetch: refetchUserAgreements} = useUserAgreements();
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

    const activeCat = CATEGORIES.find(c => c.key === category);

    return (
        <div className="min-h-screen bg-gray-50/80">
            {/* ── Page Header ─────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200/80">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/10">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Legal Agreements</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Review and accept required legal documents for your account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Left: Category Sidebar ──────────────── */}
                    <div className="lg:w-64 shrink-0">
                        <nav className="bg-white rounded-2xl border border-gray-200 overflow-hidden lg:sticky lg:top-6">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Category</span>
                            </div>
                            <div className="p-2">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = category === cat.key;
                                    return (
                                        <button
                                            key={cat.key}
                                            type="button"
                                            onClick={() => setCategory(cat.key)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                isActive ? 'bg-white/15' : 'bg-gray-100'
                                            }`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                                    {cat.label}
                                                </div>
                                                <div className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {cat.description}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>

                    {/* ── Right: Content Panel ────────────────── */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    {activeCat && (
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <activeCat.icon className="w-4.5 h-4.5 text-gray-600" />
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">{activeCat?.label} Agreements</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">{activeCat?.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {(!loading && requiredIds.size === 0) ? (
                                    <div className="py-12 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">No required agreements</p>
                                        <p className="text-sm text-gray-500 mt-1">This section has no required agreements configured.</p>
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
                </div>
            </div>
        </div>
    );
};

export default AgreementsPage;
