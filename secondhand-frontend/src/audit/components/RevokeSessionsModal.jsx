import React from 'react';
import { useTranslation } from "react-i18next";
import { AlertTriangle, X, ShieldAlert, LogOut } from 'lucide-react';

const RevokeSessionsModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {t("revoke_all_sessions", "Tüm Oturumları Kapat")}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {t("security_action_confirmation", "Kritik güvenlik aksiyonu")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label={t("close", "Kapat")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-2 space-y-4">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {t(
              "this_action_will_immediately_log_you_out",
              "Bu işlem şu anda kullandığınız cihaz da dahil olmak üzere tüm aktif cihaz ve tarayıcılardaki oturumlarınızı anında sonlandırır."
            )}
          </p>

          <div className="p-4 bg-rose-50/70 border border-rose-200/70 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{t("important_security_notice", "Önemli Güvenlik Bilgisi")}</span>
            </div>
            <ul className="text-xs text-rose-900/80 font-medium space-y-1.5 pl-6 list-disc">
              <li>{t("all_active_sessions_will_be_terminated", "Tüm aktif oturumlar derhal sonlandırılır.")}</li>
              <li>{t("you_ll_be_logged_out_from_all_devices", "Tüm cihazlardan çıkış yapılacak ve oturumunuz kapatılacaktır.")}</li>
              <li>{t("this_action_cannot_be_undone", "Bu işlem geri alınamaz.")}</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 pt-5 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            {t("cancel", "Vazgeç")}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("revoking", "Kapatılıyor...")}</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>{t("revoke_all_sessions", "Oturumları Kapat")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevokeSessionsModal;