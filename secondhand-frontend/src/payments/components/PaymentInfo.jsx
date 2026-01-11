import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';

const PaymentInfo = () => {
    return (
        <div className="bg-blue-50/80 border border-blue-200/60 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-md flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-blue-900 mb-1">
                        Sales Earnings Information
                    </h3>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                        Your sales earnings are automatically transferred to your{' '}
                        <Link 
                            to={`${ROUTES.PAYMENT_METHODS}?tab=ewallet`} 
                            className="font-medium text-blue-800 hover:text-blue-900 underline transition-colors"
                        >
                            eWallet
                        </Link>{' '}
                        account. You can withdraw your earnings from your{' '}
                        <Link 
                            to={`${ROUTES.PAYMENT_METHODS}?tab=ewallet`} 
                            className="font-medium text-blue-800 hover:text-blue-900 underline transition-colors"
                        >
                            eWallet
                        </Link>{' '}
                        to your bank account at any time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentInfo;
