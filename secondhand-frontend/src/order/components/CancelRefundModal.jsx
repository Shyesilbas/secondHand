import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CANCEL_REFUND_REASONS, CANCEL_REFUND_REASON_LABELS } from '../../common/enums/cancelRefundReasons.js';

const CancelRefundModal = ({ isOpen, onClose, onSubmit, type, order }) => {
  const [reason, setReason] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const isCancel = type === 'cancel';
  const title = isCancel ? 'Cancel Order' : 'Refund Order';
  const submitLabel = isCancel ? 'Cancel Order' : 'Request Refund';

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === order.orderItems?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(order.orderItems?.map(item => item.id) || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        reason,
        reasonText: reasonText.trim() || null,
        orderItemIds: selectedItems.length > 0 && selectedItems.length < order.orderItems?.length 
          ? selectedItems 
          : null,
      };

      await onSubmit(payload);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setReasonText('');
    setSelectedItems([]);
    setError('');
    onClose();
  };

  const hasMultipleItems = order.orderItems && order.orderItems.length > 1;
  const allItemsSelected = selectedItems.length === order.orderItems?.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button
              className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={handleClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {hasMultipleItems && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Select Items ({selectedItems.length} of {order.orderItems.length} selected)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {allItemsSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {order.orderItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {item.listing?.title || item.listing?.listingNo}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity} • {item.totalPrice} {order.currency}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            >
              <option value="">Select a reason</option>
              {Object.entries(CANCEL_REFUND_REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              placeholder="Please provide more details about your request..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !reason}
            >
              {isSubmitting ? 'Processing...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelRefundModal;

