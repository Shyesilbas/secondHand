import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService.js';
import { ROUTES } from '../../common/constants/routes.js';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const GlobalListingSearchBar = ({ className = "" }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const cacheRef = useRef(new Map()); // Simple cache

    const debounce = useCallback((func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }, []);

    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setResults([]);
            setIsVisible(false);
            return;
        }

        const trimmedQuery = searchQuery.trim().toLowerCase();
        
        // Check cache first
        if (cacheRef.current.has(trimmedQuery)) {
            const cachedResults = cacheRef.current.get(trimmedQuery);
            setResults(cachedResults);
            setIsVisible(true);
            setSelectedIndex(-1);
            return;
        }

        setIsLoading(true);
        try {
            // Use new global search API
            const response = await listingService.globalSearch(trimmedQuery, 0, 8);
            const searchResults = response.content || [];
            
            // Cache the results (max 50 entries)
            if (cacheRef.current.size >= 50) {
                const firstKey = cacheRef.current.keys().next().value;
                cacheRef.current.delete(firstKey);
            }
            cacheRef.current.set(trimmedQuery, searchResults);

            setResults(searchResults);
            setIsVisible(true);
            setSelectedIndex(-1);
        } catch (error) {
            console.error('Listing search error:', error);
            setResults([]);
            setIsVisible(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedSearch = useCallback(
        debounce(performSearch, 500), // 500ms debounce
        [performSearch, debounce]
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    const handleListingSelect = (listing) => {
        setQuery('');
        setResults([]);
        setIsVisible(false);
        navigate(`${ROUTES.LISTINGS}/${listing.id}`);
    };

    const handleKeyDown = (e) => {
        if (!isVisible || results.length === 0) return;

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
                    handleListingSelect(results[selectedIndex]);
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const handleFocus = () => {
        if (query.trim().length >= 2 && results.length > 0) {
            setIsVisible(true);
        }
    };

    const formatPrice = (price, currency) => {
        if (!price) return '';
        return `${price.toLocaleString('tr-TR')} ${currency || 'TRY'}`;
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder="Search listings..."
                    className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>

            {isVisible && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {results.length > 0 ? (
                        <>
                            {results.map((listing, index) => (
                                <div
                                    key={listing.id}
                                    onClick={() => handleListingSelect(listing)}
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
                            ))}
                            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                                Press Enter to select • ESC to close
                            </div>
                        </>
                    ) : query.trim().length >= 2 && !isLoading ? (
                        <div className="p-4">
                            <EmptyState
                                icon={MagnifyingGlassIcon}
                                title="No listings found"
                                description="Try different keywords"
                                size="compact"
                                className="border-0 shadow-none bg-transparent"
                            />
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default GlobalListingSearchBar;
