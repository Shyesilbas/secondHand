import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../../../user/services/userSearchService.js';
import { listingService } from '../../../listing/services/listingService.js';
import { ROUTES } from '../../constants/routes.js';

const UnifiedSearchBar = ({ className = "" }) => {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'users'
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const cacheRef = useRef(new Map());

    const debounce = useCallback((func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }, []);

    const performSearch = useCallback(async (searchQuery, searchType) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setResults([]);
            setIsVisible(false);
            return;
        }

        const trimmedQuery = searchQuery.trim().toLowerCase();
        const cacheKey = `${searchType}-${trimmedQuery}`;
        
        // Check cache first
        if (cacheRef.current.has(cacheKey)) {
            const cachedResults = cacheRef.current.get(cacheKey);
            setResults(cachedResults);
            setIsVisible(true);
            setSelectedIndex(-1);
            return;
        }

        setIsLoading(true);
        try {
            let searchResults = [];
            
            if (searchType === 'users') {
                searchResults = await searchUsers(trimmedQuery, 8);
            } else {
                const response = await listingService.globalSearch(trimmedQuery, 0, 8);
                searchResults = response.content || [];
            }
            
            // Cache the results (max 100 entries)
            if (cacheRef.current.size >= 100) {
                const firstKey = cacheRef.current.keys().next().value;
                cacheRef.current.delete(firstKey);
            }
            cacheRef.current.set(cacheKey, searchResults);

            setResults(searchResults);
            setIsVisible(true);
            setSelectedIndex(-1);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setIsVisible(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedSearch = useCallback(
        debounce(performSearch, 500),
        [performSearch, debounce]
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value, activeTab);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedIndex(-1);
        if (query.trim().length >= 2) {
            debouncedSearch(query, tab);
        }
    };

    const handleResultSelect = (result) => {
        setQuery('');
        setResults([]);
        setIsVisible(false);
        
        if (activeTab === 'users') {
            navigate(`${ROUTES.USER_PROFILE(result.id)}`);
        } else {
            navigate(`${ROUTES.LISTINGS}/${result.id}`);
        }
    };

    const handleKeyDown = (e) => {
        // Tab switching with Ctrl+Tab or Ctrl+Shift+Tab
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
            setActiveTab(prev => prev === 'listings' ? 'users' : 'listings');
            return;
        }

        if (!isVisible || results.length === 0) {
            // Global shortcut: Ctrl+K to focus search
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < results.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev > 0 ? prev - 1 : results.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    handleResultSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsVisible(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const handleClickOutside = useCallback((event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setIsVisible(false);
            setSelectedIndex(-1);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClickOutside, isVisible, results, selectedIndex, activeTab]);

    const handleFocus = () => {
        if (query.trim().length >= 2 && results.length > 0) {
            setIsVisible(true);
        }
    };

    const formatPrice = (price, currency) => {
        if (!price) return '';
        return `${price.toLocaleString('tr-TR')} ${currency || 'TRY'}`;
    };

    const renderUserResult = (user, index) => (
        <div
            key={user.id}
            onClick={() => handleResultSelect(user)}
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
            onClick={() => handleResultSelect(listing)}
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

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                {/* Search Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={`Search ${activeTab}... (Ctrl+K)`}
                    className="w-full px-4 py-2.5 pl-12 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                />
                
                {/* Search Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>

                {/* Tab Switcher */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="flex bg-gray-100 rounded-md p-0.5">
                        <button
                            onClick={() => handleTabChange('listings')}
                            className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                                activeTab === 'listings' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Listings
                        </button>
                        <button
                            onClick={() => handleTabChange('users')}
                            className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                                activeTab === 'users' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Users
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Dropdown */}
            {isVisible && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {results.length > 0 ? (
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
                    ) : query.trim().length >= 2 && !isLoading ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33" />
                            </svg>
                            <div className="text-sm">No {activeTab} found</div>
                            <div className="text-xs text-gray-400 mt-1">Try different keywords</div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default UnifiedSearchBar;
