import { useTranslation } from "react-i18next";
import { useCallback, useState } from 'react';
import EmptyState from '../../../common/components/ui/EmptyState.jsx';
import { useEWallet } from '../../../ewallet/hooks/useEWallet.js';
import { usePaymentStatisticsQuery } from '../../hooks/queries.js';
import { Link } from 'react-router-dom';
import PageHeader from '../../../common/components/ui/PageHeader.jsx';
import { buttonClasses } from '../../../common/components/ui/Button.jsx';
import { ROUTES } from '../../../common/constants/routes.js';
import { EWalletOverview } from '../WalletOverview.jsx';
// Owns the page header so its action (transaction history) sits on the same row as the title.
const EWalletSection = ({ back = null }) => {
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
 <PageHeader
 back={back}
 title={t("wallet")}
 subtitle={t("manage_your_wallet_balance_and_limits")}
 actions={eWallet ? <Link to={ROUTES.PAYMENTS} className={buttonClasses('secondary', 'sm')}>{t("payment_history")}</Link> : null}
 className="mb-8"
 />

 {error && <div className="mb-6 p-3 rounded border border-status-error-border bg-status-error-bg text-sm text-status-error-text" role="alert">
 {error}
 </div>}

 {!eWallet ? <EmptyState title={t("no_ewallet_found")} description={t('ewallet_empty_desc')} variant="neutral" primaryAction={{
 label: loading ? t('ewallet_creating') : t('ewallet_create'),
 onClick: createEWallet,
 disabled: loading,
 variant: 'neutral'
 }} /> : <EWalletOverview eWallet={eWallet} loading={loading} totalAmount={totalAmount} statsData={statsData} statisticsLoaded={statisticsLoaded} onLoadStatistics={fetchStatistics} onDeposit={deposit} onWithdraw={withdraw} onUpdateLimits={updateLimits} onUpdateSpendingWarningLimit={updateSpendingWarningLimit} />}

 </div>;
};
export default EWalletSection;
