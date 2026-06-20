import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from 'react';
import EmptyState from '../../../common/components/ui/EmptyState.jsx';
import { useEWallet } from '../../../ewallet/hooks/useEWallet.js';
import { usePaymentStatisticsQuery } from '../../hooks/queries.js';
import { EWalletActions, EWalletBalance } from '../WalletOverview.jsx';
const EWalletSection = () => {
  const {
    t
  } = useTranslation();
  const {
    eWallet,
    loading,
    error,
    createEWallet,
    updateLimits,
    updateSpendingWarningLimit,
    deposit,
    withdraw
  } = useEWallet({
    enabled: true
  });
  const [statisticsLoaded, setStatisticsLoaded] = useState(false);
  const {
    data: statsData,
    refetch: refetchStats
  } = usePaymentStatisticsQuery('EWALLET', {
    enabled: false
  });
  const totalAmount = typeof statsData?.totalAmount !== 'undefined' ? statsData.totalAmount : null;
  const fetchStatistics = useCallback(async () => {
    if (statisticsLoaded) return;
    try {
      await refetchStats();
    } finally {
      setStatisticsLoaded(true);
    }
  }, [statisticsLoaded, refetchStats]);
  return <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("ewallet")}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t("manage_your_wallet_balance_limits_and_tr")}</p>
                </div>
                {eWallet && <EWalletActions eWallet={eWallet} loading={loading} onCreateEWallet={createEWallet} onUpdateLimits={updateLimits} onUpdateSpendingWarningLimit={updateSpendingWarningLimit} onDeposit={deposit} onWithdraw={withdraw} />}
            </div>

            {error && <div className="mb-6 p-3 bg-status-error-bg border border-red-200 rounded-xl text-sm text-status-error">
                    {error}
                </div>}

            {!eWallet ? <EmptyState title={t("no_ewallet_found")} description="You don't have an eWallet yet. Create one to start using digital payments." variant="neutral" primaryAction={{
      label: loading ? 'Creating...' : 'Create eWallet',
      onClick: createEWallet,
      disabled: loading,
      variant: 'neutral'
    }} /> : <EWalletBalance eWallet={eWallet} totalAmount={totalAmount} statsData={statsData} statisticsLoaded={statisticsLoaded} onLoadStatistics={fetchStatistics} />}

        </div>;
};
export default EWalletSection;