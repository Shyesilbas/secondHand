import React from 'react';
import { formatCurrency } from '../../common/formatters.js';
import ListingCardActions from '../../listing/components/ListingCardActions.jsx';

const DraftListingsList = ({ listings, selectedListing, onSelectListing, onListingChanged }) => {
    const formatPrice = (price, currency = 'TRY') => formatCurrency(price, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200/60 bg-white/80 px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex items-baseline justify-between">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                        Draft Listings
                    </h2>
                    <span className="text-xs text-slate-500">
                        {listings.length} draft{listings.length === 1 ? '' : 's'}
                    </span>
                </div>
                <div className="space-y-4">
                {listings.map((listing) => (
                    <div
                        key={listing.id}
                        className={`rounded-2xl border p-5 cursor-pointer transition-all ${
                            selectedListing?.id === listing.id
                                ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-lg shadow-indigo-100/50'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => onSelectListing(listing)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="mb-2 text-base font-semibold tracking-tight text-slate-900">
                                    {listing.title}
                                </h3>
                                <p className="mb-3 line-clamp-2 text-sm text-slate-500">
                                    {listing.description}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                    <span className="font-mono tracking-tight">
                                        {formatPrice(listing.price, listing.currency)}
                                    </span>
                                    <span>•</span>
                                    <span className="truncate max-w-[120px]">{listing.city}</span>
                                    <span>•</span>
                                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                        Draft
                                    </span>
                                </div>
                            </div>
                            
                            <div className="ml-4 flex flex-col items-end gap-2">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                    selectedListing?.id === listing.id
                                        ? 'border-indigo-500 bg-indigo-500'
                                        : 'border-slate-300'
                                }`}>
                                    {selectedListing?.id === listing.id && (
                                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <ListingCardActions listing={listing} onChanged={onListingChanged} />
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};

export default DraftListingsList;
