import { useTranslation } from "react-i18next";
import React from 'react';
import { ShieldCheck, Wallet, MapPin, QrCode } from 'lucide-react';

const SafeMeetupPanel = ({ listing }) => {
  const { t } = useTranslation();
  
  if (listing && !listing.allowMeetup) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-md shadow-slate-200/50">
      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        {t("safe_meetup_protection")}
      </h3>
      <p className="text-xs leading-relaxed text-slate-600 font-medium mb-6">
        {t("this_transaction_is_secured_by_our")}{" "}
        <strong className="text-slate-900 font-bold">{t("safe_meetup_guarantee")}</strong>.{" "}
        {t("follow_these_micro_steps_to_secure_your_")}
      </p>

      {/* Visual Micro-Steps Flowchart */}
      <div className="space-y-5 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t("1_escrow_protection")}</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{t("funds_are_locked_safely_in_escrow_they_a")}</p>
          </div>
        </div>

        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t("2_inspect_in_public")}</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{t("meet_only_in_well_lit_public_swap_locati")}</p>
          </div>
        </div>

        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm">
            <QrCode className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{t("3_instantly_unlock")}</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{t("share_your_secure_dynamic_qr_or_pin_with")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeMeetupPanel;