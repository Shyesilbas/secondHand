import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { MapPin, Tag } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';

/** Agent yanıtındaki suggestedListings için tıklanabilir özet kartları */
export default function AuraSuggestedListingChips({
  listings,
  dense = false
}) {
  const {
    t
  } = useTranslation();
  if (!Array.isArray(listings) || listings.length === 0) return null;
  return <div className={`flex flex-col gap-2.5 ${dense ? 'mt-2.5' : 'mt-4'}`}>
      <p className="text-caption font-bold uppercase tracking-wider text-slate-400">{t("related_listings_found")}</p>
      <div className="grid grid-cols-1 gap-3">
        {listings.map((l, idx) => {
        const id = l?.id;
        const href = id ? ROUTES.LISTING_DETAIL(id) : null;
        const price = l?.price != null && l?.currency ? `${l.price} ${l.currency}` : l?.price != null ? String(l.price) : null;
        const loc = [l?.district, l?.city].filter(Boolean).join(' · ');
        
        const cardContent = (
          <div className="flex gap-3 rounded-xl border border-border-light bg-background-primary p-3 text-left shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer">
            {l?.imageUrl ? <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 shadow-inner group">
                <img src={l.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
              </div> : <div className="h-16 w-16 shrink-0 rounded-lg bg-slate-50 border border-dashed border-border-light flex items-center justify-center">
                <Tag className="w-5 h-5 text-slate-300" />
              </div>}
            <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-text-primary line-clamp-1 leading-snug">{l?.title || 'İlan'}</p>
                  {l?.listingNo && <span className="text-[10px] text-text-muted font-mono shrink-0">#{l.listingNo}</span>}
                </div>
                
                <div className="flex items-center gap-2 mt-1.5">
                  {price ? <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                      {price}
                    </span> : null}
                  {loc ? <span className="inline-flex items-center gap-0.5 text-caption text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {loc}
                    </span> : null}
                </div>
              </div>
            </div>
          </div>
        );

        if (href) {
          return (
            <Link key={id} to={href} className="block no-underline">
              {cardContent}
            </Link>
          );
        }

        return (
          <div key={idx}>
            {cardContent}
          </div>
        );
      })}
      </div>
    </div>;
}