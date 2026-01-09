import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../auth/AuthContext.jsx';
import {useEnums} from '../../hooks/useEnums.js';
import {useAgreements} from '../../../agreements/hooks/useAgreements.js';
import {formatCurrency} from '../../formatters.js';
import {ROUTES} from '../../constants/routes.js';
import {
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const Footer = () => {
    const { enums, isLoading } = useEnums();
    const { isAuthenticated } = useAuth();
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

    const patternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

    return (
        <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700/50">
            <div 
                className="absolute inset-0 opacity-40" 
                style={{ backgroundImage: `url("${patternUrl}")` }}
            ></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                            About
                        </h3>
                        <ul className="space-y-3">
                            <li className="text-sm text-gray-300 hover:text-white transition-colors">
                                No membership fees
                            </li>
                            <li className="text-sm text-gray-300 hover:text-white transition-colors">
                                Free to browse and search
                            </li>
                            <li className="text-sm text-gray-300 hover:text-white transition-colors">
                                Secure transactions
                            </li>
                            <li className="text-sm text-gray-300 hover:text-white transition-colors">
                                Trusted marketplace
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                            Pricing
                        </h3>
                        <button
                            onClick={() => setShowPricing(!showPricing)}
                            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-all duration-200 group font-medium"
                        >
                            {showPricing ? (
                                <>
                                    <ChevronUp className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                    Hide Pricing
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                    Show Pricing
                                </>
                            )}
                        </button>
                        {showPricing && (
                            <div className="mt-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {isLoadingPricing ? (
                                    <div className="space-y-3">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <div className="font-semibold text-white">
                                                Listing Fee
                                            </div>
                                            {feeConfig && (
                                                <div className="ml-6 space-y-1.5 text-sm text-gray-300">
                                                    <div className="flex justify-between">
                                                        <span>Creation:</span>
                                                        <span className="text-white font-medium">{formatCurrency(feeConfig.creationFee, 'TRY')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Tax ({feeConfig.taxPercentage}%):</span>
                                                        <span className="text-white font-medium">{formatCurrency(feeConfig.totalCreationFee - feeConfig.creationFee, 'TRY')}</span>
                                                    </div>
                                                    <div className="flex justify-between pt-1.5 border-t border-gray-700/50">
                                                        <span className="font-semibold text-white">Total:</span>
                                                        <span className="text-green-400 font-bold">{formatCurrency(feeConfig.totalCreationFee, 'TRY')}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-gray-700/50">
                                            <div className="font-semibold text-white">
                                                Showcase
                                            </div>
                                            {showcasePricing && (
                                                <div className="ml-6 space-y-1.5 text-sm text-gray-300">
                                                    <div className="flex justify-between">
                                                        <span>Daily Cost:</span>
                                                        <span className="text-white font-medium">{formatCurrency(showcasePricing.dailyCost, 'TRY')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Tax ({showcasePricing.taxPercentage}%):</span>
                                                        <span className="text-white font-medium">{formatCurrency(showcasePricing.totalDailyCost - showcasePricing.dailyCost, 'TRY')}</span>
                                                    </div>
                                                    <div className="flex justify-between pt-1.5 border-t border-gray-700/50">
                                                        <span className="font-semibold text-white">Total per Day:</span>
                                                        <span className="text-yellow-400 font-bold">{formatCurrency(showcasePricing.totalDailyCost, 'TRY')}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {(!feeConfig && !showcasePricing) && (
                                            <div className="text-sm text-gray-400 italic">Pricing information unavailable</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                            Support
                        </h3>
                        <ul className="space-y-3">
                            {['Help Center', 'Contact Us', 'Safety Tips'].map((item, index) => (
                                <li key={index}>
                                    <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-all duration-200 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => setShowReportIssues(!showReportIssues)}
                                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-all duration-200 group font-medium"
                                >
                                    {showReportIssues ? (
                                        <>
                                            <ChevronUp className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                            Hide Report Issues
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                            Show Report Issues
                                        </>
                                    )}
                                </button>
                            </li>
                        </ul>
                        {showReportIssues && (
                            <div className="mt-4 p-4 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-500/20 text-sm text-gray-300 animate-in slide-in-from-top-2 duration-200">
                                <p className="leading-relaxed">
                                    To report an issue, go to the listing or person's page you want to report, click the Report button, and create your complaint by filling in the necessary information.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                            Legal
                        </h3>
                        {isAuthenticated ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate(ROUTES.AGREEMENTS_ALL)}
                                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-all duration-200 group font-medium w-full text-left"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform">My Agreements</span>
                                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </button>
                                <p className="text-xs text-gray-400 leading-relaxed pl-6">
                                    View your accepted agreements and status
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {!loadAgreements ? (
                                    <button
                                        onClick={() => setLoadAgreements(true)}
                                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-all duration-200 group font-medium"
                                    >
                                        <span>Load Legal Documents</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    </button>
                                ) : agreementsLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
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
                                                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-all duration-200 group w-full text-left"
                                                >
                                                    <span className="group-hover:translate-x-1 transition-transform">
                                                        {agreement.agreementType.replace(/_/g, ' ')}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <ul className="space-y-2">
                                        {['Terms of Service', 'Privacy Policy', 'KVKK'].map((item, index) => (
                                            <li key={index}>
                                                <button className="text-sm text-gray-300 hover:text-white transition-all duration-200 group">
                                                    <span className="group-hover:translate-x-1 transition-transform inline-block">{item}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-700/50 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} <span className="font-semibold text-gray-300">SecondHand Market Place</span>. All rights reserved.
                        </p>
                        <div className="text-xs text-gray-500">
                            <span>Made with ❤️ for sustainable shopping</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;