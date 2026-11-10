import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, AlertCircle } from 'lucide-react';
import { get } from '../services/api/request.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';
import Skeleton from './ui/Skeleton.jsx';

export const AuraSummary = ({
  type = 'listing',
  id,
  listing
}) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const targetType = type || (listing ? 'listing' : 'user');
  const targetId = id || listing?.id;

  const totalReviews = Number(
    listing?.reviewStats?.totalReviews ??
    listing?.totalReviews ??
    listing?.reviewCount ??
    listing?.reviews?.length ??
    (listing ? 0 : -1)
  );
  const hasNoReviews = listing && totalReviews === 0;

  useEffect(() => {
    if (isVisible || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  const { data: summaryData, isLoading, error } = useQuery({
    queryKey: ['ai', 'summary', targetType, targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const url = API_ENDPOINTS.AI.SUMMARY(targetType, targetId);
      const res = await get(url);
      if (typeof res === 'string') return res;
      if (res?.data && typeof res.data === 'string') return res.data;
      if (res?.message) return res.message;
      return res;
    },
    enabled: Boolean(targetId) && !hasNoReviews && isVisible,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1
  });

  const summary = typeof summaryData === 'string' ? summaryData : summaryData?.data || null;

  if (!targetId) {
    return null;
  }

  return (
    <div ref={containerRef} className="rounded border border-border-light bg-background-secondary p-4">
      <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
        <div className="flex items-center gap-2 text-text-primary font-semibold text-xs">
          <Sparkles className="w-4 h-4 text-status-warning shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{t("aura_ai_yorum_analizi", "Aura AI Akıllı Değerlendirme")}</span>
        </div>
        <span className="text-xs font-medium text-text-secondary bg-background-primary border border-border-light px-2 py-0.5 rounded-sm shrink-0">
          {t("auto_analysis", "Otomatik analiz")}
        </span>
      </div>

      {hasNoReviews ? (
        <p className="text-sm text-text-muted leading-relaxed">
          {t("no_reviews_for_this_product_yet", "Bu ürün/ilan için henüz değerlendirme yapılmamış.")}
        </p>
      ) : isLoading ? (
        <div className="space-y-2 py-1">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-text-tertiary py-1">
          <AlertCircle className="w-4 h-4 text-text-muted shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{t("aura_summary_unavailable", "Henüz yeterli değerlendirme verisi bulunmuyor veya analiz hazırlanıyor.")}</span>
        </div>
      ) : (
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {summary || t("aura_summary_preparing", "Bu ilan için otomatik Aura AI analizi hazırlanıyor.")}
        </p>
      )}
    </div>
  );
};

export default AuraSummary;