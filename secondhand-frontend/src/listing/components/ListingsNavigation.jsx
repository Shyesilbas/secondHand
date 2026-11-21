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
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Title row: page title and result count on the left, page actions on the right. */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
                        <p className="mt-1 text-sm text-text-secondary">
                            {getListingTypeLabel(selectedCategory || filters?.listingType) || t('all_categories', 'Tüm Kategoriler')}
                            <span className="mx-1.5 text-text-tertiary" aria-hidden>·</span>
                            <span className="tabular-nums text-text-tertiary">{totalElements?.toLocaleString()} {t("results")}</span>
                        </p>
                    </div>
                    {extraActions ? <div className="flex flex-wrap items-center gap-2">{extraActions}</div> : null}
                </div>

                {/* Toolbar: filters and search share one row under the title. */}
                <div className="mt-6 flex items-center gap-2">
                    <button type="button" onClick={onToggleFilterSidebar} className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded border border-border bg-background-primary px-3 text-sm font-medium text-text-primary transition-colors duration-150 hover:border-card-border-hover hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
                        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                        <span className="hidden sm:inline">{t("filters", "Filtreler")}</span>
                        <span className="sr-only sm:hidden">{t("filters", "Filtreler")}</span>
                        {hasActiveFilters ? <span className="h-2 w-2 rounded-full bg-accent-teal" aria-hidden /> : null}
                    </button>
                    <div className="relative group min-w-0 flex-1 sm:max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-text-muted group-focus-within:text-text-secondary transition-colors" strokeWidth={1.5} />
                        </div>
                        <input type="text" value={term} onChange={e => engineSearch?.setTerm?.(e.target.value)} placeholder={t("search_by_title_or_listing_number")} aria-label={t("search_by_title_or_listing_number")} className="block h-10 w-full rounded border border-border bg-background-primary pl-10 pr-12 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" />
                        {term ? <button type="button" aria-label={t("clear")} onClick={() => clear?.()} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-secondary cursor-pointer">
                            <span className="rounded-sm bg-background-tertiary px-1.5 py-0.5 text-xs font-medium">{t("esc")}</span>
                        </button> : null}
                    </div>
                </div>

                {term ? <p className="mt-2 text-sm text-text-secondary" role="status" aria-live="polite">
                    {isListingNo && listingNoLoading ? t("searching_listing_number") : isListingNo && listingNoError ? <span className="text-status-error-text">{listingNoError}</span> : <>{t("found")} <span className="font-medium tabular-nums text-text-primary">{filteredListings.length}</span> {t("results")}{isTitle ? t("in_all_pages", " in all pages") : ''}</>}
                </p> : null}

                {topSlot ? <div className="mt-4">{topSlot}</div> : null}
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