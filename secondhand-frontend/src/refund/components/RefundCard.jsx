import PropTypes from 'prop-types';
import { Package, Calendar, CreditCard, XCircle, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';
import RefundStatusBadge from './RefundStatusBadge';
import { canCancelRefund, REFUND_METHOD_LABELS, REFUND_STATUS_DESCRIPTIONS } from '../refund';
import { formatDate, formatDateTime } from '../../common/formatters';

const RefundCard = ({ refund, onCancel }) => {
  const canCancel = canCancelRefund(refund);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this refund request?')) {
      onCancel?.(refund.id);
    }
  };

  const formatAdminNote = (adminNote) => {
    if (!adminNote) return '';
    
    // Technical error messages to user-friendly messages
    if (adminNote.includes('Row was updated or deleted by another transaction')) {
      return 'This refund request encountered a processing conflict and was automatically rejected. Please create a new refund request if needed.';
    }
    
    if (adminNote.includes('Auto-rejected due to processing error')) {
      const cleanMessage = adminNote.replace('Auto-rejected due to processing error: ', '');
      if (cleanMessage.includes('Row was updated')) {
        return 'This refund request encountered a processing conflict and was automatically rejected. Please create a new refund request if needed.';
      }
      return `Processing error: ${cleanMessage}`;
    }
    
    return adminNote;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-medium text-gray-900">Refund Request #{refund.refundNumber}</h3>
            <RefundStatusBadge status={refund.status} />
          </div>
          <p className="text-sm text-gray-500">Order: {refund.orderNumber}</p>
        </div>
        {canCancel && (
          <button
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 p-1"
            title="Cancel Refund Request"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Product Information */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <Package className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {refund.orderItem?.listing?.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Quantity: {refund.orderItem?.quantity} • Amount: {refund.refundAmount} {refund.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Refund Reason */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-700 mb-1">Refund Reason:</p>
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          {refund.reason}
        </p>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-xs">
            Created: {formatDate(refund.createdAt)}
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <CreditCard className="w-4 h-4 mr-2" />
          <span className="text-xs">
            Refund Method: {REFUND_METHOD_LABELS[refund.refundMethod] || refund.refundMethod}
          </span>
        </div>
      </div>

      {/* Timeline and Status Information */}
      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
        {/* Status Description */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            {refund.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {refund.status === 'REJECTED' && <AlertCircle className="w-4 h-4 text-red-600" />}
            {refund.status === 'PROCESSING' && <Clock className="w-4 h-4 text-blue-600" />}
            {refund.status === 'PENDING' && <Clock className="w-4 h-4 text-yellow-600" />}
            {refund.status === 'CANCELLED' && <XCircle className="w-4 h-4 text-gray-600" />}
            {refund.status === 'APPROVED' && <CheckCircle className="w-4 h-4 text-green-600" />}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-600">
              {REFUND_STATUS_DESCRIPTIONS[refund.status]}
            </p>
          </div>
        </div>

        {/* Admin Notes */}
        {refund.adminNotes && (
          <div className={`border rounded-lg p-3 ${
            refund.status === 'REJECTED' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              <User className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                refund.status === 'REJECTED' 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
              }`} />
              <div className="flex-1">
                <p className={`text-xs font-medium mb-1 ${
                  refund.status === 'REJECTED' 
                    ? 'text-red-800' 
                    : 'text-yellow-800'
                }`}>
                  {refund.status === 'REJECTED' ? 'Rejection Reason:' : 'Admin Note:'}
                </p>
                <p className={`text-xs ${
                  refund.status === 'REJECTED' 
                    ? 'text-red-700' 
                    : 'text-yellow-700'
                }`}>
                  {formatAdminNote(refund.adminNotes)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Created: {formatDateTime(refund.createdAt)}</span>
          </div>
          
          {refund.processedAt && (
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Clock className="w-3 h-3" />
              <span>Started processing: {formatDateTime(refund.processedAt)}</span>
            </div>
          )}
          
          {refund.completedAt && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span>Completed: {formatDateTime(refund.completedAt)}</span>
            </div>
          )}
          
          {refund.updatedAt !== refund.createdAt && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Last updated: {formatDateTime(refund.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Refund Reference */}
        {refund.refundReference && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-700">
                <strong>Refund Reference:</strong> {refund.refundReference}
              </span>
            </div>
          </div>
        )}

        {/* Processing Time Info */}
        {refund.processedAt && refund.completedAt && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <p className="text-xs text-green-700">
              <strong>Processing Time:</strong> {Math.round(
                (new Date(refund.completedAt) - new Date(refund.processedAt)) / (1000 * 60)
              )} minutes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

RefundCard.propTypes = {
  refund: PropTypes.object.isRequired,
  onCancel: PropTypes.func
};

export default RefundCard;


