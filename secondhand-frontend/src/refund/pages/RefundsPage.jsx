import { useState } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUserRefundRequests, useRefunds } from '../hooks/useRefunds';
import RefundCard from '../components/RefundCard';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator';

const RefundsPage = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const { refunds, loading, error, refetch } = useUserRefundRequests({ page, size });
  const { cancelRefund } = useRefunds();

  const handleCancelRefund = async (refundId) => {
    try {
      await cancelRefund(refundId);
      refetch();
    } catch (error) {
      console.error('Refund cancellation error:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0);
  };

  if (loading && page === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Refund Requests</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track and manage your refund requests from here
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About the Refund Process</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>You can create a refund request within 1 hour of order creation</li>
                  <li>Refund requests are automatically processed after creation</li>
                  <li>The refund process takes approximately 1 hour</li>
                  <li>Refunds will be made to your original payment method</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Refunds List */}
        {refunds.content.length === 0 && !loading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Refund Requests Yet</h3>
            <p className="text-gray-500">
              When you create a refund request, you can track it from here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {refunds.content.map((refund) => (
                <RefundCard
                  key={refund.id}
                  refund={refund}
                  onCancel={handleCancelRefund}
                />
              ))}
            </div>

            {/* Pagination */}
            {refunds.totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 px-3">
                      Page {page + 1} / {refunds.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(Math.min(refunds.totalPages - 1, page + 1))}
                      disabled={page >= refunds.totalPages - 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {refunds.totalElements === 0 ? 0 : page * size + 1} - {Math.min((page + 1) * size, refunds.totalElements)} / {refunds.totalElements}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Per page:</label>
                      <select
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
                        value={size}
                        onChange={handleSizeChange}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RefundsPage;


