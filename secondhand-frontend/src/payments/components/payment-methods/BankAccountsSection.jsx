import React, { useState } from 'react';
import { Plus as PlusIcon } from 'lucide-react';
import EmptyState from '../../../common/components/ui/EmptyState.jsx';
import FinancialCards from '../FinancialCards.jsx';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { useBankAccountMutations } from '../../hooks/useFinancialAccountManager.js';
import { useBankAccountsQuery, usePaymentStatisticsQuery } from '../../hooks/queries.js';

const BankAccountsSection = () => {
    const notification = useNotification();
    const [deletingBankAccountId, setDeletingBankAccountId] = useState(null);
    const { data: bankAccounts = [], isLoading, error } = useBankAccountsQuery();
    const { createBankAccount, deleteBankAccount, isCreating, isDeleting } = useBankAccountMutations();
    const { data: statsData } = usePaymentStatisticsQuery('TRANSFER');
    const totalAmount = typeof statsData?.totalAmount !== 'undefined' ? statsData.totalAmount : null;

    const handleCreateBankAccount = async () => {
        notification.showConfirmation(
            'Create Bank Account',
            'Are you sure you want to create a new bank account?',
            async () => {
                try {
                    await createBankAccount();
                    notification.showSuccess('Success', 'Bank account created successfully!');
                } catch (err) {
                    const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Error occurred while creating bank account';
                    notification.showError('Error', errorMessage);
                }
            }
        );
    };

    const handleDeleteBankAccount = (account) => {
        const id = account?.id;
        if (id == null) {
            notification.showError('Error', 'Invalid bank account.');
            return;
        }
        const label = account?.IBAN ? String(account.IBAN).slice(-4) : '';
        notification.showConfirmation(
            'Delete Bank Account',
            label
                ? `Are you sure you want to delete the bank account ending in ${label}?`
                : 'Are you sure you want to delete this bank account?',
            async () => {
                try {
                    setDeletingBankAccountId(id);
                    await deleteBankAccount(id);
                    notification.showSuccess('Success', 'Bank account deleted successfully!');
                } catch (err) {
                    const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Error occurred while deleting bank account';
                    notification.showError('Error', errorMessage);
                } finally {
                    setDeletingBankAccountId(null);
                }
            }
        );
    };

    return (
        <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        Bank Accounts ({bankAccounts.length})
                    </h2>
                    {totalAmount != null && (
                        <div className="mt-2 text-sm text-slate-500">
                            Incoming + Outgoing Volume (Bank Transfer):
                            <span className="ml-2 font-semibold text-slate-900">{formatCurrency(totalAmount)}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleCreateBankAccount}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    disabled={isCreating}
                >
                    <PlusIcon className="w-4 h-4" />
                    {isCreating ? 'Creating...' : 'Add Bank Account'}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600">{error?.response?.data?.detail || error?.response?.data?.message || error?.message || error}</p>
                </div>
            )}

            {statsData && (
                <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs text-slate-500">Incoming + Outgoing</p>
                        <p className="mt-1 text-base font-semibold text-slate-900">{statsData.totalPayments ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs text-slate-500">Successful</p>
                        <p className="mt-1 text-base font-semibold text-emerald-600">{statsData.successfulPayments ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs text-slate-500">Failed</p>
                        <p className="mt-1 text-base font-semibold text-rose-600">{statsData.failedPayments ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs text-slate-500">Success Rate</p>
                        <p className="mt-1 text-base font-semibold text-slate-900">%{(statsData.successRate ?? 0).toFixed(1)}</p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="animate-pulse space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6">
                            <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 p-6">
                            <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            ) : bankAccounts.length === 0 ? (
                <EmptyState
                    title="No Bank Account Found"
                    description="You don't have a registered bank account yet."
                    variant="green"
                    primaryAction={{
                        label: isCreating ? 'Creating...' : 'Create Bank Account',
                        onClick: handleCreateBankAccount,
                        disabled: isCreating,
                        variant: 'green'
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bankAccounts.map((account) => (
                        <FinancialCards
                            key={account.id ?? account.IBAN}
                            account={account}
                            onDelete={() => handleDeleteBankAccount(account)}
                            isDeleting={isDeleting && deletingBankAccountId === account.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BankAccountsSection;
