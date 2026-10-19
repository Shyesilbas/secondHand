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
      <p className="text-xs font-medium text-text-tertiary flex items-center gap-1.5">
        <span>{t("related_listings_found", "Önerilen İlgili İlanlar")}</span>
        <span className="px-1.5 py-0.5 rounded-sm bg-background-tertiary text-text-secondary text-xs tabular-nums">
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
            <div className="group flex gap-2.5 rounded border border-border bg-background-primary p-2.5 text-left transition-colors duration-150 hover:border-card-border-hover cursor-pointer">
              {l?.imageUrl ? (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded border border-border bg-background-tertiary">
                  <img
                    src={l.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-border bg-background-secondary">
                  <Tag className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
                </div>
              )}
              <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-text-primary line-clamp-1">
                      {l?.title || 'İlan'}
                    </p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors shrink-0" strokeWidth={1.5} />
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {price && (
                      <span className="inline-flex items-center rounded-sm bg-background-tertiary px-1.5 py-0.5 text-xs font-semibold tabular-nums text-text-primary">
                        {price}
                      </span>
                    )}
                    {loc && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-text-tertiary truncate">
                        <MapPin className="w-3 h-3 text-text-muted shrink-0" strokeWidth={1.5} />
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