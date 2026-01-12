import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, BanknotesIcon, CreditCardIcon, WalletIcon } from '@heroicons/react/24/outline';
import BankAccountsSection from './components/BankAccountsSection.jsx';
import CreditCardsSection from './components/CreditCardsSection.jsx';
import EWalletSection from './components/EWalletSection.jsx';

const PaymentMethodsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('bank-accounts');

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['bank-accounts', 'credit-cards', 'ewallet'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const tabs = [
        { 
            id: 'bank-accounts', 
            label: 'Bank Accounts', 
            icon: BanknotesIcon 
        },
        { 
            id: 'credit-cards', 
            label: 'Credit Cards', 
            icon: CreditCardIcon 
        },
        { 
            id: 'ewallet', 
            label: 'eWallet', 
            icon: WalletIcon 
        }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const url = new URL(window.location);
        url.searchParams.set('tab', tabId);
        window.history.replaceState({}, '', url);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] tracking-tight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md mb-6 group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-slate-900 mb-2 tracking-tight">
                            Payment Methods
                        </h1>
                        <p className="text-sm text-slate-500 tracking-tight">
                            Manage your payment methods and financial information
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="p-4">
                        <nav className="relative flex bg-slate-100 rounded-2xl p-1.5" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`
                                            relative flex-1 flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 tracking-tight
                                            ${isActive
                                                ? 'text-indigo-600 bg-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="px-6 pb-6">
                        <div key={activeTab} className="opacity-0 animate-[fadeIn_0.25s_ease-in-out_forwards]">
                            {activeTab === 'bank-accounts' && <BankAccountsSection />}
                            {activeTab === 'credit-cards' && <CreditCardsSection />}
                            {activeTab === 'ewallet' && <EWalletSection />}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default PaymentMethodsPage;