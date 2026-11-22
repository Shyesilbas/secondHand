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
  listing,
  title,
  textClassName = 'text-sm'
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

  const showCaption = !hasNoReviews && !isLoading && !error && Boolean(summary);

  // No card of its own: the caller's section supplies the frame; `title` is for places without a heading.
  return (
    <div ref={containerRef}>
      {title && (
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Sparkles className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          {title}
        </p>
      )}

      {hasNoReviews ? (
        <p className="text-sm text-text-muted">
          {t("no_reviews_for_this_product_yet", "Bu ürün/ilan için henüz değerlendirme yapılmamış.")}
        </p>
      ) : isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 text-sm text-text-tertiary">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          <span>{t("aura_summary_unavailable", "Henüz yeterli değerlendirme verisi bulunmuyor veya analiz hazırlanıyor.")}</span>
        </p>
      ) : (
        <p className={`max-w-prose whitespace-pre-line leading-relaxed text-text-secondary ${textClassName}`}>
          {summary || t("aura_summary_preparing", "Bu ilan için otomatik Aura AI analizi hazırlanıyor.")}
        </p>
      )}

      {showCaption && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-text-tertiary">
          <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          {t('aura_summary_caption', 'Alıcı yorumlarından Aura tarafından otomatik oluşturuldu.')}
        </p>
      )}
    </div>
  );
};

export default AuraSummary;