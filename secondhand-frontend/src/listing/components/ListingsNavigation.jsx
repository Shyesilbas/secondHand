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
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                    onClick={onToggleFilterSidebar}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900 relative"
                >
                  <Menu className="w-5 h-5" />
                  {hasActiveFilters ? <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gray-900" /> : null}
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 tracking-tight leading-none">{title}</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[13px] font-medium text-gray-600">
                    {getListingTypeLabel(selectedCategory || filters?.listingType) || 'All Categories'}
                  </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400 text-[13px]">{totalElements?.toLocaleString()} results</span>
                  </div>
                </div>
              </div>
              {extraActions ? <div className="flex items-center gap-3">{extraActions}</div> : null}
            </div>

            {topSlot ? <div className="mt-5">{topSlot}</div> : null}

            <div className={topSlot ? 'mt-3' : 'mt-5'}>
              <div className="relative max-w-2xl">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                  </div>
                  <input
                      type="text"
                      value={term}
                      onChange={(e) => engineSearch?.setTerm?.(e.target.value)}
                      placeholder="Search by title or listing number…"
                      className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 focus:bg-white rounded-xl transition-all text-[13px] font-medium"
                  />
                  {term ? (
                      <button
                          onClick={() => clear?.()}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-gray-200 rounded-md">ESC</span>
                      </button>
                  ) : null}
                </div>
              </div>

              {term ? (
                  <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-gray-700">
                          {isListingNo && listingNoLoading ? (
                              <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Searching listing number…
                        </span>
                          ) : isListingNo && listingNoError ? (
                              listingNoError
                          ) : loadingAllPages ? (
                              <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Searching everywhere…
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
                            className="text-[11px] font-semibold text-gray-700 hover:text-gray-900 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
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