import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Sparkles, Tag } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatListingPriceLabel, listingStatusLabel, listingTypeLabel } from '../utils/auraListingContext.js';
export default function AuraListingContextCard({
  listing
}) {
  const {
    t
  } = useTranslation();
  if (!listing) return null;
  const title = listing.title || 'Listing';
  const priceLabel = formatListingPriceLabel(listing.price, listing.currency);
  const typeLabel = listingTypeLabel(listing.type);
  const statusLabel = listingStatusLabel(listing.status);
  const location = [listing.district, listing.city].filter(Boolean).join(' · ');
  const detailHref = listing.id ? ROUTES.LISTING_DETAIL(listing.id) : null;
  const thumb = listing.imageUrl;
  return <div className="mb-4 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:border-slate-300">
      {/* Header strip */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-5 w-5 items-center justify-center rounded bg-slate-900 shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-tight">{t("active_context")}</span>
        </div>
        <span className="text-[10px] sm:text-xs font-medium text-slate-500 hidden sm:inline-block">{t("personalized_recommendations_active")}</span>
      </div>

      {/* Content */}
      <div className="p-4 flex gap-4">
        {thumb ? <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          </div> : <div className="shrink-0 w-16 h-16 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
            <Tag className="w-4 h-4 text-slate-300" />
          </div>}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <h2 className="text-sm font-bold text-slate-900 leading-snug tracking-tight truncate">
            {title}
          </h2>
          
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {priceLabel && <span className="inline-flex items-center rounded bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 shadow-sm">
                {priceLabel}
              </span>}
            {typeLabel && <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white text-[11px] font-medium text-slate-600 px-2 py-0.5 shadow-sm">
                {typeLabel}
              </span>}
            {statusLabel && <span className="inline-flex items-center rounded border border-emerald-100 bg-emerald-50 text-[11px] font-semibold text-emerald-700 px-2 py-0.5">
                {statusLabel}
              </span>}
          </div>

          {location && <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
              {location}
            </p>}
        </div>
      </div>

      {/* Footer link */}
      {detailHref && <div className="px-4 py-2 border-t border-slate-150 bg-slate-50/50">
          <Link to={detailHref} className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors group/link">{t("return_to_listing_detail")}<ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </Link>
        </div>}
    </div>;
}