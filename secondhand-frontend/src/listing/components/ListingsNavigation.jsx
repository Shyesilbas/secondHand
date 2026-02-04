import React from 'react';
import {Loader2, Menu, Search, ShoppingBag} from 'lucide-react';

const ListingsNavigation = ({
                              totalElements,
                              selectedCategory,
                              filters,
                              getListingTypeLabel,
                              hasActiveFilters,
                              onToggleFilterSidebar,
                              engineSearch,
                              filteredListings,
                              title = 'Browse Listings',
                              icon = <ShoppingBag className="w-6 h-6 text-white" />,
                              extraActions = null,
                              topSlot = null,
                              children,
                            }) => {
  const term = engineSearch?.term || '';
  const mode = engineSearch?.mode || 'none';
  const isTitle = mode === 'title';
  const isListingNo = mode === 'listingNo';
  const listingNoLoading = Boolean(engineSearch?.listingNo?.loading);
  const listingNoError = engineSearch?.listingNo?.error || '';
  const allPagesLoaded = Boolean(engineSearch?.title?.allPagesLoaded);
  const loadingAllPages = Boolean(engineSearch?.title?.loadingAllPages);
  const loadAllPages = engineSearch?.title?.loadAllPages;
  const clear = engineSearch?.clear;

  return (
      <>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                    onClick={onToggleFilterSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 relative"
                >
                  <Menu className="w-6 h-6" />
                  {hasActiveFilters ? <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gray-900" /> : null}
                </button>
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                  {icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{title}</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-medium text-indigo-600">
                    {getListingTypeLabel(selectedCategory || filters?.listingType) || 'All Categories'}
                  </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 text-sm">{totalElements?.toLocaleString()} results</span>
                  </div>
                </div>
              </div>
              {extraActions ? <div className="flex items-center gap-3">{extraActions}</div> : null}
            </div>

            {topSlot ? <div className="mt-6">{topSlot}</div> : null}

            <div className={topSlot ? 'mt-4' : 'mt-6'}>
              <div className="relative max-w-2xl">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                      type="text"
                      value={term}
                      onChange={(e) => engineSearch?.setTerm?.(e.target.value)}
                      placeholder="Search listings by title or listing number..."
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:bg-white rounded-xl transition-all font-medium"
                  />
                  {term ? (
                      <button
                          onClick={() => clear?.()}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded-md">ESC</span>
                      </button>
                  ) : null}
                </div>
              </div>

              {term ? (
                  <div className="mt-4 flex items-center justify-between bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-900">
                          {isListingNo && listingNoLoading ? (
                              <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching listing number...
                        </span>
                          ) : isListingNo && listingNoError ? (
                              listingNoError
                          ) : loadingAllPages ? (
                              <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Searching everywhere...
                        </span>
                          ) : (
                              <>
                                Found <span className="font-bold">{filteredListings.length}</span> result
                                {filteredListings.length !== 1 ? 's' : ''}
                                {isTitle ? (allPagesLoaded ? ' in all pages' : ' on this page') : ''}
                              </>
                          )}
                        </p>
                      </div>
                    </div>

                    {isTitle && !allPagesLoaded && !loadingAllPages ? (
                        <button
                            onClick={() => loadAllPages?.()}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100 hover:border-indigo-200 transition-all"
                        >
                          Search All Pages
                        </button>
                    ) : null}
                  </div>
              ) : null}
            </div>
          </div>
        </div>

        {typeof children === 'function'
            ? children({
              searchTerm: term,
              searchMode: mode,
              filteredListings,
            })
            : children}
      </>
  );
};

export default ListingsNavigation;