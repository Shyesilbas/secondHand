import PropTypes from 'prop-types';
import { REFUND_STATUS_LABELS, REFUND_STATUS_COLORS } from '../refund';

const RefundStatusBadge = ({ status }) => {
  const label = REFUND_STATUS_LABELS[status] || status;
  const color = REFUND_STATUS_COLORS[status] || 'gray';

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}
    >
      {label}
    </span>
  );
};

RefundStatusBadge.propTypes = {
  status: PropTypes.string.isRequired
};

export default RefundStatusBadge;


