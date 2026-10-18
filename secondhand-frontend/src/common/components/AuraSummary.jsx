import { useTranslation } from "react-i18next";
import { useQuery } from '@tanstack/react-query';
import { Sparkles, AlertCircle } from 'lucide-react';
import { get } from '../services/api/request.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

export const AuraSummary = ({
  type = 'listing',
  id,
  listing
}) => {
  const { t } = useTranslation();

  const targetType = type || (listing ? 'listing' : 'user');
  const targetId = id || listing?.id;

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
    enabled: Boolean(targetId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1
  });

  const summary = typeof summaryData === 'string' ? summaryData : summaryData?.data || null;

  if (!targetId) {
    return null;
  }

  return (
    <div className="rounded-md border border-border-light bg-white/90 p-4">
      <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
        <div className="flex items-center gap-2 text-text-primary font-semibold text-xs tracking-tight">
          <Sparkles className="w-4 h-4 animate-pulse text-status-warning fill-status-warning shrink-0" />
          <span>{t("aura_ai_yorum_analizi", "Aura AI Akıllı Değerlendirme")}</span>
        </div>
        <span className="text-xs font-semibold text-text-primary bg-background-secondary border border-border-light px-2 py-0.5 rounded-sm shrink-0">
          Otomatik Analiz
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-1.5 animate-pulse">
          <div className="h-3 bg-secondary-200/80 rounded w-full" />
          <div className="h-3 bg-secondary-200/80 rounded w-5/6" />
          <div className="h-3 bg-secondary-200/80 rounded w-3/4" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-medium py-1">
          <AlertCircle className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span>Henüz yeterli değerlendirme verisi bulunmuyor veya analiz hazırlanıyor.</span>
        </div>
      ) : (
        <p className="text-xs text-text-secondary leading-relaxed font-medium whitespace-pre-line">
          {summary || 'Bu ilan için otomatik Aura AI analizi hazırlanıyor.'}
        </p>
      )}
    </div>
  );
};

export default AuraSummary;