import React from 'react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import {
    PAYMENT_TYPES,
    PAYMENT_DIRECTIONS,
    PAYMENT_TYPE_LABELS,
    TRANSACTION_TYPE_LABELS,
    PAYMENT_DIRECTION_LABELS,
    PAYMENT_STATUS_BADGE_COLORS,
    PAYMENT_DIRECTION_BADGE_COLORS
} from '../payments.js';

const PaymentItem = React.memo(({ payment, onShowReceipt }) => {
    const orderItems = payment.orderItems || [];
    const getPaymentTypeIcon = (type) => {
        switch (type) {
            case PAYMENT_TYPES.CREDIT_CARD:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                );
            case PAYMENT_TYPES.TRANSFER:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
            case PAYMENT_TYPES.EWALLET:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                );
        }
    };

    const getTransactionTypeLabel = (type) => TRANSACTION_TYPE_LABELS[type] || type;
    const getPaymentTypeLabel = (type) => PAYMENT_TYPE_LABELS[type] || type;

    const getDirectionIcon = (direction) => {
        if (direction === PAYMENT_DIRECTIONS.INCOMING) {
            return (
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            );
        } else {
            return (
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            );
        }
    };

    const formatDate = (dateString) => formatDateTime(dateString);

    return (
        <div className="group bg-white border border-gray-200/60 rounded-lg p-5 transition-all hover:border-gray-300 hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-md flex-shrink-0 ${
                        payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING
                            ? 'bg-green-50'
                            : 'bg-gray-50'
                    }`}>
                        <div className={`${
                            payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING
                                ? 'text-green-600'
                                : 'text-gray-600'
                        }`}>
                            {getPaymentTypeIcon(payment.paymentType)}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                                {getTransactionTypeLabel(payment.transactionType)}
                            </h4>
                            <div className="flex items-center gap-1">
                                {getDirectionIcon(payment.paymentDirection)}
                                <span className="text-[10px] text-gray-500 font-medium">
                                    {PAYMENT_DIRECTION_LABELS[payment.paymentDirection]}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500">
                                {getPaymentTypeLabel(payment.paymentType)}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                                {formatDate(payment.createdAt)}
                            </span>
                        </div>
                        {orderItems.length > 0 ? (
                            <div className="mt-2 space-y-0.5">
                                {orderItems.map((title, index) => (
                                    <p key={index} className="text-xs font-medium text-gray-700 truncate">
                                        {title}
                                    </p>
                                ))}
                            </div>
                        ) : payment.listingTitle ? (
                            <p className="text-xs font-medium text-gray-700 mt-2 truncate">
                                {payment.listingTitle}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-sm font-semibold font-mono ${
                                payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING
                                    ? 'text-green-600'
                                    : 'text-gray-900'
                            }`}>
                                {payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING ? '+' : '-'}
                                {formatCurrency(payment.amount)}
                            </span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            payment.isSuccess
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                        }`}>
                            {payment.isSuccess ? 'Success' : 'Failed'}
                        </span>
                    </div>

                    <button
                        onClick={() => onShowReceipt(payment)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Show Receipt"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default PaymentItem;
