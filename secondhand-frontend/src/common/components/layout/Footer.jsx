import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '../../../auth/AuthContext.jsx';
import { useEnums } from '../../hooks/useEnums.js';
import { useAgreements } from '../../../agreements/hooks/useAgreements.js';
import { formatCurrency } from '../../formatters.js';
import { ROUTES } from '../../constants/routes.js';
import { ChevronDown, ChevronUp, ShieldCheck, Award, MessageSquare, Scale, Info, Sparkles, Coins } from 'lucide-react';

const Footer = () => {
 const {
 t
 } = useTranslation();
 const {
 enums,
 isLoading
 } = useEnums();
 const {
 isAuthenticated
 } = useAuthState();
 const navigate = useNavigate();
 const [showPricing, setShowPricing] = useState(false);
 const [showReportIssues, setShowReportIssues] = useState(false);
 const [loadAgreements, setLoadAgreements] = useState(false);
 const {
 agreements,
 isLoading: agreementsLoading
 } = useAgreements({
 enabled: !isAuthenticated && loadAgreements
 });
 const feeConfig = enums.listingFeeConfig;
 const showcasePricing = enums.showcasePricingConfig;
 const isLoadingPricing = isLoading;
 return <footer className="relative bg-primary text-secondary-300 border-t border-white/5 overflow-hidden">

 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
 {/* Brand Section */}
 <div className="lg:col-span-4 space-y-4">
 <div className="flex items-center gap-2">
 <Sparkles className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 <span className="text-xl font-semibold tracking-tighter text-white text-white">
 {t("secondhand")}
 </span>
 </div>
 <p className="text-sm text-text-muted leading-relaxed font-normal max-w-sm">
 {t("about_secondhand_desc")}
 </p>

 {/* Trust badging */}
 <div className="pt-2 flex flex-wrap gap-3">
 <div className="flex items-center gap-1.5 rounded-sm border border-secondary-700/20 bg-primary-hover/5 px-3 py-1 text-xs text-text-secondary font-medium">
 <ShieldCheck className="w-3.5 h-3.5" />
 <span>{t("secure_escrow")}</span>
 </div>
 <div className="flex items-center gap-1.5 rounded-sm border border-secondary-700/20 bg-primary-hover/5 px-3 py-1 text-xs text-text-secondary font-medium">
 <Award className="w-3.5 h-3.5" />
 <span>{t("verified_sellers")}</span>
 </div>
 </div>
 </div>

 {/* About Section */}
 <div className="lg:col-span-2 space-y-3">
 <h3 className="text-xs font-semibold text-white mb-4 flex items-center gap-1.5">
 <Info className="w-3.5 h-3.5 text-text-secondary" />
 <span>{t("about")}</span>
 </h3>
 <ul className="space-y-2">
 <li>
 <button onClick={() => navigate(ROUTES.ABOUT)} className="text-sm text-text-muted hover:text-white transition-all duration-300 tracking-tight font-medium inline-flex items-center">
 {t("about_secondhand")}
 </button>
 </li>
 <li className="text-sm text-text-muted hover:text-secondary-200 transition-all duration-300 tracking-tight font-normal">{t("no_membership_fees")}</li>
 <li className="text-sm text-text-muted hover:text-secondary-200 transition-all duration-300 tracking-tight font-normal">{t("free_to_browse_and_search")}</li>
 <li className="text-sm text-text-muted hover:text-secondary-200 transition-all duration-300 tracking-tight font-normal">{t("secure_transactions")}</li>
 <li className="text-sm text-text-muted hover:text-secondary-200 transition-all duration-300 tracking-tight font-normal">{t("trusted_marketplace")}</li>
 </ul>
 </div>

 {/* Pricing Section */}
 <div className="lg:col-span-3 space-y-3">
 <h3 className="text-xs font-semibold text-white mb-4 flex items-center gap-1.5">
 <Coins className="w-3.5 h-3.5 text-status-warning" />
 <span>{t("pricing")}</span>
 </h3>
 <button onClick={() => setShowPricing(!showPricing)} className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-all duration-300 tracking-tight group font-medium border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] rounded px-4 py-2 w-full justify-between">
 <span className="flex items-center gap-2">
 {showPricing ? t("hide_pricing") : t("show_pricing")}
 </span>
 {showPricing ? <ChevronUp className="w-4 h-4 text-text-tertiary group-hover:text-white" /> : <ChevronDown className="w-4 h-4 text-text-tertiary group-hover:text-white" />}
 </button>
 {showPricing && <div className="mt-3 space-y-4 rounded border border-white/10 bg-primary/50 p-4 transition-all duration-300">
 {isLoadingPricing ? <div className="space-y-3">
 {[...Array(4)].map((_, i) => <div key={`fee-skeleton-${i}`} className="h-4 rounded-md bg-primary-hover/60 animate-pulse"></div>)}
 </div> : <>
 <div className="space-y-2">
 <div className="text-xs font-semibold text-text-secondary">{t("listing_fee")}</div>
 {feeConfig && <div className="ml-1 space-y-1.5 text-xs text-secondary-300">
 <div className="flex items-center justify-between">
 <span className="tracking-tight text-text-muted">{t("creation")}</span>
 <span className="text-secondary-100">{formatCurrency(feeConfig.creationFee, 'TRY')}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="tracking-tight text-text-muted">{t("tax")} ({feeConfig.taxPercentage}%):</span>
 <span className="text-secondary-100">{formatCurrency(feeConfig.totalCreationFee - feeConfig.creationFee, 'TRY')}</span>
 </div>
 <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-2">
 <span className="text-xs font-semibold text-text-secondary">{t("total")}</span>
 <span className="text-sm font-semibold tracking-tight text-text-secondary">{formatCurrency(feeConfig.totalCreationFee, 'TRY')}</span>
 </div>
 </div>}
 </div>

 <div className="space-y-2 border-t border-white/10 pt-3">
 <div className="text-xs font-semibold text-status-warning">{t("showcase")}</div>
 {showcasePricing && <div className="ml-1 space-y-1.5 text-xs text-secondary-300">
 <div className="flex items-center justify-between">
 <span className="tracking-tight text-text-muted">{t("daily_cost")}</span>
 <span className="text-secondary-100">{formatCurrency(showcasePricing.dailyCost, 'TRY')}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="tracking-tight text-text-muted">{t("tax")} ({showcasePricing.taxPercentage}%):</span>
 <span className="text-secondary-100">{formatCurrency(showcasePricing.totalDailyCost - showcasePricing.dailyCost, 'TRY')}</span>
 </div>
 <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-2">
 <span className="text-xs font-semibold text-status-warning">{t("total_per_day")}</span>
 <span className="text-sm font-semibold tracking-tight text-status-warning">{formatCurrency(showcasePricing.totalDailyCost, 'TRY')}</span>
 </div>
 </div>}
 </div>
 {!feeConfig && !showcasePricing && <div className="text-xs italic text-text-tertiary">{t("pricing_information_unavailable")}</div>}
 </>}
 </div>}
 </div>

 {/* Support & Legal Combined / Legal Section */}
 <div className="lg:col-span-3 space-y-6">
 <div className="space-y-3">
 <h3 className="text-xs font-semibold text-white mb-4 flex items-center gap-1.5">
 <MessageSquare className="w-3.5 h-3.5 text-text-tertiary" />
 <span>{t("support")}</span>
 </h3>
 <ul className="space-y-2">
 <li>
 <button onClick={() => navigate(ROUTES.FORUM)} className="text-sm text-text-muted hover:text-white transition-all duration-300 tracking-tight text-left inline-flex items-center">
 {t("forum_community")}
 </button>
 </li>
 <li>
 <button onClick={() => setShowReportIssues(!showReportIssues)} className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-all duration-300 tracking-tight font-medium text-left">
 <span>{showReportIssues ? t("hide_report_issues") : t("show_report_issues")}</span>
 </button>
 </li>
 </ul>
 {showReportIssues && <div className="mt-3 rounded border border-white/10 bg-primary/50 p-3 text-xs text-secondary-300 leading-relaxed font-normal">
 <p>{t("to_report_an_issue_go_to_the_listing_or_")}</p>
 </div>}
 </div>

 <div className="space-y-3">
 <h3 className="text-xs font-semibold text-white mb-4 flex items-center gap-1.5">
 <Scale className="w-3.5 h-3.5 text-text-tertiary" />
 <span>{t("legal")}</span>
 </h3>
 {isAuthenticated ? <div className="space-y-2">
 <button onClick={() => navigate(ROUTES.AGREEMENTS_ALL)} className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-all duration-300 tracking-tight font-medium w-full text-left">
 <span>{t("my_agreements")}</span>
 </button>
 <p className="text-xs leading-relaxed tracking-tight text-text-tertiary font-normal">{t("view_your_accepted_agreements_and_status")}</p>
 </div> : <div className="space-y-3">
 {!loadAgreements ? <button onClick={() => setLoadAgreements(true)} className="inline-flex items-center gap-2 rounded border border-white/10 px-4 py-2 text-sm font-medium tracking-tight text-secondary-200 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]">
 <span>{t("load_legal_documents")}</span>
 </button> : agreementsLoading ? <div className="space-y-2">
 {[...Array(3)].map((_, i) => <div key={`agreement-skeleton-${i}`} className="h-4 rounded-md bg-primary-hover/60 animate-pulse"></div>)}
 </div> : agreements && agreements.length > 0 ? <ul className="space-y-2">
 {agreements.map(agreement => <li key={agreement.agreementId}>
 <button onClick={() => {
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
 }} className="w-full text-left text-sm text-text-muted hover:text-white transition-all duration-300 tracking-tight">
 <span>{agreement.agreementType.replace(/_/g, ' ')}</span>
 </button>
 </li>)}
 </ul> : <ul className="space-y-2">
 {['Terms of Service', 'Privacy Policy', 'KVKK'].map((item) => <li key={item}>
 <button className="text-sm text-text-muted hover:text-white transition-all duration-300 tracking-tight text-left">
 <span className="inline-block">{item}</span>
 </button>
 </li>)}
 </ul>}
 </div>}
 </div>
 </div>
 </div>

 {/* Footer Bottom */}
 <div className="mt-8 pt-8 border-t border-white/5">
 <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
 <div className="flex items-center gap-1.5">
 <p className="text-xs text-text-tertiary tracking-tight font-normal">
 &copy; {new Date().getFullYear()} <span className="font-semibold text-secondary-300">{t("secondhand")}</span>. {t("all_rights_reserved")}
 </p>
 </div>

 {/* Simulated Payment Badges */}
 <div className="flex items-center gap-2">
 <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-xs text-text-muted font-semibold">Visa</div>
 <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-xs text-text-muted font-semibold">MasterCard</div>
 <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-xs text-text-muted font-semibold">Troy</div>
 <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-xs text-text-secondary font-semibold">Escrow Protect</div>
 </div>
 </div>
 </div>
 </div>
 </footer>;
};
export default Footer;