import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../../../user/services/userSearchService.js';
import { listingService } from '../../../listing/services/listingService.js';
import { ROUTES } from '../../constants/routes.js';
import { matchAppPages } from '../../constants/appPages.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { Loader2, Search } from 'lucide-react';
import SearchResults from './SearchResults.jsx';
const NO_RESULTS = [];
const UnifiedSearchBar = ({
 className = ""
}) => {
 const {
 t
 } = useTranslation();
 const [query, setQuery] = useState('');
 const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'users'
 const [isVisible, setIsVisible] = useState(false);
 const [selectedIndex, setSelectedIndex] = useState(-1);
 const searchRef = useRef(null);
 const inputRef = useRef(null);
 const navigate = useNavigate();
 const term = useDebouncedValue(query.trim().toLowerCase(), 300);
 const { data: listingOrUserResults = NO_RESULTS, isFetching: isLoading } = useQuery({
 queryKey: ['globalSearch', activeTab, term],
 queryFn: async () => activeTab === 'users' ? searchUsers(term, 8) : (await listingService.globalSearch(term, 0, 8)).content || [],
 enabled: term.length >= 2,
 staleTime: 60 * 1000
 });
 // Matching pages come first; keyboard selection and SearchResults index into this combined list.
 const pageHits = useMemo(() => matchAppPages(query).map(page => ({
 id: page.to,
 type: 'link',
 key: page.key,
 labelKey: page.labelKey
 })), [query]);
 const results = useMemo(() => [...pageHits, ...listingOrUserResults], [pageHits, listingOrUserResults]);
 const handleInputChange = e => {
 setQuery(e.target.value);
 setSelectedIndex(-1);
 setIsVisible(true);
 };
 const handleTabChange = tab => {
 setActiveTab(tab);
 setSelectedIndex(-1);
 };
 const handleResultSelect = result => {
 setQuery('');
 setIsVisible(false);
 if (result?.type === 'link') {
 navigate(result.id);
 } else if (activeTab === 'users') {
 navigate(`${ROUTES.USER_PROFILE(result.id)}`);
 } else {
 navigate(`${ROUTES.LISTINGS}/${result.id}`);
 }
 };
 const handleKeyDown = e => {
 // Tab switching with Ctrl+Tab or Ctrl+Shift+Tab
 if (e.ctrlKey && e.key === 'Tab') {
 e.preventDefault();
 setActiveTab(prev => prev === 'listings' ? 'users' : 'listings');
 return;
 }

 // Global shortcut: ⌘K or Ctrl+K to focus the visible search input
 if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 if (!inputRef.current || inputRef.current.getClientRects().length === 0) return;
 e.preventDefault();
 inputRef.current.focus();
 setIsVisible(true);
 return;
 }
 if (!isVisible || query.trim().length >= 2 && results.length === 0) {
 return;
 }
 switch (e.key) {
 case 'ArrowDown':
 e.preventDefault();
 setSelectedIndex(prev => prev < (results.length > 0 ? results.length - 1 : 4) ? prev + 1 : 0);
 break;
 case 'ArrowUp':
 e.preventDefault();
 setSelectedIndex(prev => prev > 0 ? prev - 1 : results.length > 0 ? results.length - 1 : 4);
 break;
 case 'Enter':
 e.preventDefault();
 if (query.trim().length < 2) {
 // Trigger navigation to selected quick link
 const quickLinks = [{
 route: ROUTES.LISTINGS_PREFILTER
 }, {
 route: ROUTES.LISTINGS_PREFILTER_CREATE
 }, {
 route: ROUTES.DASHBOARD
 }, {
 route: ROUTES.AURA_CHAT
 }, {
 route: ROUTES.INBOX
 }];
 const selected = quickLinks[selectedIndex];
 if (selected) {
 setQuery('');
 setIsVisible(false);
 navigate(selected.route);
 }
 } else if (selectedIndex >= 0 && results[selectedIndex]) {
 handleResultSelect(results[selectedIndex]);
 } else if (activeTab === 'listings' && document.activeElement === inputRef.current) {
 // No highlighted suggestion: show every match on the listings page.
 const q = query.trim();
 setQuery('');
 setIsVisible(false);
 inputRef.current?.blur();
 navigate(`${ROUTES.LISTINGS}?q=${encodeURIComponent(q)}`);
 }
 break;
 case 'Escape':
 setIsVisible(false);
 setSelectedIndex(-1);
 inputRef.current?.blur();
 break;
 }
 };
 // The document listener calls the latest handler through a ref, so it is registered once.
 const keyDownRef = useRef(handleKeyDown);
 useEffect(() => {
 keyDownRef.current = handleKeyDown;
 });
 useEffect(() => {
 const onMouseDown = event => {
 if (searchRef.current && !searchRef.current.contains(event.target)) {
 setIsVisible(false);
 setSelectedIndex(-1);
 }
 };
 const onKeyDown = event => keyDownRef.current(event);
 document.addEventListener('mousedown', onMouseDown);
 document.addEventListener('keydown', onKeyDown);
 return () => {
 document.removeEventListener('mousedown', onMouseDown);
 document.removeEventListener('keydown', onKeyDown);
 };
 }, []);
 const handleFocus = () => {
 setIsVisible(true);
 };
 return <div ref={searchRef} className={`relative ${className}`}>
 <div className="relative">
 <input ref={inputRef} type="text" value={query} onChange={handleInputChange} onFocus={handleFocus} placeholder={activeTab === 'users' ? t('search_users_placeholder', 'Kullanıcı ara...') : t('search_listings_placeholder', 'İlan ara...')} className="h-9 w-full rounded border border-border bg-background-primary pl-9 pr-44 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-card-border-hover focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus" />

 <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
 {isLoading
 ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden />
 : <Search className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
 </div>

 {/* Segmented scope toggle: 6px chips inside the 8px field so the inner corners never outgrow the outer one. */}
 <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
 <div className="flex items-center rounded-sm bg-background-tertiary p-0.5" role="group" aria-label={t('search_scope', 'Arama kapsamı')}>
 {[['listings', t("listings")], ['users', t("users")]].map(([tab, label]) => (
 <button
 key={tab}
 type="button"
 onClick={() => handleTabChange(tab)}
 aria-pressed={activeTab === tab}
 className={`rounded-sm px-2.5 py-0.5 text-xs font-medium transition-colors duration-150 ${activeTab === tab ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
 >
 {label}
 </button>
 ))}
 </div>
 </div>
 </div>

 {isVisible && <div className="absolute top-full left-0 right-0 z-dropdown mt-1.5 max-h-80 rounded border border-border bg-background-primary shadow-md sm:max-h-96 overflow-y-auto">
 <SearchResults results={results} activeTab={activeTab} selectedIndex={selectedIndex} isLoading={isLoading} query={query} onResultSelect={handleResultSelect} />
 </div>}
 </div>;
};
export default UnifiedSearchBar;