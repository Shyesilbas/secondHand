import { useTranslation } from "react-i18next";
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactDOM from 'react-dom';
import { couponService } from '../../services/couponService.js';
import { formatCurrency } from '../../../common/formatters.js';
import { formatCouponDiscount, formatCouponKindLabel } from '../../../coupon/utils/couponUiFormat.js';
import { X } from 'lucide-react';
const ActiveCouponsModal = ({
  isOpen,
  onClose,
  onApply
}) => {
  const {
    t
  } = useTranslation();
  const { data: coupons = [], isLoading, error: queryError } = useQuery({
    queryKey: ['activeCoupons'],
    queryFn: () => couponService.active(),
    select: (data) => Array.isArray(data) ? data : [],
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const error = queryError?.response?.data?.message || queryError?.message || null;
  const sorted = useMemo(() => {
    return [...(coupons || [])].sort((a, b) => String(a.code).localeCompare(String(b.code)));
  }, [coupons]);
  if (!isOpen) return null;
  const modal = <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onMouseDown={e => {
    if (e.target === e.currentTarget) onClose?.();
  }}>
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-border-light bg-background-primary shadow-lg shadow-black/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-text-primary">{t("platform_coupons")}</div>
            <div className="mt-0.5 text-xs text-text-muted">{t("checkout_codes_not_seller_listing_campai")}</div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-text-muted transition-colors hover:text-text-primary" aria-label={t("close")}>
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {isLoading && <div className="text-sm text-text-muted">{t("loading")}</div>}

          {!isLoading && error && <div className="text-sm font-medium text-status-error">{error}</div>}

          {!isLoading && !error && sorted.length === 0 && <div className="text-sm text-text-muted">{t("no_active_coupons")}</div>}

          {!isLoading && !error && sorted.length > 0 && <div className="space-y-2">
              {sorted.map(c => <div key={c.id} className="rounded-lg border border-border-light p-4 transition-colors hover:bg-background-secondary">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-mono text-sm font-semibold text-text-primary">{c.code}</div>
                        <span className="rounded border border-border-light bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                          {formatCouponKindLabel(c.discountKind)}: {formatCouponDiscount(c)}
                        </span>
                      </div>

                      {(c.title?.trim?.() || '') && <div className="mt-1 text-sm font-medium leading-snug text-text-primary">{c.title.trim()}</div>}
                      {(c.description?.trim?.() || '') && <p className="mt-1 text-xs leading-relaxed text-text-secondary">{c.description.trim()}</p>}
                      <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-text-muted sm:grid-cols-2">
                        <div>{t("min_subtotal")}{' '}
                          <span className="font-medium text-text-secondary">
                            {c.minSubtotal != null ? formatCurrency(c.minSubtotal, 'TRY') : '—'}
                          </span>
                        </div>
                        <div>{t("max_discount")}{' '}
                          <span className="font-medium text-text-secondary">
                            {c.maxDiscount != null ? formatCurrency(c.maxDiscount, 'TRY') : '—'}
                          </span>
                        </div>
                        <div>{t("global_left")}{' '}
                          <span className="font-medium text-text-secondary">
                            {c.usageLimitGlobal != null ? c.usageRemainingGlobal : '—'}
                          </span>
                        </div>
                        <div>{t("per_user_left")}{' '}
                          <span className="font-medium text-text-secondary">
                            {c.usageLimitPerUser != null ? c.usageRemainingPerUser : '—'}
                          </span>
                        </div>
                      </div>

                      {Array.isArray(c.eligibleTypes) && c.eligibleTypes.length > 0 && <div className="mt-2 text-xs text-text-muted">{t("eligible")}<span className="font-medium text-text-secondary">{c.eligibleTypes.join(', ')}</span>
                        </div>}
                    </div>

                    <button type="button" onClick={() => onApply?.(c.code)} className="shrink-0 rounded-lg border border-primary bg-primary px-3 py-2 text-sm font-medium text-white transition-all hover:bg-primary-hover">{t("apply")}</button>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
  return ReactDOM.createPortal(modal, document.body);
};
export default ActiveCouponsModal;