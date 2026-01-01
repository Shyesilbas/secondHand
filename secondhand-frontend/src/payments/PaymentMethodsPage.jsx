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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
                        Back
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                            Payment Methods
                        </h1>
                        <p className="text-sm text-gray-600">
                            Manage your payment methods and financial information
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`
                                            flex-1 flex items-center justify-center py-4 px-6 text-sm font-medium transition-colors
                                            ${isActive
                                                ? 'text-gray-900 border-b-2 border-gray-900'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 mr-2 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'bank-accounts' && <BankAccountsSection />}
                        {activeTab === 'credit-cards' && <CreditCardsSection />}
                        {activeTab === 'ewallet' && <EWalletSection />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodsPage;