import React from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { MapPin, Tag, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';

export default function AuraSuggestedListingChips({
  listings,
  dense = false
}) {
  const { t } = useTranslation();
  if (!Array.isArray(listings) || listings.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${dense ? 'mt-2' : 'mt-3'}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
        <span>{t("related_listings_found", "Önerilen İlgili İlanlar")}</span>
        <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 text-[10px] font-bold">
          {listings.length}
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {listings.map((l) => {
          const id = l?.id;
          const href = id ? ROUTES.LISTING_DETAIL(id) : null;
          const price = l?.price != null && l?.currency ? `${l.price} ${l.currency}` : l?.price != null ? String(l.price) : null;
          const loc = [l?.district, l?.city].filter(Boolean).join(' · ');

          const cardContent = (
            <div className="group flex gap-2.5 rounded-xl border border-zinc-200 bg-white p-2.5 text-left shadow-2xs transition-colors hover:border-black cursor-pointer">
              {l?.imageUrl ? (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                  <img
                    src={l.imageUrl}
                    alt=""
                    className="h-full w-full object-cover grayscale-20"
                  />
                </div>
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-zinc-400" />
                </div>
              )}
              <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-bold text-black line-clamp-1">
                      {l?.title || 'İlan'}
                    </p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black transition-colors shrink-0" />
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {price && (
                      <span className="inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-bold text-black">
                        {price}
                      </span>
                    )}
                    {loc && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500 truncate">
                        <MapPin className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
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