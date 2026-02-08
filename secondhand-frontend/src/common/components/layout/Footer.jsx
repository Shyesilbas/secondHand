import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuthState} from '../../../auth/AuthContext.jsx';
import {useEnums} from '../../hooks/useEnums.js';
import {useAgreements} from '../../../agreements/hooks/useAgreements.js';
import {formatCurrency} from '../../formatters.js';
import {ROUTES} from '../../constants/routes.js';
import {ChevronDown, ChevronUp} from 'lucide-react';

const Footer = () => {
    const { enums, isLoading } = useEnums();
    const { isAuthenticated } = useAuthState();
    const navigate = useNavigate();
    const [showPricing, setShowPricing] = useState(false);
    const [showReportIssues, setShowReportIssues] = useState(false);
    const [loadAgreements, setLoadAgreements] = useState(false);
    
    const { agreements, isLoading: agreementsLoading } = useAgreements({
        enabled: !isAuthenticated && loadAgreements
    });

    const feeConfig = enums.listingFeeConfig;
    const showcasePricing = enums.showcasePricingConfig;
    const isLoadingPricing = isLoading;

    return (
        <footer className="relative bg-slate-950 text-slate-300 border-t border-white/5">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-indigo-500/20 via-transparent to-transparent" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                            About
                        </h3>
                        <ul className="space-y-1.5">
                            <li className="text-sm text-slate-400 hover:text-white transition-all duration-300 tracking-tight">
                                No membership fees
                            </li>
                            <li className="text-sm text-slate-400 hover:text-white transition-all duration-300 tracking-tight">
                                Free to browse and search
                            </li>
                            <li className="text-sm text-slate-400 hover:text-white transition-all duration-300 tracking-tight">
                                Secure transactions
                            </li>
                            <li className="text-sm text-slate-400 hover:text-white transition-all duration-300 tracking-tight">
                                Trusted marketplace
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                            Pricing
                        </h3>
                        <button
                            onClick={() => setShowPricing(!showPricing)}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-300 tracking-tight group font-medium"
                        >
                            {showPricing ? (
                                <>
                                    <ChevronUp className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                                    Hide Pricing
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                    Show Pricing
                                </>
                            )}
                        </button>
                        {showPricing && (
                            <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition-all duration-300">
                                {isLoadingPricing ? (
                                    <div className="space-y-3">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="h-4 rounded-2xl bg-slate-800/60 animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                Listing Fee
                                            </div>
                                            {feeConfig && (
                                                <div className="ml-4 space-y-1.5 text-sm text-slate-300">
                                                    <div className="flex items-center justify-between">
                                                        <span className="tracking-tight">Creation</span>
                                                        <span className="font-mono text-sm tracking-tight text-slate-100">{formatCurrency(feeConfig.creationFee, 'TRY')}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="tracking-tight">Tax ({feeConfig.taxPercentage}%):</span>
                                                        <span className="font-mono text-sm tracking-tight text-slate-100">{formatCurrency(feeConfig.totalCreationFee - feeConfig.creationFee, 'TRY')}</span>
                                                    </div>
                                                    <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-2">
                                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total</span>
                                                        <span className="font-mono text-base font-semibold tracking-tight text-emerald-400">{formatCurrency(feeConfig.totalCreationFee, 'TRY')}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 border-t border-white/10 pt-3">
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                Showcase
                                            </div>
                                            {showcasePricing && (
                                                <div className="ml-4 space-y-1.5 text-sm text-slate-300">
                                                    <div className="flex items-center justify-between">
                                                        <span className="tracking-tight">Daily Cost</span>
                                                        <span className="font-mono text-sm tracking-tight text-slate-100">{formatCurrency(showcasePricing.dailyCost, 'TRY')}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="tracking-tight">Tax ({showcasePricing.taxPercentage}%):</span>
                                                        <span className="font-mono text-sm tracking-tight text-slate-100">{formatCurrency(showcasePricing.totalDailyCost - showcasePricing.dailyCost, 'TRY')}</span>
                                                    </div>
                                                    <div className="mt-2 flex items-baseline justify-between border-t border-white/10 pt-2">
                                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total per Day</span>
                                                        <span className="font-mono text-base font-semibold tracking-tight text-amber-300">{formatCurrency(showcasePricing.totalDailyCost, 'TRY')}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {(!feeConfig && !showcasePricing) && (
                                            <div className="text-sm italic text-slate-500">Pricing information unavailable</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                            Support
                        </h3>
                        <ul className="space-y-1.5">
                            {['Help Center', 'Contact Us', 'Safety Tips'].map((item, index) => (
                                <li key={index}>
                                    <button className="text-sm text-slate-400 hover:text-white hover:underline underline-offset-4 decoration-slate-500/60 transition-all duration-300 tracking-tight">
                                        {item}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => setShowReportIssues(!showReportIssues)}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-300 tracking-tight font-medium"
                                >
                                    {showReportIssues ? (
                                        <>
                                            <ChevronUp className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                                            Hide Report Issues
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                            Show Report Issues
                                        </>
                                    )}
                                </button>
                            </li>
                        </ul>
                        {showReportIssues && (
                            <div className="mt-3 rounded-xl border border-slate-700/80 bg-slate-900/60 p-3 text-sm text-slate-300">
                                <p className="leading-relaxed tracking-tight">
                                    To report an issue, go to the listing or person's page you want to report, click the Report button, and create your complaint by filling in the necessary information.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                            Legal
                        </h3>
                        {isAuthenticated ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate(ROUTES.AGREEMENTS_ALL)}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white hover:underline underline-offset-4 decoration-slate-500/60 transition-all duration-300 tracking-tight font-medium w-full text-left"
                                >
                                    <span>My Agreements</span>
                                </button>
                                <p className="pl-0 text-xs leading-relaxed tracking-tight text-slate-500">
                                    View your accepted agreements and status
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {!loadAgreements ? (
                                    <button
                                        onClick={() => setLoadAgreements(true)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-500/60 px-4 py-2 text-sm font-medium tracking-tight text-slate-200 transition-all duration-300 hover:border-slate-300 hover:bg-slate-800/60"
                                    >
                                        <span>Load Legal Documents</span>
                                    </button>
                                ) : agreementsLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-4 rounded-2xl bg-slate-800/60 animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : agreements && agreements.length > 0 ? (
                                    <ul className="space-y-2">
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
                                                                        h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
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
                                                    className="w-full text-left text-sm text-slate-400 hover:text-white hover:underline underline-offset-4 decoration-slate-500/60 transition-all duration-300 tracking-tight"
                                                >
                                                    <span>{agreement.agreementType.replace(/_/g, ' ')}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <ul className="space-y-2">
                                        {['Terms of Service', 'Privacy Policy', 'KVKK'].map((item, index) => (
                                            <li key={index}>
                                                <button className="text-sm text-slate-400 hover:text-white hover:underline underline-offset-4 decoration-slate-500/60 transition-all duration-300 tracking-tight">
                                                    <span className="inline-block">{item}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-5 border-t border-white/5 pt-4">
                    <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                        <p className="text-xs text-slate-500 tracking-tight">
                            &copy; {new Date().getFullYear()} <span className="font-bold tracking-tighter text-white">SecondHand</span>. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;