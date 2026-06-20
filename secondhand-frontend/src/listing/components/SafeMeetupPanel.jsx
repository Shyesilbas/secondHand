import { useTranslation } from "react-i18next";
import { ShieldCheck, Wallet, MapPin, QrCode } from 'lucide-react';
const SafeMeetupPanel = () => {
  const {
    t
  } = useTranslation();
  return <div className="bg-slate-50/60 border border-slate-100/80 rounded-3xl p-6 sm:p-8 mb-10 shadow-[0_2px_8px_-1px_rgba(15,23,42,0.01)]">
      <h3 className="text-sm font-medium text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />{t("safe_meetup_protection")}</h3>
      <p className="text-sm leading-relaxed text-slate-600 font-medium mb-6">{t("this_transaction_is_secured_by_our")}<strong>{t("safe_meetup_guarantee")}</strong>{t("follow_these_micro_steps_to_secure_your_")}</p>

      {/* Visual Micro-Steps Flowchart */}
      <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{t("1_escrow_protection")}</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{t("funds_are_locked_safely_in_escrow_they_a")}</p>
          </div>
        </div>

        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600 shadow-sm">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{t("2_inspect_in_public")}</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{t("meet_only_in_well_lit_public_swap_locati")}</p>
          </div>
        </div>

        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
            <QrCode className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{t("3_instantly_unlock")}</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{t("share_your_secure_dynamic_qr_or_pin_with")}</p>
          </div>
        </div>
      </div>
    </div>;
};
export default SafeMeetupPanel;