import { useTranslation } from "react-i18next";
import { Trash2 as TrashIcon } from 'lucide-react';
import { CART_UI, cartBtnSecondary, cartSurfacePanel } from '../uiPalette.js';
const ClearCartModal = ({
  isOpen,
  onClose,
  onConfirm,
  isClearing = false
}) => {
  const {
    t
  } = useTranslation();
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`mx-4 w-full max-w-md ${cartSurfacePanel}`} style={{
      borderColor: CART_UI.border
    }}>
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-status-error-bg p-2.5">
              <TrashIcon className="h-6 w-6 text-status-error" />
            </div>
            <h3 className="text-sm font-medium text-text-primary" style={{
            color: CART_UI.text
          }}>{t("clear_cart")}</h3>
          </div>

          <p className="mb-6 text-sm" style={{
          color: CART_UI.textMuted
        }}>{t("are_you_sure_you_want_to_remove_all_item")}</p>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={isClearing} className={`flex items-center justify-center ${cartBtnSecondary} flex-1 py-2.5 disabled:opacity-50`}>{t("cancel")}</button>
            <button type="button" onClick={onConfirm} disabled={isClearing} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-status-error-bg px-4 py-2.5 text-sm font-medium text-white transition hover:bg-status-error-bg disabled:opacity-50 active:scale-[0.99]">
              {isClearing ? <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
                  <span>{t("clearing")}</span>
                </> : <span>{t("clear_cart")}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default ClearCartModal;