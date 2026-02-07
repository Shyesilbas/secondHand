import { formatCurrency, formatDateTime } from '../../common/formatters.js';

const ListingHero = ({ listing, variant = 'main', displayPrice, hasCampaign, hasStockInfo, isLowStock }) => {
  if (!listing) return null;

  if (variant === 'sidebar') {
    return (
      <div className="mb-6 hidden lg:block">
        <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">{listing.title}</h1>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium tracking-tight">
          <span>{listing.district}, {listing.city}</span>
          <span>•</span>
          <span>{formatDateTime(listing.createdAt)}</span>
        </div>
        {hasStockInfo && (
          <div className="mb-4">
            <span
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold border tracking-tight ${
                isLowStock ? 'bg-amber-50/80 text-amber-700 border-amber-200/60' : 'bg-slate-50/80 text-slate-600 border-slate-200/60'
              }`}
            >
              Stock: {Number(listing.quantity)}
            </span>
          </div>
        )}
        <div className="mb-2">
          <p className="text-3xl font-bold text-slate-900 tracking-tighter">{formatCurrency(displayPrice, listing.currency)}</p>
        </div>
        {hasCampaign && (
          <div className="mt-3 flex items-center gap-3">
            <p className="text-lg font-medium text-slate-400 line-through tracking-tight">{formatCurrency(listing.price, listing.currency)}</p>
            <span className="inline-flex items-center rounded-lg bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60 tracking-tight">
              {listing.campaignName || 'Special Offer'}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm relative group min-h-[500px] flex items-center justify-center p-12">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="max-w-full max-h-[600px] w-auto h-auto object-contain transition-transform duration-500 ease-in-out group-hover:scale-[1.01]"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 ${listing.imageUrl ? 'hidden' : 'flex'}`}>
          <p className="text-sm font-medium text-slate-400 tracking-tight">No image available</p>
        </div>
      </div>

      <div className="lg:hidden bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-tight tracking-tight">{listing.title}</h1>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium tracking-tight">
          <span>{listing.district}, {listing.city}</span>
          <span>•</span>
          <span>{formatDateTime(listing.createdAt)}</span>
        </div>
        {hasStockInfo && (
          <div className="mb-4">
            <span
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold border tracking-tight ${
                isLowStock ? 'bg-amber-50/80 text-amber-700 border-amber-200/60' : 'bg-slate-50/80 text-slate-600 border-slate-200/60'
              }`}
            >
              Stock: {Number(listing.quantity)}
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-4 flex-wrap mb-3">
          <p className="text-3xl font-bold text-slate-900 tracking-tighter">{formatCurrency(displayPrice, listing.currency)}</p>
          {hasCampaign && (
            <p className="text-lg font-medium text-slate-400 line-through tracking-tight">{formatCurrency(listing.price, listing.currency)}</p>
          )}
        </div>
        {hasCampaign && (
          <div className="inline-flex items-center rounded-lg bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60 tracking-tight">
            {listing.campaignName || 'Special Offer'}
          </div>
        )}
      </div>
    </>
  );
};

export default ListingHero;

