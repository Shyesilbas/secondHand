import { useTranslation } from "react-i18next";
import { formatCurrency } from '../../common/formatters.js';
import { Button, Modal } from '../../common/components/ui/index.js';
const EWalletSpendingWarningModal = ({
 isOpen,
 onClose,
 onConfirm,
 projectedSpent,
 warningLimit,
 currency = 'TRY'
}) => {
 const {
 t
 } = useTranslation();
 return <Modal isOpen={isOpen} onClose={onClose} title={t("spending_warning")} size="sm" footer={<>
 <Button variant="secondary" onClick={onClose}>{t("cancel_and_go_back")}</Button>
 <Button onClick={onConfirm}>{t("yes_complete_purchase")}</Button>
 </>}>
 <p className="text-sm leading-relaxed text-text-secondary">
 {t("this_purchase_will_bring_your_total_mont")}<span className="font-medium tabular-nums text-text-primary">{formatCurrency(projectedSpent, currency)}</span>{t("which_exceeds_your_security_threshold_li")}<span className="font-medium tabular-nums text-text-primary">{formatCurrency(warningLimit, currency)}</span>.
 </p>
 <p className="mt-3 text-sm text-text-secondary">{t("do_you_want_to_proceed_anyway")}</p>
 </Modal>;
};
export default EWalletSpendingWarningModal;
