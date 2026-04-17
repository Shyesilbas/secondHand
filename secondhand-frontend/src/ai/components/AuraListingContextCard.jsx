import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Sparkles, Tag } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import {
  formatListingPriceLabel,
  listingStatusLabelTr,
  listingTypeLabelTr,
} from '../utils/auraListingContext.js';

export default function AuraListingContextCard({ listing }) {
  if (!listing) return null;

  const title = listing.title || 'İlan';
  const priceLabel = formatListingPriceLabel(listing.price, listing.currency);
  const typeLabel = listingTypeLabelTr(listing.type);
  const statusLabel = listingStatusLabelTr(listing.status);
  const location = [listing.district, listing.city].filter(Boolean).join(' · ');
  const detailHref = listing.id ? ROUTES.LISTING_DETAIL(listing.id) : null;
  const thumb = listing.imageUrl;

  return (
    <div className="mb-5 rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30 p-4 sm:p-5 shadow-sm shadow-indigo-900/5 ring-1 ring-slate-900/[0.04]">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
          <Sparkles className="w-4 h-4" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900/90">Bu ilan için Aura</p>
          <p className="text-[11px] text-slate-500">Yanıtlar aşağıdaki ilana göre kişiselleştirilir.</p>
        </div>
      </div>

      <div className="flex gap-4">
        {thumb ? (
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-inner">
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 text-center px-2">
            Görsel yok
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug tracking-tight">{title}</h2>
          <div className="flex flex-wrap gap-2">
            {priceLabel ? (
              <span className="inline-flex items-center rounded-full bg-slate-900 text-white text-xs font-semibold px-3 py-1">
                {priceLabel}
              </span>
            ) : null}
            {typeLabel ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 text-xs text-slate-700 px-2.5 py-1">
                <Tag className="w-3 h-3 opacity-70" />
                {typeLabel}
              </span>
            ) : null}
            {statusLabel ? (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-900 px-2.5 py-1">
                {statusLabel}
              </span>
            ) : null}
          </div>
          {location ? (
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
              {location}
            </p>
          ) : null}
          {listing.listingNo ? (
            <p className="text-[11px] text-slate-400 font-mono">İlan no: {listing.listingNo}</p>
          ) : null}
        </div>
      </div>

      {detailHref ? (
        <div className="mt-4 pt-3 border-t border-indigo-100/80">
          <Link
            to={detailHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            İlana geri dön
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
