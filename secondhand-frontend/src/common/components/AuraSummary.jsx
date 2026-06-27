import { useTranslation } from "react-i18next";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { get } from '../services/api/request.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

export const AuraSummary = ({
  type,
  id
}) => {
  const {
    t
  } = useTranslation();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['ai', 'summary', type, id],
    queryFn: async () => {
      const url = API_ENDPOINTS.AI.SUMMARY(type, id);
      return await get(url);
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return <div className="rounded-xl border border-border-light bg-background-secondary p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 text-text-primary font-bold text-sm tracking-tight">
                    <Sparkles className="w-4.5 h-4.5 animate-[pulse_1.5s_infinite] text-primary shrink-0" />
                    <span>{t("aura_ai_yorum_analizi")}</span>
                </div>
                <span className="text-[9px] font-bold text-text-primary uppercase bg-secondary-light px-2.5 py-0.5 rounded-full border border-border-light shadow-sm shrink-0">{t("analizler_belirli_aral_klarla_tekrar_yap")}</span>
            </div>

            {isLoading ? <div className="space-y-2 py-2 animate-pulse">
                    <div className="h-3.5 bg-border-light rounded w-full" />
                    <div className="h-3.5 bg-border-light rounded w-11/12" />
                    <div className="h-3.5 bg-border-light rounded w-4/5" />
                </div> : error ? <div className="flex items-center gap-1.5 text-xs text-status-error-text font-semibold py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error?.message || t("failed_to_get_summary")}
                </div> : <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-semibold whitespace-pre-line">
                    {summary}
                </p>}
        </div>;
};
export default AuraSummary;