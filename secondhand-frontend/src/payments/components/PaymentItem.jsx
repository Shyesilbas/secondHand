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
    const getPaymentTypeIcon = (type) => {
        switch (type) {
            case PAYMENT_TYPES.CREDIT_CARD:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                );
            case PAYMENT_TYPES.TRANSFER:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
            case PAYMENT_TYPES.EWALLET:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            );
        } else {
            return (
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            );
        }
    };

    const formatDate = (dateString) => formatDateTime(dateString);

    return (
        <div className="p-6 hover:bg-app-bg transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                        payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING
                            ? PAYMENT_DIRECTION_BADGE_COLORS[PAYMENT_DIRECTIONS.INCOMING]
                            : PAYMENT_DIRECTION_BADGE_COLORS[PAYMENT_DIRECTIONS.OUTGOING]
                    }`}>
                        {getPaymentTypeIcon(payment.paymentType)}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold text-text-primary">
                                {getTransactionTypeLabel(payment.transactionType)}
                            </h4>
                            <div className="flex items-center space-x-1">
                                {getDirectionIcon(payment.paymentDirection)}
                                <span className="text-xs text-text-muted">
                                    {PAYMENT_DIRECTION_LABELS[payment.paymentDirection]}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-text-muted mt-1">
                            {getPaymentTypeLabel(payment.paymentType)} • {formatDate(payment.createdAt)}
                        </p>
                        {payment.listingId && (
                            <p className="text-xs text-text-muted mt-1">
                                Listing : {payment.listingId}
                            </p>
                        )}

                        {payment.receiverName && payment.paymentDirection === PAYMENT_DIRECTIONS.OUTGOING && (
                            <p className="text-xs text-text-muted mt-1">
                                To: {payment.receiverName} {payment.receiverSurname}
                            </p>
                        )}
                        {payment.senderName && payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING && (
                            <p className="text-xs text-text-muted mt-1">
                                From: {payment.senderName} {payment.senderSurname}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className={`text-lg font-bold ${
                                payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING
                                    ? 'text-green-600'
                                    : 'text-text-primary'
                            }`}>
                                {payment.paymentDirection === PAYMENT_DIRECTIONS.INCOMING ? '+' : '-'}
                                {formatCurrency(payment.amount)}
                            </span>

                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.isSuccess
                                    ? PAYMENT_STATUS_BADGE_COLORS.success
                                    : PAYMENT_STATUS_BADGE_COLORS.failed
                            }`}>
                                {payment.isSuccess ? 'Success' : 'Failed'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => onShowReceipt(payment)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-btn-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Show Receipt"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Receipt
                    </button>
                </div>
            </div>
        </div>
    );
});

export default PaymentItem;
