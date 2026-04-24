import {formatCurrency, formatDateTime} from '../../common/formatters.js';

const ListingHero = ({ listing, variant = 'main', displayPrice, hasCampaign, hasStockInfo, isLowStock }) => {
  if (!listing) return null;

  if (variant === 'sidebar') {
    return (
      <div className="mb-5 hidden lg:block">
        <h1 className="text-[17px] font-semibold text-gray-900 leading-snug mb-2.5 tracking-[-0.01em]">{listing.title}</h1>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
          <span>{listing.district}, {listing.city}</span>
          <span>·</span>
          <span className="tabular-nums">{formatDateTime(listing.createdAt)}</span>
        </div>

        {hasStockInfo && (
          <div className="mb-3.5">
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ${
              isLowStock ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
            }`}>
              {isLowStock && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
              {isLowStock ? `${Number(listing.quantity)} left` : `${Number(listing.quantity)} in stock`}
            </span>
          </div>
        )}

        <div className="mb-1">
          <p className="text-[28px] font-semibold text-gray-900 tabular-nums tracking-tight leading-none">{formatCurrency(displayPrice, listing.currency)}</p>
        </div>
        {hasCampaign && (
          <div className="mt-2 flex items-center gap-2">
            <p className="text-[13px] text-gray-400 line-through tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
            <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50">
              {listing.campaignName || 'Sale'}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Image */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 relative group">
        <div className="min-h-[260px] flex items-center justify-center p-5">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="max-w-full max-h-[380px] w-auto h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full flex flex-col items-center justify-center text-gray-300 ${listing.imageUrl ? 'hidden' : 'flex'}`}>
            <p className="text-[13px] text-gray-300">No image available</p>
          </div>
        </div>
      </div>

      {/* Mobile info */}
      <div className="lg:hidden bg-white p-5 rounded-2xl border border-gray-100">
        <h1 className="text-[17px] font-semibold text-gray-900 mb-2.5 leading-snug tracking-[-0.01em]">{listing.title}</h1>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
          <span>{listing.district}, {listing.city}</span>
          <span>·</span>
          <span className="tabular-nums">{formatDateTime(listing.createdAt)}</span>
        </div>
        {hasStockInfo && (
          <div className="mb-3">
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ${
              isLowStock ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
            }`}>
              {isLowStock && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
              {isLowStock ? `${Number(listing.quantity)} left` : `${Number(listing.quantity)} in stock`}
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-3 flex-wrap">
          <p className="text-2xl font-semibold text-gray-900 tabular-nums tracking-tight">{formatCurrency(displayPrice, listing.currency)}</p>
          {hasCampaign && (
            <>
              <p className="text-[13px] text-gray-400 line-through tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
              <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50">
                {listing.campaignName || 'Sale'}
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ListingHero;
