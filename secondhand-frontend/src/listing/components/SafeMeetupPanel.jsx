import { useTranslation } from "react-i18next";
import React from 'react';
import { ShieldCheck, MapPin, QrCode, Lock } from 'lucide-react';

const SafeMeetupPanel = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
            {t("safe_meetup_protection", "Güvenli Buluşma Koruması")}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            {t("safe_meetup_subtitle", "SecondHand Escrow ile güvenli alım-satım güvencesi")}
          </p>
        </div>
      </div>
      
      <p className="text-xs leading-relaxed text-slate-600 font-medium mb-6">
        {t("this_transaction_is_secured_by_our", "Bu işlem platformumuzun ")}
        <strong className="text-slate-900 font-black">{t("safe_meetup_guarantee", "Güvenli Buluşma Garantisi")}</strong>
        {t("follow_these_micro_steps_to_secure_your_", " altındadır. Adımları takip ederek güvenle teslim alın:")}
      </p>

      {/* Visual Micro-Steps Flowchart */}
      <div className="space-y-4 relative before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200/80">
        
        {/* Step 1: Escrow */}
        <div className="relative flex gap-3.5 items-start z-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div className="pt-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                1. Adım
              </span>
              <h4 className="text-xs font-black text-slate-900 truncate">
                {t("1_escrow_protection", "Güvence Havuzu Koruması")}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
              {t("funds_are_locked_safely_in_escrow_they_a", "Ödemeniz güvence havuzunda kilitlenir; onay vermeden satıcıya aktarılmaz.")}
            </p>
          </div>
        </div>

        {/* Step 2: Inspection */}
        <div className="relative flex gap-3.5 items-start z-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="pt-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                2. Adım
              </span>
              <h4 className="text-xs font-black text-slate-900 truncate">
                {t("2_inspect_in_public", "Güvenli Noktada İnceleyin")}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
              {t("meet_only_in_well_lit_public_swap_locati", "Ürünü kamusal, aydınlık bir alanda teslim alıp fiziksel durumunu kontrol edin.")}
            </p>
          </div>
        </div>

        {/* Step 3: PIN/QR Completion */}
        <div className="relative flex gap-3.5 items-start z-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <div className="pt-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900">
                3. Adım
              </span>
              <h4 className="text-xs font-black text-slate-900 truncate">
                {t("3_instantly_unlock", "PIN ile Anında Onaylayın")}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
              {t("share_your_secure_dynamic_qr_or_pin_with", "Ürünü teslim aldıktan sonra satıcıya dinamik QR/PIN kodunuzu vererek işlemi tamamlayın.")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SafeMeetupPanel;