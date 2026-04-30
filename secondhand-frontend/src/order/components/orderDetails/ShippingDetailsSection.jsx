import React from 'react';
import { Truck, ExternalLink, Package, Calendar, MapPin } from 'lucide-react';
import { formatDateTime } from '../../../common/formatters.js';

export const ShippingDetailsSection = React.memo(({ shipping, CardComponent }) => {
  if (!shipping) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'IN_TRANSIT': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'DELIVERED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'CANCELLED': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'RETURNED': return 'text-purple-600 bg-purple-50 border-purple-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <CardComponent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <Truck className="w-4 h-4 text-indigo-500" />
          Shipping Details
        </h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(shipping.status)}`}>
          {shipping.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Carrier</p>
            <p className="text-sm font-bold text-slate-800">
              {shipping.carrierName || 'Not Assigned'}
            </p>
          </div>

          {shipping.trackingNumber && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Tracking Number</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono font-bold text-indigo-600">{shipping.trackingNumber}</p>
                {shipping.trackingUrl && (
                  <a
                    href={shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-indigo-50 rounded-md text-indigo-500 transition-colors"
                    title="Track Package"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {shipping.estimatedDeliveryDate && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDateTime(shipping.estimatedDeliveryDate)}
              </div>
            </div>
          )}

          {shipping.deliveredAt && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Delivered At</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <Package className="w-3.5 h-3.5" />
                {formatDateTime(shipping.deliveredAt)}
              </div>
            </div>
          )}
          
          {!shipping.trackingNumber && shipping.status === 'PENDING' && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400" />
              <p className="text-[11px] text-slate-500 font-medium">Waiting for seller to ship the items.</p>
            </div>
          )}
        </div>
      </div>
    </CardComponent>
  );
});

ShippingDetailsSection.displayName = 'ShippingDetailsSection';

const Clock = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
