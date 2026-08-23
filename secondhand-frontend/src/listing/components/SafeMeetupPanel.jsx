import { useTranslation } from "react-i18next";
import { ShieldCheck, Wallet, MapPin, QrCode } from 'lucide-react';

const SafeMeetupPanel = () => {
 const { t } = useTranslation();

 return (
 <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 sm:p-6 mb-4 shadow-xs">
 <div className="flex items-center gap-2.5 mb-3">
 <div className="p-2 rounded-xl bg-slate-200 text-slate-900">
 <ShieldCheck className="w-5 h-5" />
 </div>
 <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">
 {t("safe_meetup_protection", "Güvenli Buluşma Koruması")}
 </h3>
 </div>
 
 <p className="text-xs leading-relaxed text-slate-600 font-medium mb-6">
 {t("this_transaction_is_secured_by_our", "Bu işlem platformumuzun ")}
 <strong className="text-slate-900 font-extrabold">{t("safe_meetup_guarantee", "Güvenli Buluşma Garantisi")}</strong>
 {t("follow_these_micro_steps_to_secure_your_", " altındadır. Adımları takip ederek güvenle teslim alın:")}
 </p>

 {/* Visual Micro-Steps Flowchart */}
 <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
 <div className="relative flex gap-3.5 items-start z-10">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-xs font-extrabold text-xs">
 1
 </div>
 <div className="pt-0.5">
 <h4 className="text-xs font-extrabold text-slate-900">{t("1_escrow_protection", "1. Güvence Havuzu Koruması")}</h4>
 <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{t("funds_are_locked_safely_in_escrow_they_a", "Ödemeniz güvence havuzunda kilitlenir; onay vermeden satıcıya aktarılmaz.")}</p>
 </div>
 </div>

 <div className="relative flex gap-3.5 items-start z-10">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200 text-amber-600 shadow-xs font-extrabold text-xs">
 2
 </div>
 <div className="pt-0.5">
 <h4 className="text-xs font-extrabold text-slate-900">{t("2_inspect_in_public", "2. Güvenli Noktada İnceleyin")}</h4>
 <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{t("meet_only_in_well_lit_public_swap_locati", "Ürünü kamusal, aydınlık bir alanda teslim alıp fiziksel durumunu kontrol edin.")}</p>
 </div>
 </div>

 <div className="relative flex gap-3.5 items-start z-10">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200 text-blue-600 shadow-xs font-extrabold text-xs">
 3
 </div>
 <div className="pt-0.5">
 <h4 className="text-xs font-extrabold text-slate-900">{t("3_instantly_unlock", "3. PIN ile Anında Onaylayın")}</h4>
 <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{t("share_your_secure_dynamic_qr_or_pin_with", "Ürünü teslim aldıktan sonra satıcıya dinamik QR/PIN kodunuzu vererek işlemi tamamlayın.")}</p>
 </div>
 </div>
 </div>
 </div>
 );
};

export default SafeMeetupPanel;