import { useTranslation } from "react-i18next";
import { useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { couponService } from '../../services/couponService.js';
import { formatCurrency } from '../../../common/formatters.js';
import { formatCouponDiscount, formatCouponKindLabel } from '../../../coupon/utils/couponUiFormat.js';
import { Ticket } from 'lucide-react';
import { Button, EmptyState, Modal, Skeleton } from '../../../common/components/ui/index.js';

const ActiveCouponsModal = ({
  isOpen,
  onClose,
  onApply
}) => {
  const { t } = useTranslation();
  const { data: coupons = [], isLoading, error: queryError, refetch } = useQuery({
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("platform_coupons", "Kullanılabilir Kuponlar")} size="lg">
      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {['a', 'b', 'c'].map((k) => <Skeleton key={k} className="h-20 w-full" />)}
        </div>
      ) : error ? (
        <div role="alert" className="flex items-center justify-between gap-3">
          <p className="text-sm text-status-error-text">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>{t("try_again")}</Button>
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={t("no_active_coupons", "Aktif Kupon Bulunamadı")}
          description="Şu anda sepetinize uygulanabilecek aktif kampanya kuponu bulunmuyor."
        />
      ) : (
        <ul className="divide-y divide-border-light">
          {sorted.map(c => (
            <li key={c.id} className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-sm text-text-primary">{c.code}</span>
                  <span className="text-sm text-text-secondary">
                    {formatCouponKindLabel(c.discountKind)}: {formatCouponDiscount(c)}
                  </span>
                </div>
                {c.title?.trim?.() && <p className="text-sm font-medium text-text-primary">{c.title.trim()}</p>}
                {c.description?.trim?.() && <p className="text-sm text-text-secondary">{c.description.trim()}</p>}
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-text-tertiary">
                  {c.minSubtotal != null && <span>Alt limit: {formatCurrency(c.minSubtotal, 'TRY')}</span>}
                  {c.maxDiscount != null && <span>Maks. indirim: {formatCurrency(c.maxDiscount, 'TRY')}</span>}
                  {c.usageLimitGlobal != null && <span>Kalan limit: {c.usageRemainingGlobal}</span>}
                </p>
              </div>
              <Button size="sm" onClick={() => onApply?.(c.code)}>{t("apply", "Uygula")}</Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default memo(ActiveCouponsModal);
