import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../../auth/AuthContext.jsx';
import {usePricing} from '../../../payments/hooks/usePricing.js';
import {useAgreements} from '../../../agreements/hooks/useAgreements.js';
import {formatCurrency} from '../../formatters.js';
import {ROUTES} from '../../constants/routes.js';

const Footer = () => {
    const { feeConfig, isLoading } = usePricing();
    const { agreements, isLoading: agreementsLoading } = useAgreements();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showPricing, setShowPricing] = useState(false);

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
                            {showPricing ? 'Hide' : 'Show'} Listing Fees →
                        </button>
                        {showPricing && (
                            <div className="text-sm text-gray-300 space-y-1">
                                {isLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-600 rounded"></div>
                                    </div>
                                ) : feeConfig ? (
                                    <>
                                        <div>• Listing Creation: {formatCurrency(feeConfig.creationFee, 'TRY')}</div>
                                        <div>• Promotion Fee: {formatCurrency(feeConfig.promotionFee, 'TRY')}</div>
                                        <div>• Tax ({feeConfig.taxPercentage}%): {formatCurrency(feeConfig.totalCreationFee - feeConfig.creationFee, 'TRY')}</div>
                                        <div className="font-semibold text-white mt-2">• Total: {formatCurrency(feeConfig.totalCreationFee, 'TRY')}</div>
                                    </>
                                ) : (
                                    <div>Fee information unavailable</div>
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
                            <li>• Report Issues</li>
                        </ul>
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