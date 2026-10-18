import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '../../../auth/AuthContext.jsx';
import { useEnums } from '../../hooks/useEnums.js';
import { useAgreements } from '../../../agreements/hooks/useAgreements.js';
import { formatCurrency } from '../../formatters.js';
import { ROUTES } from '../../constants/routes.js';
import { ChevronDown, ChevronUp, MessageSquare, Scale, Info, Sparkles, Coins } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const { enums, isLoading } = useEnums();
  const { isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const [loadAgreements, setLoadAgreements] = useState(false);
  const { agreements, isLoading: agreementsLoading } = useAgreements({
    enabled: !isAuthenticated && loadAgreements
  });
  const feeConfig = enums.listingFeeConfig;
  const showcasePricing = enums.showcasePricingConfig;
  const isLoadingPricing = isLoading;

  return (
    <footer className="relative bg-primary text-secondary-300 border-t border-white/5 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 mb-6">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <span className="text-base font-semibold tracking-tight text-white">
                {t("secondhand")}
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-sm font-normal">
              {t("about_secondhand_desc")}
            </p>
          </div>

          {/* About Section */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-text-secondary" />
              <span>{t("about")}</span>
            </h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => navigate(ROUTES.ABOUT)}
                  className="text-xs text-text-muted hover:text-white transition-colors tracking-tight font-medium inline-flex items-center"
                >
                  {t("about_secondhand")}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{t("support")}</span>
            </h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => navigate(ROUTES.FORUM)}
                  className="text-xs text-text-muted hover:text-white transition-colors tracking-tight font-medium inline-flex items-center text-left"
                >
                  {t("forum_community")}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-text-tertiary" />
              <span>{t("legal")}</span>
            </h3>
            {isAuthenticated ? (
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => navigate(ROUTES.AGREEMENTS_ALL)}
                    className="text-xs text-text-muted hover:text-white transition-colors tracking-tight font-medium text-left"
                  >
                    {t("my_agreements")}
                  </button>
                </li>
              </ul>
            ) : (
              <div className="space-y-1.5">
                {!loadAgreements ? (
                  <button
                    onClick={() => setLoadAgreements(true)}
                    className="inline-flex items-center gap-1.5 rounded border border-white/10 px-2 py-0.5 text-xs font-medium tracking-tight text-secondary-200 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <span>{t("load_legal_documents")}</span>
                  </button>
                ) : agreementsLoading ? (
                  <div className="space-y-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={`agreement-skeleton-${i}`} className="h-3 rounded bg-primary-hover/60 animate-pulse" />
                    ))}
                  </div>
                ) : agreements && agreements.length > 0 ? (
                  <ul className="space-y-1">
                    {agreements.map((agreement) => (
                      <li key={agreement.agreementId}>
                        <button
                          onClick={() => {
                            const newWindow = window.open('', '_blank', 'width=800,height=600');
                            newWindow.document.write(`
                              <html>
                              <head>
                              <title>${agreement.agreementType.replace(/_/g, ' ')}</title>
                              <style>
                              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; line-height: 1.8; background: #f5f5f5; }
                              h1 { color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 15px; margin-bottom: 20px; }
                              .version { color: #6b7280; font-size: 0.9em; margin-bottom: 25px; padding: 10px; background: white; border-radius: 6px; }
                              .content { white-space: pre-wrap; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                              </style>
                              </head>
                              <body>
                              <h1>${agreement.agreementType.replace(/_/g, ' ')}</h1>
                              <div class="version">Version: ${agreement.version} | Updated: ${agreement.updatedDate}</div>
                              <div class="content">${agreement.content}</div>
                              </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }}
                          className="w-full text-left text-xs text-text-muted hover:text-white transition-colors tracking-tight"
                        >
                          <span>{agreement.agreementType.replace(/_/g, ' ')}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-1">
                    {['Terms of Service', 'Privacy Policy', 'KVKK'].map((item) => (
                      <li key={item}>
                        <span className="text-xs text-text-muted tracking-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-2">
            <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-status-warning" />
              <span>{t("pricing")}</span>
            </h3>
            <button
              onClick={() => setShowPricing(!showPricing)}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-white transition-colors tracking-tight font-medium border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] rounded px-2.5 py-1 w-full justify-between"
            >
              <span>{showPricing ? t("hide_pricing") : t("show_pricing")}</span>
              {showPricing ? <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" /> : <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />}
            </button>
            {showPricing && (
              <div className="mt-2 space-y-2 rounded border border-white/10 bg-primary/50 p-2.5 transition-all duration-300">
                {isLoadingPricing ? (
                  <div className="space-y-1.5">
                    {[...Array(3)].map((_, i) => (
                      <div key={`fee-skeleton-${i}`} className="h-3 rounded bg-primary-hover/60 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-text-secondary">{t("listing_fee")}</div>
                      {feeConfig && (
                        <div className="space-y-0.5 text-xs text-secondary-300">
                          <div className="flex items-center justify-between">
                            <span className="tracking-tight text-text-muted">{t("creation")}</span>
                            <span className="text-secondary-100">{formatCurrency(feeConfig.creationFee, 'TRY')}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="tracking-tight text-text-muted">{t("tax")} ({feeConfig.taxPercentage}%):</span>
                            <span className="text-secondary-100">{formatCurrency(feeConfig.totalCreationFee - feeConfig.creationFee, 'TRY')}</span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between border-t border-white/10 pt-1 text-text-secondary font-semibold">
                            <span>{t("total")}</span>
                            <span>{formatCurrency(feeConfig.totalCreationFee, 'TRY')}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 border-t border-white/10 pt-1.5">
                      <div className="text-xs font-semibold text-status-warning">{t("showcase")}</div>
                      {showcasePricing && (
                        <div className="space-y-0.5 text-xs text-secondary-300">
                          <div className="flex items-center justify-between">
                            <span className="tracking-tight text-text-muted">{t("daily_cost")}</span>
                            <span className="text-secondary-100">{formatCurrency(showcasePricing.dailyCost, 'TRY')}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="tracking-tight text-text-muted">{t("tax")} ({showcasePricing.taxPercentage}%):</span>
                            <span className="text-secondary-100">{formatCurrency(showcasePricing.totalDailyCost - showcasePricing.dailyCost, 'TRY')}</span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between border-t border-white/10 pt-1 text-status-warning font-semibold">
                            <span>{t("total_per_day")}</span>
                            <span>{formatCurrency(showcasePricing.totalDailyCost, 'TRY')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-tertiary">
          <p>
            &copy; {new Date().getFullYear()} <span className="font-semibold text-secondary-300">{t("secondhand")}</span>. {t("all_rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;