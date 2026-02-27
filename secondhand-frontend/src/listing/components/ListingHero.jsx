import {formatCurrency, formatDateTime} from '../../common/formatters.js';

const ListingHero = ({ listing, variant = 'main', displayPrice, hasCampaign, hasStockInfo, isLowStock }) => {
  if (!listing) return null;

  if (variant === 'sidebar') {
    return (
      <div className="mb-5 hidden lg:block">
        <h1 className="text-lg font-semibold text-gray-900 leading-snug mb-2 tracking-[-0.01em]">{listing.title}</h1>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
          <span>{listing.district}, {listing.city}</span>
          <span>·</span>
          <span className="tabular-nums">{formatDateTime(listing.createdAt)}</span>
        </div>
        {hasStockInfo && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center rounded px-2 py-1 text-[11px] font-medium ${
                isLowStock ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
              }`}
            >
              {isLowStock ? `Low stock · ${Number(listing.quantity)} left` : `In stock · ${Number(listing.quantity)}`}
            </span>
          </div>
        )}
        <div className="mb-1">
          <p className="text-2xl font-semibold text-gray-900 tabular-nums tracking-tight">{formatCurrency(displayPrice, listing.currency)}</p>
        </div>
        {hasCampaign && (
          <div className="mt-2 flex items-center gap-2">
            <p className="text-[13px] text-gray-400 line-through tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
            <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50">
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
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 relative group min-h-[420px] flex items-center justify-center p-8">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="max-w-full max-h-[520px] w-auto h-auto object-contain"
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

      {/* Mobile info */}
      <div className="lg:hidden bg-white p-5 rounded-lg border border-gray-100">
        <h1 className="text-lg font-semibold text-gray-900 mb-2 leading-snug tracking-[-0.01em]">{listing.title}</h1>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
          <span>{listing.district}, {listing.city}</span>
          <span>·</span>
          <span className="tabular-nums">{formatDateTime(listing.createdAt)}</span>
        </div>
        {hasStockInfo && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center rounded px-2 py-1 text-[11px] font-medium ${
                isLowStock ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
              }`}
            >
              {isLowStock ? `Low stock · ${Number(listing.quantity)} left` : `In stock · ${Number(listing.quantity)}`}
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <p className="text-2xl font-semibold text-gray-900 tabular-nums tracking-tight">{formatCurrency(displayPrice, listing.currency)}</p>
          {hasCampaign && (
            <p className="text-[13px] text-gray-400 line-through tabular-nums">{formatCurrency(listing.price, listing.currency)}</p>
          )}
        </div>
        {hasCampaign && (
          <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50">
            {listing.campaignName || 'Sale'}
          </span>
        )}
      </div>
    </>
  );
};

export default ListingHero;

