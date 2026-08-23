import { useState, useEffect, useCallback } from 'react';

const RECENTLY_VIEWED_KEY = 'secondhand_recently_viewed';
const MAX_RECENTLY_VIEWED = 10;

/**
 * Helper to safely parse local storage JSON
 */
const getStoredListings = () => {
 try {
 const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
 return data ? JSON.parse(data) : [];
 } catch (err) {
 console.error('Error reading recently viewed listings from localStorage:', err);
 return [];
 }
};

/**
 * Custom Hook for managing Recently Viewed Listings in localStorage
 */
export const useRecentlyViewed = () => {
 const [recentlyViewed, setRecentlyViewed] = useState(getStoredListings);

 // Sync state across browser tabs/windows
 useEffect(() => {
 const handleStorageChange = (e) => {
 if (e.key === RECENTLY_VIEWED_KEY) {
 setRecentlyViewed(getStoredListings());
 }
 };

 window.addEventListener('storage', handleStorageChange);
 return () => window.removeEventListener('storage', handleStorageChange);
 }, []);

 /**
 * Adds or bumps a listing to the front of the recently viewed list
 */
 const addRecentlyViewed = useCallback((listing) => {
 if (!listing || !listing.id) return;

 // Extract minimal fields to keep localStorage lightweight
 const itemToAdd = {
 id: listing.id,
 title: listing.title || 'Untitled',
 price: listing.price,
 currency: listing.currency || 'TRY',
 city: listing.city || '',
 category: listing.category || listing.listingType || '',
 coverImage: listing.imageUrl || listing.images?.[0] || listing.coverImage || null,
 viewedAt: Date.now(),
 };

 setRecentlyViewed((prev) => {
 // Remove any existing entry with the same ID
 const filtered = prev.filter((item) => item.id !== listing.id);

 // Prepend new item and slice to MAX_RECENTLY_VIEWED (10)
 const updated = [itemToAdd, ...filtered].slice(0, MAX_RECENTLY_VIEWED);

 try {
 localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
 } catch (err) {
 console.error('Error writing recently viewed listings to localStorage:', err);
 }

 return updated;
 });
 }, []);

 /**
 * Removes a single listing from recently viewed
 */
 const removeRecentlyViewed = useCallback((id) => {
 setRecentlyViewed((prev) => {
 const updated = prev.filter((item) => item.id !== id);
 try {
 localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
 } catch (err) {
 console.error('Error removing item from recently viewed in localStorage:', err);
 }
 return updated;
 });
 }, []);

 /**
 * Clears all recently viewed listings
 */
 const clearRecentlyViewed = useCallback(() => {
 setRecentlyViewed([]);
 try {
 localStorage.removeItem(RECENTLY_VIEWED_KEY);
 } catch (err) {
 console.error('Error clearing recently viewed in localStorage:', err);
 }
 }, []);

 return {
 recentlyViewed,
 addRecentlyViewed,
 removeRecentlyViewed,
 clearRecentlyViewed,
 };
};
