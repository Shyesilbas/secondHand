import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../notification/NotificationContext.jsx';
import BankAccountsSection from './components/BankAccountsSection.jsx';
import CreditCardsSection from './components/CreditCardsSection.jsx';
import EWalletSection from './components/EWalletSection.jsx';

const PaymentMethodsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [activeTab, setActiveTab] = useState('bank-accounts');

        const isLoading = false;
    const error = null;

    const tabs = [
        { id: 'bank-accounts', label: 'Bank Accounts', icon: '🏦' },
        { id: 'credit-cards', label: 'Credit Cards', icon: '💳' },
        { id: 'ewallet', label: 'eWallet', icon: '👛' }
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Go Back
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900">Payment Methods</h1>
                            <p className="text-gray-600 mt-1">
                                Manage your payment methods and financial information
                            </p>
                        </div>
                    </div>
                </div>

            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                    activeTab === tab.id
                                        ? 'border-gray-900 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {null}

            {isLoading && (
                <div className="space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div
                        className={`grid grid-cols-1 ${
                            activeTab === 'credit-cards' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'
                        } gap-6`}
                    >
                        {[...Array(activeTab === 'credit-cards' ? 3 : 2)].map((_, i) => (
                            <div key={i} className="bg-white rounded border border-gray-200 p-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && (
                <>
                    {activeTab === 'bank-accounts' && <BankAccountsSection />}

                    {activeTab === 'credit-cards' && <CreditCardsSection />}

                    {activeTab === 'ewallet' && <EWalletSection />}
                </>
            )}

            {/* Modals are managed inside section components now */}
            </div>
        </div>
    );
};

export default PaymentMethodsPage;
