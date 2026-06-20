import { useTranslation } from "react-i18next";
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
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
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background-primary rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="relative p-8">
                    {/* Close button */}
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    {/* Warning Icon */}
                    <div className="w-16 h-16 bg-status-warning-bg rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>

                    {/* Content */}
                    <h2 className="text-lg font-semibold text-text-primary mb-3 tracking-tight">{t("spending_warning")}</h2>
                    <p className="text-slate-500 leading-relaxed mb-8">{t("this_purchase_will_bring_your_total_mont")}<span className="font-bold text-text-primary">{formatCurrency(projectedSpent, currency)}</span>{t("which_exceeds_your_security_threshold_li")}<span className="font-bold text-text-primary">{formatCurrency(warningLimit, currency)}</span>.
                        <br /><br />{t("do_you_want_to_proceed_anyway")}</p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button onClick={onConfirm} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition-all active:scale-[0.98]">{t("yes_complete_purchase")}</button>
                        <button onClick={onClose} className="w-full py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">{t("cancel_and_go_back")}</button>
                    </div>
                </div>
            </div>
        </div>;
};
export default EWalletSpendingWarningModal;