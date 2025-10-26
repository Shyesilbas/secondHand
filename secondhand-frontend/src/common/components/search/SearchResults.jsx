import React from 'react';

const SearchResults = ({ 
  results, 
  activeTab, 
  selectedIndex, 
  isLoading, 
  query,
  onResultSelect 
}) => {
  const formatPrice = (price, currency) => {
    if (!price) return '';
    return `${price.toLocaleString('tr-TR')} ${currency || 'TRY'}`;
  };

  const renderUserResult = (user, index) => (
    <div
      key={user.id}
      onClick={() => onResultSelect(user)}
      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
        index === selectedIndex ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 text-sm">
            {user.name} {user.surname}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {user.email}
          </div>
        </div>
      </div>
    </div>
  );

  const renderListingResult = (listing, index) => (
    <div
      key={listing.id}
      onClick={() => onResultSelect(listing)}
      className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
        index === selectedIndex ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate text-sm">
            {listing.title}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            #{listing.listingNo}
          </div>
          {listing.price && (
            <div className="text-sm font-semibold text-blue-600 mt-1">
              {formatPrice(listing.price, listing.currency)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (results.length > 0) {
    return (
      <>
        {/* Tab Header */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 capitalize">
            {activeTab} Results
          </div>
          <div className="text-xs text-gray-500">
            {results.length} found
          </div>
        </div>

        {/* Results */}
        {results.map((result, index) => 
          activeTab === 'users' 
            ? renderUserResult(result, index)
            : renderListingResult(result, index)
        )}

        {/* Footer */}
        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t flex items-center justify-between">
          <div>↑↓ Navigate • Enter Select • Esc Close</div>
          <div>Ctrl+Tab Switch</div>
        </div>
      </>
    );
  }

  if (query.trim().length >= 2 && !isLoading) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33" />
        </svg>
        <div className="text-sm">No {activeTab} found</div>
        <div className="text-xs text-gray-400 mt-1">Try different keywords</div>
      </div>
    );
  }

  return null;
};

export default SearchResults;
