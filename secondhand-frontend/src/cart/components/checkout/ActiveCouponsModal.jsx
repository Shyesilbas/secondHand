import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { couponService } from '../../services/couponService.js';
import { formatCurrency } from '../../../common/formatters.js';

const formatDiscount = (coupon) => {
  if (!coupon) return '';
  if (String(coupon.discountKind || '').includes('PERCENT')) {
    return `%${coupon.value}`;
  }
  return formatCurrency(coupon.value, 'TRY');
};

const formatKindLabel = (kind) => {
  switch (kind) {
    case 'ORDER_PERCENT':
      return 'Cart % discount';
    case 'ORDER_FIXED':
      return 'Cart fixed discount';
    case 'TYPE_PERCENT':
      return 'Type % discount';
    case 'TYPE_FIXED':
      return 'Type fixed discount';
    case 'THRESHOLD_FIXED':
      return 'Threshold fixed discount';
    case 'THRESHOLD_PERCENT':
      return 'Threshold % discount';
    default:
      return kind || 'Discount';
  }
};

const ActiveCouponsModal = ({ isOpen, onClose, onApply }) => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    couponService
      .active()
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch((e) => {
        setCoupons([]);
        setError(e?.response?.data?.message || 'Failed to load coupons');
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const sorted = useMemo(() => {
    return [...(coupons || [])].sort((a, b) => String(a.code).localeCompare(String(b.code)));
  }, [coupons]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">Active Coupons</div>
            <div className="text-sm text-gray-600">Pick one to apply to your checkout.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="text-sm text-gray-600">Loading…</div>
          )}

          {!isLoading && error && (
            <div className="text-sm text-red-600 font-medium">{error}</div>
          )}

          {!isLoading && !error && sorted.length === 0 && (
            <div className="text-sm text-gray-600">No active coupons available.</div>
          )}

          {!isLoading && !error && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map((c) => (
                <div key={c.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-gray-900">{c.code}</div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                          {formatKindLabel(c.discountKind)}: {formatDiscount(c)}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          Min subtotal: <span className="font-semibold text-gray-900">{c.minSubtotal != null ? formatCurrency(c.minSubtotal, 'TRY') : '—'}</span>
                        </div>
                        <div>
                          Max discount: <span className="font-semibold text-gray-900">{c.maxDiscount != null ? formatCurrency(c.maxDiscount, 'TRY') : '—'}</span>
                        </div>
                        <div>
                          Global left: <span className="font-semibold text-gray-900">{c.usageLimitGlobal != null ? c.usageRemainingGlobal : '—'}</span>
                        </div>
                        <div>
                          Per-user left: <span className="font-semibold text-gray-900">{c.usageLimitPerUser != null ? c.usageRemainingPerUser : '—'}</span>
                        </div>
                      </div>

                      {Array.isArray(c.eligibleTypes) && c.eligibleTypes.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          Eligible types: <span className="font-semibold text-gray-900">{c.eligibleTypes.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onApply?.(c.code)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default ActiveCouponsModal;

