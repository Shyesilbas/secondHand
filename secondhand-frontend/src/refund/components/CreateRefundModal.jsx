import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useRefunds } from '../hooks/useRefunds';
import { useNotification } from '../../notification/NotificationContext';

const CreateRefundModal = ({ isOpen, onClose, orderItem, orderId, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const { createRefund, loading, error } = useRefunds();
  const notification = useNotification();

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!reason.trim()) {
      newErrors.reason = 'Refund reason is required';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Refund reason must be at least 10 characters';
    } else if (reason.trim().length > 1000) {
      newErrors.reason = 'Refund reason cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const refundRequest = await createRefund({
        orderId,
        orderItemId: orderItem.id,
        reason: reason.trim()
      });

      // Show success notification
      notification.showSuccess(
        'Refund Request Created',
        `Your refund request has been successfully created. Request No: ${refundRequest.refundNumber}. You can track the refund process.`
      );

      setReason('');
      setErrors({});
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Refund request creation error:', err);
      // Show error notification
      notification.showError(
        'Refund Request Failed',
        err.response?.data?.message || 'An error occurred while creating the refund request. Please try again.'
      );
    }
  };

  const handleClose = () => {
    setReason('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50 z-[60]"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[61]">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create Refund Request
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Product Information */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Product:</span> {orderItem.listing?.title}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Quantity:</span> {orderItem.quantity}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Amount:</span> {orderItem.totalPrice} {orderItem.currency}
              </p>
            </div>

            {/* Warning Message */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your refund request will be automatically processed after creation.</li>
                  <li>Refunds will be made to your original payment method.</li>
                  <li>The refund process takes approximately 1 hour.</li>
                </ul>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Refund Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  rows="4"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.reason
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Please explain your refund reason in detail (minimum 10 characters)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {reason.length} / 1000 characters
                </p>
              </div>

              {/* API Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Refund Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

CreateRefundModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orderItem: PropTypes.object.isRequired,
  orderId: PropTypes.number.isRequired,
  onSuccess: PropTypes.func
};

export default CreateRefundModal;

