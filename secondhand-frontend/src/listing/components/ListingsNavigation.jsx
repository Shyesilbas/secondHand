import { useTranslation } from "react-i18next";
import { Loader2, Menu, Search, ShoppingBag } from 'lucide-react';
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
  extraActions = null,
  topSlot = null,
  children
}) => {
  const {
    t
  } = useTranslation();
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
  return <>
        <div className="bg-background-primary border-b border-border-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={onToggleFilterSidebar} className="p-2 rounded-lg hover:bg-secondary-light transition-colors text-text-muted hover:text-text-primary relative">
                  <Menu className="w-5 h-5" />
                  {hasActiveFilters ? <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" /> : null}
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{title}</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm font-medium text-text-secondary">
                    {getListingTypeLabel(selectedCategory || filters?.listingType) || 'All Categories'}
                  </span>
                    <span className="text-border-DEFAULT">·</span>
                    <span className="text-text-muted text-sm">{totalElements?.toLocaleString()}{t("results")}</span>
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
                    <Search className="h-4 w-4 text-text-muted group-focus-within:text-text-secondary transition-colors" />
                  </div>
                  <input type="text" value={term} onChange={e => engineSearch?.setTerm?.(e.target.value)} placeholder={t("search_by_title_or_listing_number")} className="block w-full pl-10 pr-4 py-2.5 bg-secondary-light border border-border-light text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background-primary rounded-xl transition-all text-sm font-medium" />
                  {term ? <button onClick={() => clear?.()} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary cursor-pointer">
                        <span className="text-caption font-semibold px-1.5 py-0.5 bg-secondary-light rounded-md">{t("esc")}</span>
                      </button> : null}
                </div>
              </div>

              {term ? <div className="mt-3 flex items-center justify-between bg-secondary-light rounded-xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-secondary">
                          {isListingNo && listingNoLoading ? <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{t("searching_listing_number")}</span> : isListingNo && listingNoError ? listingNoError : loadingAllPages ? <span className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{t("searching_everywhere")}</span> : <>{t("found")}<span className="font-bold">{filteredListings.length}</span>{t("result")}{filteredListings.length !== 1 ? 's' : ''}
                                {isTitle ? allPagesLoaded ? ' in all pages' : ' on this page' : ''}
                              </>}
                        </p>
                      </div>
                    </div>

                    {isTitle && !allPagesLoaded && !loadingAllPages ? <button onClick={() => loadAllPages?.()} className="text-caption font-semibold text-text-secondary hover:text-text-primary bg-background-primary px-2.5 py-1.5 rounded-lg border border-border-light hover:border-border-DEFAULT transition-all">{t("search_all_pages")}</button> : null}
                  </div> : null}
            </div>
          </div>
        </div>

        {typeof children === 'function' ? children({
      searchTerm: term,
      searchMode: mode,
      filteredListings
    }) : children}
      </>;
};
export default ListingsNavigation;