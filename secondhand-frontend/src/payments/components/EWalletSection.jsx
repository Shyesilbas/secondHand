import React from 'react';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { paymentService } from '../services/paymentService.js';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import EWalletBalance from './EWalletBalance.jsx';
import EWalletActions from './EWalletActions.jsx';

const EWalletSection = () => {
    const { eWallet, loading, error, createEWallet, updateLimits, updateSpendingWarningLimit, deposit, withdraw } = useEWallet({ enabled: true });
    
    const [totalSpent, setTotalSpent] = React.useState(null);
    const [statisticsLoaded, setStatisticsLoaded] = React.useState(false);

    const fetchStatistics = React.useCallback(async () => {
        if (statisticsLoaded) return;
        try {
            const stats = await paymentService.getStatistics('EWALLET');
            if (stats && typeof stats.totalAmount !== 'undefined') {
                setTotalSpent(stats.totalAmount);
            }
            setStatisticsLoaded(true);
        } catch {
            setStatisticsLoaded(true);
        }
    }, [statisticsLoaded]);

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">eWallet</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your wallet balance, limits and transfers</p>
                </div>
                {eWallet && (
                    <EWalletActions
                        eWallet={eWallet}
                        loading={loading}
                        onCreateEWallet={createEWallet}
                        onUpdateLimits={updateLimits}
                        onUpdateSpendingWarningLimit={updateSpendingWarningLimit}
                        onDeposit={deposit}
                        onWithdraw={withdraw}
                    />
                )}
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                </div>
            )}

            {!eWallet ? (
                <EmptyState
                    title="No eWallet Found"
                    description="You don't have an eWallet yet. Create one to start using digital payments."
                    variant="neutral"
                    primaryAction={{
                        label: loading ? 'Creating...' : 'Create eWallet',
                        onClick: () => {},
                        disabled: loading,
                        variant: 'neutral'
                    }}
                />
            ) : (
                <EWalletBalance
                    eWallet={eWallet}
                    totalSpent={totalSpent}
                    statisticsLoaded={statisticsLoaded}
                    onLoadStatistics={fetchStatistics}
                />
            )}

        </div>
    );
};

export default EWalletSection;
