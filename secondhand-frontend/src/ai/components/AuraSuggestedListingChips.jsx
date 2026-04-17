import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';

/** Agent yanıtındaki suggestedListings için tıklanabilir özet kartları */
export default function AuraSuggestedListingChips({ listings, dense = false }) {
  if (!Array.isArray(listings) || listings.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${dense ? 'mt-2' : 'mt-3'}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Bulunan ilanlar</p>
      <div className="flex flex-col gap-2">
        {listings.map((l, idx) => {
          const id = l?.id;
          const href = id ? ROUTES.LISTING_DETAIL(id) : null;
          const price =
            l?.price != null && l?.currency
              ? `${l.price} ${l.currency}`
              : l?.price != null
                ? String(l.price)
                : null;
          const loc = [l?.district, l?.city].filter(Boolean).join(' · ');
          return (
            <div
              key={id || `${l?.listingNo || 'row'}-${idx}`}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white/95 p-2.5 text-left shadow-sm"
            >
              {l?.imageUrl ? (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <img src={l.imageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-slate-900 line-clamp-2 leading-snug">{l?.title || 'İlan'}</p>
                {price ? <p className="text-xs font-medium text-indigo-700 mt-0.5">{price}</p> : null}
                {loc ? <p className="text-[11px] text-slate-500 mt-0.5">{loc}</p> : null}
                {l?.listingNo ? (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">No: {l.listingNo}</p>
                ) : null}
                {href ? (
                  <Link
                    to={href}
                    className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    İlana git
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
