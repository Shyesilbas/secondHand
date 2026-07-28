import {useTranslation} from "react-i18next";
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuthState} from '../../../auth/AuthContext.jsx';
import {useEnums} from '../../hooks/useEnums.js';
import {useAgreements} from '../../../agreements/hooks/useAgreements.js';
import {formatCurrency} from '../../formatters.js';
import {ROUTES} from '../../constants/routes.js';
import {ChevronDown, ChevronUp, ShieldCheck, Award, MessageSquare, Scale, Info, Sparkles, Coins} from 'lucide-react';

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
  return <footer className="relative bg-slate-950 text-slate-300 border-t border-white/5 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <div className="pointer-events-none absolute left-1/4 top-0 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
            <div className="pointer-events-none absolute right-1/4 bottom-0 translate-y-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-10 mb-6">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tighter text-white bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                                {t("secondhand", "SecondHand")}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-light max-w-sm">
                            {t("about_secondhand_desc", "The premium secondhand marketplace for verified items, electronics, and unique finds. Buy and trade with absolute confidence under escrow protection.")}
                        </p>
                        
                        {/* Trust badging */}
                        <div className="pt-1 flex flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[11px] text-emerald-400 font-medium">
                                <ShieldCheck className="w-3 h-3" />
                                <span>{t("secure_escrow", "Secure Escrow")}</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-0.5 text-[11px] text-indigo-400 font-medium">
                                <Award className="w-3 h-3" />
                                <span>{t("verified_sellers", "Verified Sellers")}</span>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="lg:col-span-2 space-y-2">
                        <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-2.5 flex items-center gap-1.5">
                            <Info className="w-3 h-3 text-indigo-400" />
                            <span>{t("about")}</span>
                        </h3>
                        <ul className="space-y-1.5">
                            <li>
                                <button onClick={() => navigate(ROUTES.ABOUT)} className="text-xs text-slate-400 hover:text-white transition-all duration-300 tracking-tight font-medium hover:translate-x-1 inline-flex items-center">
                                    {t("about_secondhand", "About SecondHand")}
                                </button>
                            </li>
                            <li className="text-xs text-slate-400 hover:text-slate-200 transition-all duration-300 tracking-tight font-light">{t("no_membership_fees")}</li>
                            <li className="text-xs text-slate-400 hover:text-slate-200 transition-all duration-300 tracking-tight font-light">{t("free_to_browse_and_search")}</li>
                            <li className="text-xs text-slate-400 hover:text-slate-200 transition-all duration-300 tracking-tight font-light">{t("secure_transactions")}</li>
                        </ul>
                    </div>

                    {/* Pricing Section */}
                    <div className="lg:col-span-3 space-y-2">
                        <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-2.5 flex items-center gap-1.5">
                            <Coins className="w-3 h-3 text-amber-400" />
                            <span>{t("pricing")}</span>
                        </h3>
                        <button onClick={() => setShowPricing(!showPricing)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-all duration-300 tracking-tight group font-medium border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl px-3.5 py-1.5 w-full justify-between">
                            <span className="flex items-center gap-2">
                                {showPricing ? t("hide_pricing") : t("show_pricing")}
                            </span>
                            {showPricing ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />}
                        </button>
                        {showPricing && <div className="mt-2 space-y-3 rounded-xl border border-white/10 bg-slate-900/50 p-3 backdrop-blur-xl transition-all duration-300">
                                {isLoadingPricing ? <div className="space-y-2">
                                        {[...Array(4)].map((_, i) => <div key={`fee-skeleton-${i}`} className="h-3 rounded-2xl bg-slate-800/60 animate-pulse"></div>)}
                                    </div> : <>
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">{t("listing_fee")}</div>
                                            {feeConfig && <div className="ml-1 space-y-1 text-xs text-slate-300">
                                                    <div className="flex items-center justify-between">
                                                        <span className="tracking-tight text-slate-400">{t("creation")}</span>
                                                        <span className="font-mono text-slate-100">{formatCurrency(feeConfig.creationFee, 'TRY')}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="tracking-tight text-slate-400">{t("tax")} ({feeConfig.taxPercentage}%):</span>
                                                        <span className="font-mono text-slate-100">{formatCurrency(feeConfig.totalCreationFee - feeConfig.creationFee, 'TRY')}</span>
                                                    </div>
                                                    <div className="mt-1.5 flex items-baseline justify-between border-t border-white/10 pt-1.5">
                                                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">{t("total")}</span>
                                                        <span className="font-mono text-xs font-semibold tracking-tight text-emerald-400">{formatCurrency(feeConfig.totalCreationFee, 'TRY')}</span>
                                                    </div>
                                                </div>}
                                        </div>
                                    </>}
                            </div>}
                    </div>

                    {/* Support & Legal Combined / Legal Section */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em] mb-2.5 flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3 text-sky-400" />
                                <span>{t("support")}</span>
                            </h3>
                            <ul className="space-y-1.5">
                                <li>
                                    <button onClick={() => navigate(ROUTES.FORUM)} className="text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 tracking-tight text-left inline-flex items-center">
                                        {t("forum_community")}
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => setShowReportIssues(!showReportIssues)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 tracking-tight font-medium text-left">
                                        <span>{showReportIssues ? t("hide_report_issues") : t("show_report_issues")}</span>
                                    </button>
                                </li>
                            </ul>
                            {showReportIssues && <div className="mt-2 rounded-xl border border-white/10 bg-slate-900/50 p-2.5 text-[11px] text-slate-300 leading-relaxed font-light">
                                    <p>{t("to_report_an_issue_go_to_the_listing_or_")}</p>
                                </div>}
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs text-slate-500 tracking-tight font-light">
                                &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-300">{t("secondhand")}</span>. {t("all_rights_reserved")}
                            </p>
                        </div>
                        
                        {/* Simulated Payment Badges */}
                        <div className="flex items-center gap-2">
                            <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Visa</div>
                            <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400 tracking-wider uppercase font-semibold">MasterCard</div>
                            <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Troy</div>
                            <div className="rounded border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[10px] text-emerald-400 tracking-wider uppercase font-semibold">Escrow Protect</div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>;
};
export default Footer;