import React from 'react';
import ListingGrid from './ListingGrid';

const SearchResult = ({ searchResult }) => {
    if (!searchResult) return null;

    return (
        <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Search Result</h3>
                <p className="text-blue-700">
                    Found listing: <span className="font-mono font-bold">{searchResult.listingNo}</span>
                </p>
            </div>
            <ListingGrid listings={[searchResult]} isLoading={false} error={null} />
        </div>
    );
};

export default SearchResult;
