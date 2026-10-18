import { useTranslation } from "react-i18next";
import { ShieldCheck, MapPin, QrCode, Lock } from 'lucide-react';

const SafeMeetupPanel = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-border/80 rounded-md p-6 sm:p-7">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-border-light">
        <div className="p-2 rounded bg-primary text-white">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-text-primary">
            {t("safe_meetup_protection", "Güvenli Buluşma Koruması")}
          </h3>
          <p className="text-xs text-text-muted font-medium">
            {t("safe_meetup_subtitle", "SecondHand Escrow ile güvenli alım-satım güvencesi")}
          </p>
        </div>
      </div>
      
      <p className="text-xs leading-relaxed text-text-secondary font-medium mb-6">
        {t("this_transaction_is_secured_by_our", "Bu işlem platformumuzun ")}
        <strong className="text-text-primary font-semibold">{t("safe_meetup_guarantee", "Güvenli Buluşma Garantisi")}</strong>
        {t("follow_these_micro_steps_to_secure_your_", " altındadır. Adımları takip ederek güvenle teslim alın:")}
      </p>

      {/* Visual Micro-Steps Flowchart */}
      <div className="space-y-4 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-secondary-200/80">
        
        {/* Step 1: Escrow */}
        <div className="relative flex gap-3.5 items-start z-10">
          <Lock className="shrink-0 h-5 w-5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          <div className="pt-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-background-tertiary text-text-secondary">
                1. Adım
              </span>
              <h4 className="text-xs font-semibold text-text-primary truncate">
                {t("1_escrow_protection", "Güvence Havuzu Koruması")}
              </h4>
            </div>
            <p className="text-xs text-text-tertiary font-medium mt-1 leading-relaxed">
              {t("funds_are_locked_safely_in_escrow_they_a", "Ödemeniz güvence havuzunda kilitlenir; onay vermeden satıcıya aktarılmaz.")}
            </p>
          </div>
        </div>

        {/* Step 2: Inspection */}
        <div className="relative flex gap-3.5 items-start z-10">
          <MapPin className="shrink-0 h-5 w-5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          <div className="pt-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-background-secondary text-status-warning-text">
                2. Adım
              </span>
              <h4 className="text-xs font-semibold text-text-primary truncate">
                {t("2_inspect_in_public", "Güvenli Noktada İnceleyin")}
              </h4>
            </div>
            <p className="text-xs text-text-tertiary font-medium mt-1 leading-relaxed">
              {t("meet_only_in_well_lit_public_swap_locati", "Ürünü kamusal, aydınlık bir alanda teslim alıp fiziksel durumunu kontrol edin.")}
            </p>
          </div>
        </div>

        {/* Step 3: PIN/QR Completion */}
        <div className="relative flex gap-3.5 items-start z-10">
          <QrCode className="shrink-0 h-5 w-5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          <div className="pt-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-background-tertiary text-text-primary">
                3. Adım
              </span>
              <h4 className="text-xs font-semibold text-text-primary truncate">
                {t("3_instantly_unlock", "PIN ile Anında Onaylayın")}
              </h4>
            </div>
            <p className="text-xs text-text-tertiary font-medium mt-1 leading-relaxed">
              {t("share_your_secure_dynamic_qr_or_pin_with", "Ürünü teslim aldıktan sonra satıcıya dinamik QR/PIN kodunuzu vererek işlemi tamamlayın.")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SafeMeetupPanel;