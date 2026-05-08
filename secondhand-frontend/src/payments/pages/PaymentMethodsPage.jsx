import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft as ArrowLeftIcon,
    Banknote as BanknotesIcon,
    CreditCard as CreditCardIcon,
    Wallet as WalletIcon,
} from 'lucide-react';
import BankAccountsSection from '../components/payment-methods/BankAccountsSection.jsx';
import CreditCardsSection from '../components/payment-methods/CreditCardsSection.jsx';
import EWalletSection from '../components/payment-methods/EWalletSection.jsx';

const PaymentMethodsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('credit-cards');

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['bank-accounts', 'credit-cards', 'ewallet'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const tabs = [
        { id: 'credit-cards', label: 'Credit Cards', icon: CreditCardIcon },
        { id: 'bank-accounts', label: 'Bank Accounts', icon: BanknotesIcon },
        { id: 'ewallet', label: 'eWallet', icon: WalletIcon },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const url = new URL(window.location);
        url.searchParams.set('tab', tabId);
        window.history.replaceState({}, '', url);
    };

    return (
        <div className="min-h-screen bg-slate-50 tracking-tight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-200/80 group shrink-0"
                    >
                        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                            <CreditCardIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Methods</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Manage your saved cards, accounts and wallet</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-slate-200/50 rounded-2xl p-1.5 gap-1.5 mb-10 w-full lg:max-w-xl">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300
                                    ${isActive
                                        ? 'bg-white text-slate-900 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] ring-1 ring-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div>
                    <div key={activeTab}>
                        {activeTab === 'credit-cards' && <CreditCardsSection />}
                        {activeTab === 'bank-accounts' && <BankAccountsSection />}
                        {activeTab === 'ewallet' && <EWalletSection />}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentMethodsPage;
