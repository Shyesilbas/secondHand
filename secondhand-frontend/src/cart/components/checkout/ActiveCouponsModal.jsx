import { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { couponService } from '../../services/couponService.js';
import { formatCurrency } from '../../../common/formatters.js';
import { formatCouponDiscount, formatCouponKindLabel } from '../../../coupon/utils/couponUiFormat.js';
import { X } from 'lucide-react';

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
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-[#e5e3df] bg-white shadow-lg shadow-black/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0efed] px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-[#111]">Platform coupons</div>
            <div className="mt-0.5 text-xs text-[#999]">Checkout codes — not seller listing campaigns.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#999] transition-colors hover:text-[#111]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {isLoading && (
            <div className="text-sm text-[#999]">Loading…</div>
          )}

          {!isLoading && error && (
            <div className="text-sm font-medium text-[#a4262c]">{error}</div>
          )}

          {!isLoading && !error && sorted.length === 0 && (
            <div className="text-sm text-[#999]">No active coupons.</div>
          )}

          {!isLoading && !error && sorted.length > 0 && (
            <div className="space-y-2">
              {sorted.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-[#e5e3df] p-4 transition-colors hover:bg-[#fafaf9]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-mono text-sm font-semibold text-[#111]">{c.code}</div>
                        <span className="rounded border border-[#e5e3df] bg-[#fafaf9] px-2 py-0.5 text-xs font-medium text-[#555]">
                          {formatCouponKindLabel(c.discountKind)}: {formatCouponDiscount(c)}
                        </span>
                      </div>

                      {(c.title?.trim?.() || '') && (
                        <div className="mt-1 text-sm font-medium leading-snug text-[#111]">{c.title.trim()}</div>
                      )}
                      {(c.description?.trim?.() || '') && (
                        <p className="mt-1 text-xs leading-relaxed text-[#555]">{c.description.trim()}</p>
                      )}
                      <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-[#999] sm:grid-cols-2">
                        <div>
                          Min subtotal:{' '}
                          <span className="font-medium text-[#555]">
                            {c.minSubtotal != null ? formatCurrency(c.minSubtotal, 'TRY') : '—'}
                          </span>
                        </div>
                        <div>
                          Max discount:{' '}
                          <span className="font-medium text-[#555]">
                            {c.maxDiscount != null ? formatCurrency(c.maxDiscount, 'TRY') : '—'}
                          </span>
                        </div>
                        <div>
                          Global left:{' '}
                          <span className="font-medium text-[#555]">
                            {c.usageLimitGlobal != null ? c.usageRemainingGlobal : '—'}
                          </span>
                        </div>
                        <div>
                          Per-user left:{' '}
                          <span className="font-medium text-[#555]">
                            {c.usageLimitPerUser != null ? c.usageRemainingPerUser : '—'}
                          </span>
                        </div>
                      </div>

                      {Array.isArray(c.eligibleTypes) && c.eligibleTypes.length > 0 && (
                        <div className="mt-2 text-xs text-[#999]">
                          Eligible: <span className="font-medium text-[#555]">{c.eligibleTypes.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onApply?.(c.code)}
                      className="shrink-0 rounded-lg border border-[#1466c6] bg-[#1466c6] px-3 py-2 text-sm font-medium text-white transition-all hover:bg-[#0f529e]"
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
