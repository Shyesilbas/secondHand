import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../auth/AuthContext.jsx';
import {useEnums} from '../../hooks/useEnums.js';
import {useAgreements} from '../../../agreements/hooks/useAgreements.js';
import {formatCurrency} from '../../formatters.js';
import {ROUTES} from '../../constants/routes.js';

const Footer = () => {
    const { enums, isLoading } = useEnums();
    const { agreements, isLoading: agreementsLoading } = useAgreements();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showPricing, setShowPricing] = useState(false);
    const [showReportIssues, setShowReportIssues] = useState(false);

    const feeConfig = enums.listingFeeConfig;
    const showcasePricing = enums.showcasePricingConfig;
    const isLoadingPricing = isLoading;

    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">About</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>• No membership fees</li>
                            <li>• Free to browse and search</li>
                            <li>• Secure transactions</li>
                            <li>• Trusted marketplace</li>
                        </ul>
                    </div>

                    {/* Pricing */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                        <button
                            onClick={() => setShowPricing(!showPricing)}
                            className="text-sm text-gray-300 hover:text-white transition-colors mb-2 block"
                        >
                            {showPricing ? 'Hide' : 'Show'} Pricing →
                        </button>
                        {showPricing && (
                            <div className="text-sm text-gray-300 space-y-1">
                                {isLoadingPricing ? (
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-600 rounded"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="font-semibold text-white mb-2">Listing Fee:</div>
                                        {feeConfig && (
                                            <>
                                                <div>• Creation: {formatCurrency(feeConfig.creationFee, 'TRY')}</div>
                                                <div>• Tax ({feeConfig.taxPercentage}%): {formatCurrency(feeConfig.totalCreationFee - feeConfig.creationFee, 'TRY')}</div>
                                                <div className="font-semibold text-white">• Total: {formatCurrency(feeConfig.totalCreationFee, 'TRY')}</div>
                                            </>
                                        )}
                                        <div className="font-semibold text-white mt-3 mb-2">Showcase:</div>
                                        {showcasePricing && (
                                            <>
                                                <div>• Daily Cost: {formatCurrency(showcasePricing.dailyCost, 'TRY')}</div>
                                                <div>• Tax ({showcasePricing.taxPercentage}%): {formatCurrency(showcasePricing.totalDailyCost - showcasePricing.dailyCost, 'TRY')}</div>
                                                <div className="font-semibold text-white">• Total per Day: {formatCurrency(showcasePricing.totalDailyCost, 'TRY')}</div>
                                            </>
                                        )}
                                        {(!feeConfig && !showcasePricing) && (
                                            <div>Pricing information unavailable</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>• Help Center</li>
                            <li>• Contact Us</li>
                            <li>• Safety Tips</li>
                            <li>
                                <button
                                    onClick={() => setShowReportIssues(!showReportIssues)}
                                    className="text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    {showReportIssues ? 'Hide' : 'Show'} Report Issues →
                                </button>
                            </li>
                        </ul>
                        {showReportIssues && (
                            <div className="mt-3 p-3 bg-gray-700 rounded text-sm text-gray-300">
                                <p>To report an issue, go to the listing or person's page you want to report, click the Report button, and create your complaint by filling in the necessary information.</p>
                            </div>
                        )}
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Legal</h3>
                        {isAuthenticated ? (
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate(ROUTES.AGREEMENTS_ALL)}
                                    className="text-sm text-gray-300 hover:text-white transition-colors block"
                                >
                                    • My Agreements →
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                    View your accepted agreements and status
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2 text-sm text-gray-300">
                                {agreementsLoading ? (
                                    <div className="animate-pulse space-y-2">
                                        <div className="h-4 bg-gray-600 rounded"></div>
                                        <div className="h-4 bg-gray-600 rounded"></div>
                                        <div className="h-4 bg-gray-600 rounded"></div>
                                    </div>
                                ) : agreements && agreements.length > 0 ? (
                                    agreements.map((agreement) => (
                                        <li key={agreement.agreementId}>
                                            <button
                                                onClick={() => {
                                                    // Create a modal or new page to show agreement content
                                                    const newWindow = window.open('', '_blank', 'width=800,height=600');
                                                    newWindow.document.write(`
                                                        <html>
                                                            <head>
                                                                <title>${agreement.agreementType.replace(/_/g, ' ')}</title>
                                                                <style>
                                                                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                                                                    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                                                                    .version { color: #666; font-size: 0.9em; margin-bottom: 20px; }
                                                                    .content { white-space: pre-wrap; }
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
                                                className="hover:text-white transition-colors text-left"
                                            >
                                                • {agreement.agreementType.replace(/_/g, ' ')}
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <>
                                        <li>• Terms of Service</li>
                                        <li>• Privacy Policy</li>
                                        <li>• KVKK</li>
                                    </>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-6 text-center">
                    <p className="text-sm text-gray-400">
                        &copy; 2024 SecondHand Market Place. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;