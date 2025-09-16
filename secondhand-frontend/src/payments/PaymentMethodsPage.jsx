import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../notification/NotificationContext.jsx';
// Removed inline EmptyState usage; handled inside section components
import BankAccountsSection from './components/BankAccountsSection.jsx';
import CreditCardsSection from './components/CreditCardsSection.jsx';
import EWalletSection from './components/EWalletSection.jsx';

const PaymentMethodsPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [activeTab, setActiveTab] = useState('bank-accounts');

    // All data/state for sections are now owned by their components
    const isLoading = false;
    const error = null;

    const tabs = [
        { id: 'bank-accounts', label: 'Bank Accounts', icon: '🏦', color: 'green' },
        { id: 'credit-cards', label: 'Credit Cards', icon: '💳', color: 'blue' },
        { id: 'ewallet', label: 'eWallet', icon: '👛', color: 'purple' }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Go Back
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">Payment Methods</h1>
                        <p className="text-text-secondary mt-2">
                            Manage your payment methods and financial information
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="border-b border-sidebar-border">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                    activeTab === tab.id
                                        ? `border-${tab.color}-500 text-${tab.color}-600`
                                        : 'border-transparent text-text-muted hover:text-text-secondary hover:border-header-border'
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
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div
                        className={`grid grid-cols-1 ${
                            activeTab === 'credit-cards' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'
                        } gap-6`}
                    >
                        {[...Array(activeTab === 'credit-cards' ? 3 : 2)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg border p-6">
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
    );
};

export default PaymentMethodsPage;
