import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {searchUsers} from '../services/userSearchService.js';
import UserSearchResults from './UserSearchResults.jsx';
import {ROUTES} from '../../common/constants/routes.js';
import logger from '../../common/utils/logger.js';

const UserSearchBar = ({ className = "" }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

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

        setIsLoading(true);
        try {
            const searchResults = await searchUsers(searchQuery.trim(), 8);
            setResults(searchResults);
            setIsVisible(true);
            setSelectedIndex(-1);
        } catch (error) {
            logger.error('Search error:', error);
            setResults([]);
            setIsVisible(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedSearch = useCallback(
        debounce(performSearch, 600),
        [performSearch, debounce]
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    const handleUserSelect = (user) => {
        setQuery('');
        setResults([]);
        setIsVisible(false);
        setSelectedIndex(-1);
        navigate(ROUTES.USER_PROFILE(user.id));
    };

    const handleKeyDown = (e) => {
        if (!isVisible || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : results.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleUserSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsVisible(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsVisible(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsVisible(true)}
                    placeholder="Search User..."
                    className="block w-full pl-10 pr-3 py-2 border border-sidebar-border rounded-md leading-5 bg-white text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-btn-primary focus:border-btn-primary sm:text-sm"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsVisible(false);
                            setSelectedIndex(-1);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <svg
                            className="h-4 w-4 text-text-muted hover:text-text-secondary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <UserSearchResults
                results={results}
                isLoading={isLoading}
                isVisible={isVisible}
                onUserSelect={handleUserSelect}
                selectedIndex={selectedIndex}
            />
        </div>
    );
};

export default UserSearchBar;
