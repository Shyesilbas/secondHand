import React from 'react';
import { formatCurrency } from '../../common/formatters.js';
import ListingCardActions from '../../listing/components/ListingCardActions.jsx';

const DraftListingsList = ({ listings, selectedListing, onSelectListing, onListingChanged }) => {
    const formatPrice = (price, currency = 'TRY') => formatCurrency(price, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
                Draft Listings ({listings.length})
            </h2>
            
            <div className="space-y-4">
                {listings.map((listing) => (
                    <div
                        key={listing.id}
                        className={`bg-white rounded-lg border p-6 cursor-pointer transition-all ${
                            selectedListing?.id === listing.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-sidebar-border hover:border-header-border'
                        }`}
                        onClick={() => onSelectListing(listing)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-text-primary mb-2">
                                    {listing.title}
                                </h3>
                                <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                                    {listing.description}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-text-muted">
                                    <span>{formatPrice(listing.price, listing.currency)}</span>
                                    <span>•</span>
                                    <span>{listing.city}</span>
                                    <span>•</span>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                        Draft
                                    </span>
                                </div>
                            </div>
                            
                            <div className="ml-4 flex flex-col items-end gap-2">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    selectedListing?.id === listing.id
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-header-border'
                                }`}>
                                    {selectedListing?.id === listing.id && (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
    );
};

export default DraftListingsList;
