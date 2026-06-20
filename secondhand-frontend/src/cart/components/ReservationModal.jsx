import { useTranslation } from "react-i18next";
import React from 'react';
import { AlertTriangle } from 'lucide-react';
const ReservationModal = ({
  isOpen,
  onClose,
  cartItem
}) => {
  const {
    t
  } = useTranslation();
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-background-primary rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-status-warning-bg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-status-warning" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-text-primary mb-2">{t("low_stock_alert")}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{t("limited_stock_available_this_item_is_res")}</p>
                        {cartItem?.listing?.title && <p className="mt-3 text-sm font-medium text-slate-800 truncate">{cartItem.listing.title}</p>}
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">{t("got_it")}</button>
            </div>
        </div>;
};
export default ReservationModal;