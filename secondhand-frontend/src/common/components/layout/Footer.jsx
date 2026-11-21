import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from '../../../auth/AuthContext.jsx';
import { useEnums } from '../../hooks/useEnums.js';
import { useAgreements } from '../../../agreements/hooks/useAgreements.js';
import AgreementModal from '../../../agreements/components/AgreementModal.jsx';
import { formatCurrency } from '../../formatters.js';
import { ROUTES } from '../../constants/routes.js';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BrandMark from './BrandMark.jsx';

// The footer sits on the dark primary surface, so it uses the light end of the secondary scale
// (secondary-300 body, secondary-400 icons and labels, primary-600 dividers) instead of the
// text-text-* tokens, which are tuned for light surfaces and fall below 4.5:1 here.
const LINK = 'text-sm font-medium tracking-tight text-secondary-300 transition-colors duration-150 hover:text-white';
const TOGGLE_BTN = 'inline-flex items-center gap-1.5 rounded border border-primary-600 px-2.5 py-1 text-sm font-medium tracking-tight text-secondary-300 transition-colors duration-150 hover:border-secondary-500 hover:bg-primary-700 hover:text-white';
const PRICE_ROW = 'flex items-center justify-between gap-4';
const PRICE_LABEL = 'tracking-tight text-secondary-400';
const PRICE_VALUE = 'tabular-nums text-secondary-100';

const Footer = () => {
  const { t } = useTranslation();
  const { enums, isLoading } = useEnums();
  const { isAuthenticated } = useAuthState();
  const [showPricing, setShowPricing] = useState(false);
  const [loadAgreements, setLoadAgreements] = useState(false);
  const [openAgreement, setOpenAgreement] = useState(null);
  const { agreements, isLoading: agreementsLoading } = useAgreements({
    enabled: !isAuthenticated && loadAgreements
  });
  const feeConfig = enums.listingFeeConfig;
  const showcasePricing = enums.showcasePricingConfig;
  const isLoadingPricing = isLoading;

  return (
    <footer className="bg-primary text-secondary-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark size="sm" tone="inverse" />

          <nav aria-label={t("secondhand")} className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to={ROUTES.ABOUT} className={LINK}>
              {t("about_secondhand")}
            </Link>
            <Link to={ROUTES.FORUM} className={LINK}>
              {t("forum_community")}
            </Link>
            {isAuthenticated ? (
              <Link to={ROUTES.AGREEMENTS_ALL} className={LINK}>
                {t("my_agreements")}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setLoadAgreements((prev) => !prev)}
                aria-expanded={loadAgreements}
                className={TOGGLE_BTN}
              >
                <span>{t("load_legal_documents")}</span>
                {loadAgreements
                  ? <ChevronUp className="h-3.5 w-3.5 text-secondary-400" strokeWidth={1.5} aria-hidden="true" />
                  : <ChevronDown className="h-3.5 w-3.5 text-secondary-400" strokeWidth={1.5} aria-hidden="true" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPricing((prev) => !prev)}
              aria-expanded={showPricing}
              className={TOGGLE_BTN}
            >
              <span>{showPricing ? t("hide_pricing") : t("show_pricing")}</span>
              {showPricing
                ? <ChevronUp className="h-3.5 w-3.5 text-secondary-400" strokeWidth={1.5} aria-hidden="true" />
                : <ChevronDown className="h-3.5 w-3.5 text-secondary-400" strokeWidth={1.5} aria-hidden="true" />}
            </button>
          </nav>
        </div>

        {!isAuthenticated && loadAgreements && (
          <div className="mt-3 border-t border-primary-600 pt-2.5">
            {agreementsLoading ? (
              <div className="flex flex-wrap gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={`agreement-skeleton-${i}`} className="h-4 w-28 rounded bg-primary-700 animate-pulse" />
                ))}
              </div>
            ) : agreements && agreements.length > 0 ? (
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {agreements.map((agreement) => (
                  <li key={agreement.agreementId}>
                    <button type="button" onClick={() => setOpenAgreement(agreement)} className={`${LINK} font-normal`}>
                      <span>{agreement.agreementType.replace(/_/g, ' ')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {['Terms of Service', 'Privacy Policy', 'KVKK'].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-secondary-400 tracking-tight">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {showPricing && (
          <div className="mt-3 rounded border border-primary-600 bg-primary-900 p-3">
            {isLoadingPricing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(2)].map((_, i) => (
                  <div key={`fee-skeleton-${i}`} className="space-y-1.5">
                    <div className="h-3.5 w-24 rounded bg-primary-700 animate-pulse" />
                    <div className="h-3 rounded bg-primary-700 animate-pulse" />
                    <div className="h-3 rounded bg-primary-700 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">{t("listing_fee")}</div>
                  {feeConfig && (
                    <div className="space-y-0.5 text-sm">
                      <div className={PRICE_ROW}>
                        <span className={PRICE_LABEL}>{t("creation")}</span>
                        <span className={PRICE_VALUE}>{formatCurrency(feeConfig.creationFee, 'TRY')}</span>
                      </div>
                      <div className={PRICE_ROW}>
                        <span className={PRICE_LABEL}>{t("tax")} ({feeConfig.taxPercentage}%):</span>
                        <span className={PRICE_VALUE}>{formatCurrency(feeConfig.taxAmount, 'TRY')}</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between border-t border-primary-600 pt-1 font-semibold text-white">
                        <span>{t("total")}</span>
                        <span className="tabular-nums">{formatCurrency(feeConfig.totalCreationFee, 'TRY')}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1 border-t border-primary-600 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
                  <div className="text-sm font-semibold text-accent-amber-400">{t("showcase")}</div>
                  {showcasePricing && (
                    <div className="space-y-0.5 text-sm">
                      <div className={PRICE_ROW}>
                        <span className={PRICE_LABEL}>{t("daily_cost")}</span>
                        <span className={PRICE_VALUE}>{formatCurrency(showcasePricing.dailyCost, 'TRY')}</span>
                      </div>
                      <div className={PRICE_ROW}>
                        <span className={PRICE_LABEL}>{t("tax")} ({showcasePricing.taxPercentage}%):</span>
                        <span className={PRICE_VALUE}>{formatCurrency(showcasePricing.dailyTaxAmount, 'TRY')}</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between border-t border-primary-600 pt-1 font-semibold text-accent-amber-400">
                        <span>{t("total_per_day")}</span>
                        <span className="tabular-nums">{formatCurrency(showcasePricing.totalDailyCost, 'TRY')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-primary-600 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-secondary-400">
          <p>
            &copy; {new Date().getFullYear()} <span className="font-semibold text-secondary-300">{t("secondhand")}</span>. {t("all_rights_reserved")}
          </p>
        </div>
      </div>

      <AgreementModal
        agreement={openAgreement}
        open={Boolean(openAgreement)}
        onClose={() => setOpenAgreement(null)}
        readOnly
      />
    </footer>
  );
};

export default Footer;
