import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'comparison_items';
const MAX_ITEMS = 4;

const ComparisonContext = createContext();

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};

const loadFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return {
                    items: parsed,
                    category: parsed[0]?.type || null
                };
            }
        }
    } catch (error) {
        console.error('Failed to load comparison items from storage:', error);
    }
    return { items: [], category: null };
};

const saveToStorage = (items) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Failed to save comparison items to storage:', error);
    }
};

export const ComparisonProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [category, setCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const { items: storedItems, category: storedCategory } = loadFromStorage();
        setItems(storedItems);
        setCategory(storedCategory);
    }, []);

    useEffect(() => {
        saveToStorage(items);
    }, [items]);

    const addToComparison = useCallback((listing) => {
        if (!listing || !listing.id) return { success: false, error: 'invalid_listing' };

        const listingCategory = listing.type;

        if (category && category !== listingCategory) {
            return { success: false, error: 'category_mismatch', currentCategory: category };
        }

        if (items.some(item => item.id === listing.id)) {
            return { success: false, error: 'already_added' };
        }

        if (items.length >= MAX_ITEMS) {
            return { success: false, error: 'limit_reached', limit: MAX_ITEMS };
        }

        const comparisonItem = {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            campaignPrice: listing.campaignPrice,
            currency: listing.currency,
            imageUrl: listing.imageUrl,
            type: listing.type,
            ...listing
        };

        setItems(prev => [...prev, comparisonItem]);
        if (!category) {
            setCategory(listingCategory);
        }

        return { success: true };
    }, [items, category]);

    const removeFromComparison = useCallback((listingId) => {
        setItems(prev => {
            const newItems = prev.filter(item => item.id !== listingId);
            if (newItems.length === 0) {
                setCategory(null);
            }
            return newItems;
        });
    }, []);

    const clearComparison = useCallback(() => {
        setItems([]);
        setCategory(null);
    }, []);

    const isInComparison = useCallback((listingId) => {
        return items.some(item => item.id === listingId);
    }, [items]);

    const canAddToComparison = useCallback((listing) => {
        if (!listing || !listing.id) return false;
        if (items.length >= MAX_ITEMS) return false;
        if (items.some(item => item.id === listing.id)) return false;
        if (category && category !== listing.type) return false;
        return true;
    }, [items, category]);

    const openModal = useCallback(() => {
        if (items.length >= 2) {
            setIsModalOpen(true);
        }
    }, [items.length]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const value = {
        items,
        category,
        itemCount: items.length,
        maxItems: MAX_ITEMS,
        isModalOpen,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        canAddToComparison,
        openModal,
        closeModal
    };

    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    );
};

