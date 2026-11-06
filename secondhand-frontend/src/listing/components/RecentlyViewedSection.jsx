import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ImageOff, X } from 'lucide-react';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';
import { formatCurrency } from '../../common/formatters.js';

// Horizontal strip of listings this browser opened recently (localStorage). Renders nothing when empty.
const RecentlyViewedSection = ({ currentListingId = null, className = '' }) => {
  const { t } = useTranslation();
  const { recentlyViewed, removeRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const items = recentlyViewed.filter(item => item.id !== currentListingId);

  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby="recently-viewed-title">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 id="recently-viewed-title" className="text-base font-semibold text-text-primary">
          {t('recently_viewed_listings', 'Son gezdiklerin')}
        </h2>
        <button
          type="button"
          onClick={clearRecentlyViewed}
          className="text-sm text-text-tertiary transition-colors duration-150 hover:text-text-primary"
        >
          {t('clear_history', 'Temizle')}
        </button>
      </div>

      <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {items.map(item => (
          <li key={item.id} className="relative w-40 shrink-0 snap-start sm:w-44">
            <Link
              to={`/listings/${item.id}`}
              className="group block overflow-hidden rounded border border-border bg-background-primary transition-colors duration-150 hover:border-card-border-hover"
            >
              <div className="flex h-28 items-center justify-center bg-background-tertiary">
                {item.coverImage ? (
                  <img src={item.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <ImageOff className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm text-text-primary">{item.title}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
                  {formatCurrency(item.price, item.currency)}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => removeRecentlyViewed(item.id)}
              aria-label={t('remove_from_history', { defaultValue: '{{title}} geçmişten kaldır', title: item.title })}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded border border-border bg-background-primary text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentlyViewedSection;
