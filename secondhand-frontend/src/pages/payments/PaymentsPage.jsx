import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../features/payments/services/paymentService';

const PaymentsPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);

    useEffect(() => {
        fetchPayments(currentPage);
    }, [currentPage]);

    const fetchPayments = async (page = 0) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await paymentService.getMyPayments(page, pageSize);
            setPayments(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while loading payment history');
            setPayments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentTypeIcon = (type) => {
        switch (type) {
            case 'CREDIT_CARD':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                );
            case 'TRANSFER':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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

    const getTransactionTypeLabel = (type) => {
        switch (type) {
            case 'LISTING_CREATION':
                return 'Listing Fee';
            case 'ITEM_PURCHASE':
                return 'Product Purchase';
            default:
                return type;
        }
    };

    const getPaymentTypeLabel = (type) => {
        switch (type) {
            case 'CREDIT_CARD':
                return 'Credit Card';
            case 'TRANSFER':
                return 'Bank Transfer';
            default:
                return type;
        }
    };

    const getDirectionIcon = (direction) => {
        if (direction === 'INCOMING') {
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
                            <div key={i} className="bg-white rounded-lg border p-6">
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
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                
                <h1 className="text-3xl font-bold text-gray-900">
                    Payment History
                </h1>
                <p className="text-gray-600 mt-2">
                    View all your payment transactions
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {payments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Payment Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        You haven't made any payments yet.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Recent Transactions ({payments.length})
                            </h3>
                        </div>
                        
                        <div className="divide-y divide-gray-200">
                            {payments.map((payment, index) => (
                                <div key={payment.paymentId || index} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-lg ${
                                                payment.paymentDirection === 'INCOMING' 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {getPaymentTypeIcon(payment.paymentType)}
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        {getTransactionTypeLabel(payment.transactionType)}
                                                    </h4>
                                                    {getDirectionIcon(payment.paymentDirection)}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {getPaymentTypeLabel(payment.paymentType)} • {formatDate(payment.createdAt)}
                                                </p>
                                                {payment.listingId && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Listing ID: {payment.listingId}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="flex items-center space-x-3">
                                                <span className={`text-lg font-bold ${
                                                    payment.paymentDirection === 'INCOMING' 
                                                        ? 'text-green-600' 
                                                        : 'text-gray-900'
                                                }`}>
                                                    {payment.paymentDirection === 'INCOMING' ? '+' : '-'}
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                                
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    payment.isSuccess 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {payment.isSuccess ? 'Success' : 'Failed'}
                                                </span>
                                            </div>
                                            
                                            {payment.receiverName && payment.paymentDirection === 'OUTGOING' && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    To: {payment.receiverName} {payment.receiverSurname}
                                                </p>
                                            )}
                                            {payment.senderName && payment.paymentDirection === 'INCOMING' && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    From: {payment.senderName} {payment.senderSurname}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                <span className="text-sm text-gray-700">
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            
                            <div className="text-sm text-gray-700">
                                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, payments.length)} results
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PaymentsPage;