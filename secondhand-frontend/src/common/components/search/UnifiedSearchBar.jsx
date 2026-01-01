import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../../../user/services/userSearchService.js';
import { listingService } from '../../../listing/services/listingService.js';
import { ROUTES } from '../../constants/routes.js';
import SearchResults from './SearchResults.jsx';

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

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={`Search ${activeTab}...`}
                    className="w-full h-11 px-10 pr-20 text-sm bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all placeholder:text-gray-400 text-gray-900"
                />
                
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {isLoading ? (
                        <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <div className="flex items-center bg-transparent">
                        <button
                            onClick={() => handleTabChange('listings')}
                            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                activeTab === 'listings' 
                                    ? 'text-gray-900 bg-gray-200' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            type="button"
                        >
                            Listings
                        </button>
                        <span className="text-gray-300">/</span>
                        <button
                            onClick={() => handleTabChange('users')}
                            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                                activeTab === 'users' 
                                    ? 'text-gray-900 bg-gray-200' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            type="button"
                        >
                            Users
                        </button>
                    </div>
                </div>
            </div>

            {isVisible && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <SearchResults
                        results={results}
                        activeTab={activeTab}
                        selectedIndex={selectedIndex}
                        isLoading={isLoading}
                        query={query}
                        onResultSelect={handleResultSelect}
                    />
                </div>
            )}
        </div>
    );
};

export default UnifiedSearchBar;
