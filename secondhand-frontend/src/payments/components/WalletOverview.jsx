import { useTranslation } from "react-i18next";
import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Pencil } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import WalletOperationModal from './modals/WalletOperationModal.jsx';
import { WALLET_OPERATION_MODES as MODES } from '../paymentSchema.js';
import { Button, Card } from '../../common/components/ui/index.js';

const EditButton = ({ label, onClick }) => (
  <Button variant="ghost" size="sm" onClick={onClick} aria-label={label} className="-mr-2 shrink-0">
    <Pencil className="h-4 w-4" strokeWidth={1.5} aria-hidden />
    <span className="hidden sm:inline">{label}</span>
  </Button>
);

/** Label, value and an edit action on one card: every number on this page can be changed where it is shown. */
const SettingCard = ({ label, value, editLabel, onEdit, children }) => (
  <Card className="flex flex-col">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm text-text-tertiary">{label}</p>
      <EditButton label={editLabel} onClick={onEdit} />
    </div>
    <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-text-primary">{value}</p>
    {children}
  </Card>
);

// Balance with the two money actions on the left; account limit and spending warning, each editable in
// place, on the right. One modal serves all four operations.
export const EWalletOverview = ({
  eWallet,
  loading,
  totalAmount,
  statsData,
  statisticsLoaded,
  onLoadStatistics,
  onDeposit,
  onWithdraw,
  onUpdateLimits,
  onUpdateSpendingWarningLimit
}) => {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null);
  const modalSubmit = useMemo(() => ({
    [MODES.DEPOSIT]: onDeposit,
    [MODES.WITHDRAW]: onWithdraw,
    [MODES.UPDATE_LIMIT]: onUpdateLimits,
    [MODES.UPDATE_WARNING]: onUpdateSpendingWarningLimit
  })[activeModal] ?? null, [activeModal, onDeposit, onWithdraw, onUpdateLimits, onUpdateSpendingWarningLimit]);

  if (!eWallet) return null;

  const warningLimit = eWallet.spendingWarningLimit;
  const spendKnown = statisticsLoaded && totalAmount != null;
  const spentPercentage = spendKnown && warningLimit ? Math.min((totalAmount / warningLimit) * 100, 100) : 0;
  const barTone = spentPercentage > 90 ? 'bg-status-error' : spentPercentage > 75 ? 'bg-status-warning' : 'bg-accent-teal';

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-text-tertiary">{t("available_balance")}</p>
            <span className="inline-flex items-center gap-1.5 text-sm text-text-tertiary"><span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />{t("active")}</span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-text-price">{formatCurrency(eWallet.balance || 0)}</p>
          <div className="mt-6 grid grid-cols-2 gap-2 pt-1 lg:mt-auto">
            <Button onClick={() => setActiveModal(MODES.DEPOSIT)}>
              <ArrowDownRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t("deposit")}
            </Button>
            <Button variant="secondary" onClick={() => setActiveModal(MODES.WITHDRAW)}>
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t("withdraw")}
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:gap-6">
          <SettingCard
            label={t("account_limit")}
            value={eWallet.limit ? formatCurrency(eWallet.limit) : t("unlimited", "Limitsiz")}
            editLabel={t("update_account_limit")}
            onEdit={() => setActiveModal(MODES.UPDATE_LIMIT)}
          >
            <p className="mt-1 text-sm text-text-secondary">{t("maximum_allowed")}</p>
          </SettingCard>

          <SettingCard
            label={t("warning_threshold")}
            value={warningLimit ? formatCurrency(warningLimit) : t("not_configured", "Tanımlanmamış")}
            editLabel={t("update_spending_warning_limit")}
            onEdit={() => setActiveModal(MODES.UPDATE_WARNING)}
          >
            {warningLimit ? (
              <div className="mt-4 border-t border-border-light pt-4">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-text-tertiary">{t("current_period_spend")}</span>
                  {spendKnown ? (
                    <span className="font-medium tabular-nums text-text-primary">{formatCurrency(totalAmount)}</span>
                  ) : (
                    <button type="button" onClick={onLoadStatistics} className="font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover">
                      {t("reveal")}
                    </button>
                  )}
                </div>
                {spendKnown && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-tertiary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(spentPercentage)}>
                    <div className={`h-full rounded-full ${barTone}`} style={{ width: `${spentPercentage}%` }} />
                  </div>
                )}
                {statisticsLoaded && statsData && (
                  <p className="mt-2 text-sm text-text-tertiary">
                    {t("incoming_outgoing_transactions")} <span className="font-medium tabular-nums text-text-secondary">{statsData.totalPayments ?? 0}</span>
                  </p>
                )}
              </div>
            ) : null}
          </SettingCard>
        </div>
      </div>

      <WalletOperationModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        mode={activeModal || MODES.DEPOSIT}
        onSubmit={modalSubmit || (() => {})}
        loading={loading}
        eWallet={eWallet}
      />
    </>
  );
};
