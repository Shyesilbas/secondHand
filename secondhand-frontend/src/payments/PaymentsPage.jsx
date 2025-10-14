import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { paymentService } from './services/paymentService.js';
import PaymentReceiptModal from '../common/components/modals/PaymentReceiptModal.jsx';
import { formatCurrency, formatDateTime } from '../common/formatters.js';
import { ROUTES } from '../common/constants/routes.js';
import {
    PAYMENT_TYPES,
    PAYMENT_DIRECTIONS,
    PAYMENT_TYPE_LABELS,
    TRANSACTION_TYPE_LABELS,
    PAYMENT_DIRECTION_LABELS,
    PAYMENT_STATUS_BADGE_COLORS,
    PAYMENT_DIRECTION_BADGE_COLORS
} from './payments.js';

const PaymentsPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

    useEffect(() => {
        fetchPayments(currentPage);
    }, [currentPage, pageSize]);

    const fetchPayments = async (page = 0) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await paymentService.getMyPayments(page, pageSize);
            setPayments(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while loading payment history');
            setPayments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const showReceipt = (payment) => {
        setSelectedPayment(payment);
        setIsReceiptModalOpen(true);
    };

    const closeReceipt = () => {
        setIsReceiptModalOpen(false);
        setSelectedPayment(null);
    };

    const formatDate = (dateString) => formatDateTime(dateString);

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

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-card-bg rounded-card shadow-card border p-6">
                                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <h1 className="text-3xl font-bold text-text-primary">
                    Payment History
                </h1>
                <p className="text-text-secondary mt-2">
                    View all your payment transactions
                </p>
            </div>

            {/* Sales Earnings Info */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-800 mb-1">
                            Sales Earnings Information
                        </h3>
                        <p className="text-sm text-blue-700">
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

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {payments.length === 0 ? (
                <div className="bg-card-bg rounded-card shadow-card border p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                        No Payment Found
                    </h3>
                    <p className="text-text-secondary mb-6">
                        You haven't made any payments yet.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-card-bg rounded-card shadow-card border overflow-hidden">
                        <div className="px-6 py-4 border-b border-sidebar-border">
                            <h3 className="text-lg font-semibold text-text-primary">
                                Recent Transactions ({payments.length})
                            </h3>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {payments.map((payment, index) => (
                                <div key={payment.paymentId || index} className="p-6 hover:bg-app-bg transition-colors">
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
                                                onClick={() => showReceipt(payment)}
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
                            ))}
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 text-sm font-medium text-text-secondary bg-card-bg border border-header-border rounded-lg hover:bg-app-bg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-text-secondary">
                                    Page {currentPage + 1} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-4 py-2 text-sm font-medium text-text-secondary bg-card-bg border border-header-border rounded-lg hover:bg-app-bg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-text-secondary">
                                    Showing {totalElements === 0 ? 0 : currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="pageSize" className="text-sm text-text-secondary">Per page:</label>
                                    <select
                                        id="pageSize"
                                        className="px-2 py-1 text-sm border border-header-border rounded-md bg-card-bg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={pageSize}
                                        onChange={(e) => { setCurrentPage(0); setPageSize(Number(e.target.value)); }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <PaymentReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={closeReceipt}
                payment={selectedPayment}
            />
        </div>
    );
};

export default PaymentsPage;
