import { useTranslation } from "react-i18next";
import ListingCardActions from '../../listing/components/ListingCardActions.jsx';
import { formatPaymentAmount } from '../utils/formatPaymentAmount.js';
const DraftListingsList = ({
  listings,
  selectedListing,
  onSelectListing,
  onListingChanged
}) => {
  const {
    t
  } = useTranslation();
    return (
        <div className="lg:col-span-7 xl:col-span-8">
            <div className="rounded-2xl border border-white/60 bg-background-primary/70 backdrop-blur-xl px-6 py-8 shadow-sm">
                <div className="mb-4 flex items-baseline justify-between">
                    <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("draft_listings")}</h2>
                    <span className="text-xs text-slate-500">
                        {listings.length}{t("draft")}{listings.length === 1 ? '' : 's'}
                    </span>
                </div>
                    <div className="space-y-4">
                        {listings.map(listing => {
                            const isSelected = selectedListing?.id === listing.id;
                            return (
                                <div 
                                    key={listing.id} 
                                    onClick={() => onSelectListing(listing)}
                                    className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 ease-out border overflow-hidden
                                        ${isSelected 
                                            ? 'border-primary bg-indigo-50/30 shadow-sm -translate-y-0.5' 
                                            : 'border-border-light bg-background-primary hover:border-primary hover:shadow-md hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                                    )}
                                    <div className="relative flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className={`text-sm font-medium text-text-primary mb-2 tracking-tight transition-colors ${isSelected ? '' : ''}`}>
                                                {listing.title}
                                            </h3>
                                            <p className="mb-3 line-clamp-2 text-sm text-slate-500 leading-relaxed">
                                                {listing.description}
                                            </p>
                                            <div className="flex items-center space-x-3 text-sm text-slate-500">
                                                <span className="font-mono tracking-tight font-medium text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md">
                                                    {formatPaymentAmount(listing.price, listing.currency)}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className="truncate max-w-[120px] font-medium">{listing.city}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="rounded-full bg-status-warning-bg/50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-500/20">
                                                    {t("draft")}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="ml-4 flex flex-col items-end gap-3">
                                            <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors duration-300 ${isSelected ? 'border-primary bg-indigo-500 shadow-sm shadow-indigo-200' : 'border-slate-300 bg-slate-50'}`}>
                                                {isSelected && (
                                                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <ListingCardActions listing={listing} onChanged={onListingChanged} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
            </div>
        </div>
    );
};
export default DraftListingsList;