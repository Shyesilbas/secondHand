import { useTranslation } from "react-i18next";
import { useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactDOM from 'react-dom';
import { couponService } from '../../services/couponService.js';
import { formatCurrency } from '../../../common/formatters.js';
import { formatCouponDiscount, formatCouponKindLabel } from '../../../coupon/utils/couponUiFormat.js';
import { X, Tag, Sparkles, Check, ArrowRight, Ticket, Loader2 } from 'lucide-react';

const ActiveCouponsModal = ({
  isOpen,
  onClose,
  onApply
}) => {
  const { t } = useTranslation();
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

  const modal = (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm animate-in fade-in duration-200" 
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {t("platform_coupons", "Kullanılabilir Kuponlar")}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Siparişinize uygun olan platform indirim kuponunu seçip anında uygulayın.
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label={t("close", "Kapat")}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
              <span className="text-xs font-bold uppercase tracking-wider">{t("loading", "Kuponlar Yükleniyor...")}</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          {!isLoading && !error && sorted.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">{t("no_active_coupons", "Aktif Kupon Bulunamadı")}</p>
              <p className="text-xs text-slate-400 mt-1">Şu anda sepetinize uygulanabilecek aktif kampanya kuponu bulunmuyor.</p>
            </div>
          )}

          {!isLoading && !error && sorted.length > 0 && (
            <div className="space-y-3">
              {sorted.map(c => (
                <div 
                  key={c.id} 
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-4.5 hover:border-slate-400 hover:bg-white transition-all duration-200 shadow-xs"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-sm font-black font-mono text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                        <Tag className="h-3.5 w-3.5 text-slate-700" />
                        {c.code}
                      </span>
                      <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                        {formatCouponKindLabel(c.discountKind)}: {formatCouponDiscount(c)}
                      </span>
                    </div>

                    {(c.title?.trim?.() || '') && (
                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {c.title.trim()}
                      </h4>
                    )}

                    {(c.description?.trim?.() || '') && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {c.description.trim()}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400 font-semibold">
                      {c.minSubtotal != null && (
                        <span>Alt Limit: <strong className="text-slate-700">{formatCurrency(c.minSubtotal, 'TRY')}</strong></span>
                      )}
                      {c.maxDiscount != null && (
                        <span>Max İndirim: <strong className="text-slate-700">{formatCurrency(c.maxDiscount, 'TRY')}</strong></span>
                      )}
                      {c.usageLimitGlobal != null && (
                        <span>Kalan Limit: <strong className="text-slate-700">{c.usageRemainingGlobal}</strong></span>
                      )}
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => onApply?.(c.code)} 
                    className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 transition-all shadow-xs"
                  >
                    <span>{t("apply", "Uygula")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
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

export default memo(ActiveCouponsModal);