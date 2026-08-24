import React from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { MapPin, Tag, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';

/** Agent yanıtındaki suggestedListings için tıklanabilir özet kartları */
export default function AuraSuggestedListingChips({
  listings,
  dense = false
}) {
  const { t } = useTranslation();
  if (!Array.isArray(listings) || listings.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2.5 ${dense ? 'mt-2.5' : 'mt-4'}`}>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <span>{t("related_listings_found", "Önerilen İlgili İlanlar")}</span>
        <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
          {listings.length}
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {listings.map((l) => {
          const id = l?.id;
          const href = id ? ROUTES.LISTING_DETAIL(id) : null;
          const price = l?.price != null && l?.currency ? `${l.price} ${l.currency}` : l?.price != null ? String(l.price) : null;
          const loc = [l?.district, l?.city].filter(Boolean).join(' · ');

          const cardContent = (
            <div className="group flex gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-left shadow-2xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01] cursor-pointer">
              {l?.imageUrl ? (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-inner">
                  <img
                    src={l.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-108"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {l?.title || 'İlan'}
                    </p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {price && (
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-extrabold text-indigo-700">
                        {price}
                      </span>
                    )}
                    {loc && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {loc}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );

          if (href) {
            return (
              <Link key={id || l?.title} to={href} className="block no-underline">
                {cardContent}
              </Link>
            );
          }

          return <div key={id || l?.title}>{cardContent}</div>;
        })}
      </div>
    </div>
  );
}