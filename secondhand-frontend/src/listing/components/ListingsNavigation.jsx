import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from 'lucide-react';
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
    const clear = engineSearch?.clear;
    return <>
        <div className="bg-gradient-to-b from-background-primary via-background-primary/70 to-background-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onToggleFilterSidebar} className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded border border-border bg-background-primary px-3 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-card-border-hover hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
                            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                            {t("filters", "Filtreler")}
                            {hasActiveFilters ? <span className="h-2 w-2 rounded-full bg-primary" aria-hidden /> : null}
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">{title}</h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs sm:text-sm font-medium text-text-secondary">
                                    {getListingTypeLabel(selectedCategory || filters?.listingType) || t('all_categories', 'Tüm Kategoriler')}
                                </span>
                                <span className="text-border-DEFAULT">·</span>
                                <span className="text-text-muted text-xs sm:text-sm">{totalElements?.toLocaleString()} {t("results")}</span>
                            </div>
                        </div>
                    </div>
                    {extraActions ? <div className="flex items-center">{extraActions}</div> : null}
                </div>

                {topSlot ? <div className="mt-3">{topSlot}</div> : null}

                <div className="mt-3">
                    <div className="relative max-w-2xl">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-text-muted group-focus-within:text-text-secondary transition-colors" />
                            </div>
                            <input type="text" value={term} onChange={e => engineSearch?.setTerm?.(e.target.value)} placeholder={t("search_by_title_or_listing_number")} className="block w-full pl-10 pr-4 py-2 bg-secondary-light border border-border-light text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background-primary rounded transition-all text-sm font-medium" />
                            {term ? <button onClick={() => clear?.()} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary cursor-pointer">
                                <span className="text-xs font-semibold px-1.5 py-0.5 bg-secondary-light rounded-md">{t("esc")}</span>
                            </button> : null}
                        </div>
                    </div>

                    {term ? <p className="mt-2 text-sm text-text-secondary" role="status" aria-live="polite">
                        {isListingNo && listingNoLoading ? t("searching_listing_number") : isListingNo && listingNoError ? <span className="text-status-error-text">{listingNoError}</span> : <>{t("found")} <span className="font-medium tabular-nums text-text-primary">{filteredListings.length}</span> {t("results")}{isTitle ? t("in_all_pages", " in all pages") : ''}</>}
                    </p> : null}
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