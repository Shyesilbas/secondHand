import PropTypes from 'prop-types';
import { RotateCcw, Package, XCircle } from 'lucide-react';
import RefundStatusBadge from './RefundStatusBadge';
import { REFUND_STATUS_DESCRIPTIONS } from '../refund';

const OrderItemRefundStatus = ({ orderItem, refundRequest, canCancel, onCreateRefund }) => {
  // Refund talebi varsa durumunu göster
  if (refundRequest) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-500" />
          <RefundStatusBadge status={refundRequest.status} />
        </div>
        <div className="text-xs text-gray-500">
          {REFUND_STATUS_DESCRIPTIONS[refundRequest.status]}
        </div>
        {refundRequest.refundNumber && (
          <div className="text-xs text-gray-400">
            Request No: {refundRequest.refundNumber}
          </div>
        )}
      </div>
    );
  }

  // Show button if can cancel
  if (canCancel) {
    return (
      <button
        onClick={onCreateRefund}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Create Refund Request
      </button>
    );
  }

  // Show info if cannot cancel
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <XCircle className="w-4 h-4" />
      <span>Cancellation period expired</span>
    </div>
  );
};

OrderItemRefundStatus.propTypes = {
  orderItem: PropTypes.object.isRequired,
  refundRequest: PropTypes.object,
  canCancel: PropTypes.bool,
  onCreateRefund: PropTypes.func.isRequired
};

export default OrderItemRefundStatus;

