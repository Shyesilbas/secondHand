import {Link} from 'react-router-dom';
import {ChevronRight, MapPin, Sparkles, Tag} from 'lucide-react';
import {ROUTES} from '../../common/constants/routes.js';
import {
  formatListingPriceLabel,
  listingStatusLabel,
  listingTypeLabel,
} from '../utils/auraListingContext.js';

export default function AuraListingContextCard({listing}) {
  if (!listing) return null;

  const title = listing.title || 'Listing';
  const priceLabel = formatListingPriceLabel(listing.price, listing.currency);
  const typeLabel = listingTypeLabel(listing.type);
  const statusLabel = listingStatusLabel(listing.status);
  const location = [listing.district, listing.city].filter(Boolean).join(' · ');
  const detailHref = listing.id ? ROUTES.LISTING_DETAIL(listing.id) : null;
  const thumb = listing.imageUrl;

  return (
    <div className="mb-4 rounded-xl border border-violet-200/80 bg-violet-50/30 overflow-hidden">
      {/* Header strip */}
      <div className="px-4 py-2.5 bg-violet-50 border-b border-violet-200/60 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-[11px] font-semibold text-violet-800">Listing context active</span>
        <span className="text-[11px] text-violet-500 ml-1">— Replies are personalized based on this listing</span>
      </div>

      {/* Content */}
      <div className="p-4 flex gap-4">
        {thumb ? (
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
            <Tag className="w-4 h-4 text-gray-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-gray-900 leading-snug tracking-tight truncate">{title}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {priceLabel && (
              <span className="inline-flex items-center rounded-md bg-gray-900 text-white text-[11px] font-semibold px-2 py-0.5">
                {priceLabel}
              </span>
            )}
            {typeLabel && (
              <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white text-[11px] text-gray-600 px-2 py-0.5">
                {typeLabel}
              </span>
            )}
            {statusLabel && (
              <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700 px-2 py-0.5">
                {statusLabel}
              </span>
            )}
          </div>
          {location && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 shrink-0 text-violet-400" />
              {location}
            </p>
          )}
          {listing.listingNo && (
            <p className="mt-1 text-[10px] text-gray-400 font-mono">#{listing.listingNo}</p>
          )}
        </div>
      </div>

      {/* Footer link */}
      {detailHref && (
        <div className="px-4 py-2.5 border-t border-violet-200/60 bg-violet-50/50">
          <Link
            to={detailHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
          >
            Back to listing
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
