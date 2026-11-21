import { useTranslation } from "react-i18next";
import EmptyState from '../ui/EmptyState.jsx';
import { formatCurrency } from '../../formatters.js';
import { Search as MagnifyingGlassIcon, ArrowRight, Compass, Inbox, PlusSquare, Sparkles, User, ChevronRight } from 'lucide-react';
const SearchResults = ({
 results,
 activeTab,
 selectedIndex,
 isLoading,
 query = "",
 onResultSelect
}) => {
 const {
 t
 } = useTranslation();
 const renderQuickLinks = () => {
 const quickLinks = [{
 label: 'Explore Categories',
 desc: 'Browse all vehicles, estates, and electronics',
 id: '/listings/prefilter',
 icon: Compass
 }, {
 label: 'Start Selling',
 desc: 'Post a new item to the community',
 id: '/listings/prefilter?flow=create',
 icon: PlusSquare
 }, {
 label: 'Account Hub & Settings',
 desc: 'Manage your profile and orders',
 id: '/dashboard',
 icon: User
 }, {
 label: 'Aura AI Assistant',
 desc: 'Chat with our intelligent price expert',
 id: '/aura',
 icon: Sparkles
 }, {
 label: 'Inbox & Messaging',
 desc: 'Check your messages and notifications',
 id: '/inbox',
 icon: Inbox
 }];
 return <div className="py-1">
 <div className="px-4 py-2 border-b border-border-light bg-background-secondary">
 <span className="text-xs font-semibold text-text-muted">{t("quick_navigation")}</span>
 </div>
 {quickLinks.map((link, index) => {
 const Icon = link.icon;
 const isSelected = index === selectedIndex;
 return <div key={link.id} onClick={() => onResultSelect({
 id: link.id,
 type: 'link'
 })} className={`w-full flex items-center gap-3.5 px-4 py-3 text-left cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-background-tertiary' : 'hover:bg-background-secondary'}`}>
 <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-background-primary text-text-primary' : 'bg-background-tertiary text-text-tertiary'}`}>
 <Icon className="w-4 h-4" strokeWidth={1.5} aria-hidden />
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-sm font-semibold truncate text-text-primary">
 {link.label}
 </div>
 <div className={`text-xs truncate mt-0.5 text-text-tertiary`}>
 {link.desc}
 </div>
 </div>
 {isSelected && <div className="shrink-0 animate-fade-in">
 <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 </div>}
 </div>;
 })}
 {/* Footer */}
 <div className="px-4 py-2.5 text-xs text-text-muted font-medium bg-background-secondary border-t border-border-light flex items-center justify-between">
 <div>{t("navigate_enter_open_esc_close")}</div>
 <div className="hidden sm:block">{t("ctrl_tab_switch_mode")}</div>
 </div>
 </div>;
 };
 const renderUserResult = (user, index) => <div key={user.id} onClick={() => onResultSelect(user)} className={`px-4 py-3 cursor-pointer border-b border-border-light last:border-b-0 hover:bg-background-secondary ${index === selectedIndex ? 'bg-background-tertiary' : ''}`}>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-white font-semibold text-sm">
 {user.name?.charAt(0)?.toUpperCase() || 'U'}
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-medium text-text-primary text-sm">
 {user.name} {user.surname}
 </div>
 {user.accountCreationDate && <div className="text-xs text-text-muted truncate">
 {t('member_since_year', { year: String(user.accountCreationDate).split('/').pop() })}
 </div>}
 </div>
 </div>
 </div>;
 const renderListingResult = (listing, index) => <div key={listing.id} onClick={() => onResultSelect(listing)} className={`px-4 py-3 cursor-pointer border-b border-border-light last:border-b-0 hover:bg-background-secondary ${index === selectedIndex ? 'bg-background-tertiary' : ''}`}>
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-background-tertiary rounded overflow-hidden flex-shrink-0">
 {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center">
 <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>}
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-medium text-text-primary truncate text-sm">
 {listing.title}
 </div>
 <div className="text-xs text-text-muted mt-1">
 #{listing.listingNo}
 </div>
 {listing.price && <div className="text-sm font-semibold text-primary mt-1">
 {formatCurrency(listing.price, listing.currency)}
 </div>}
 </div>
 </div>
 </div>;

 const renderPageResult = (page, index) => <div key={`page-${page.key}`} onClick={() => onResultSelect(page)} className={`px-4 py-3 cursor-pointer border-b border-border-light last:border-b-0 hover:bg-background-secondary flex items-center gap-3 ${index === selectedIndex ? 'bg-background-tertiary' : ''}`}>
 <div className="w-8 h-8 rounded bg-background-tertiary text-text-muted flex items-center justify-center shrink-0">
 <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
 </div>
 <div className="flex-1 min-w-0 text-sm font-medium text-text-primary truncate">
 {t(page.labelKey)}
 </div>
 </div>;

 // If query is empty or too short, render Quick Links
 if (query.trim().length < 2) {
 return renderQuickLinks();
 }
 // Page hits are typed as links; the rest are listings or users, rendered for the active tab.
 const pageHits = results.filter(result => result.type === 'link');
 const itemResults = results.filter(result => result.type !== 'link');
 if (results.length > 0) {
 return <>
 {pageHits.length > 0 && <>
 <div className="px-4 py-2 bg-background-secondary border-b border-border-light">
 <div className="text-sm font-medium text-text-secondary">{t("search_pages", "Sayfalar")}</div>
 </div>
 {results.map((result, index) => result.type === 'link' ? renderPageResult(result, index) : null)}
 </>}

 {itemResults.length > 0 && <>
 {/* Tab Header */}
 <div className="px-4 py-2 bg-background-secondary border-b border-border-light flex items-center justify-between">
 <div className="text-sm font-medium text-text-secondary capitalize">
 {activeTab} {t("results")}</div>
 <div className="text-xs text-text-muted">
 {itemResults.length} {t("found")}</div>
 </div>

 {/* Results */}
 {results.map((result, index) => result.type === 'link' ? null : activeTab === 'users' ? renderUserResult(result, index) : renderListingResult(result, index))}
 </>}

 {/* Footer */}
 <div className="px-4 py-2 text-xs text-text-muted bg-background-secondary border-t border-border-light flex items-center justify-between">
 <div>{t("navigate_enter_select_esc_close")}</div>
 <div>{t("ctrl_tab_switch")}</div>
 </div>
 </>;
 }
 if (query.trim().length >= 2 && !isLoading) {
 return <div className="p-4">
 <EmptyState icon={MagnifyingGlassIcon} title={`No ${activeTab} found`} description="Try different keywords" size="compact" className="border-0 shadow-none bg-transparent" />
 </div>;
 }
 return null;
};
export default SearchResults;