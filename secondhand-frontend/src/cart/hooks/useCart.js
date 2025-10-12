import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cartService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

export const useCart = (options = {}) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    
    const isEnabled = options.enabled ?? true;
    const loadCartItems = options.loadCartItems ?? isEnabled;

        const {
        data: cartItems = [],
        isLoading: isLoadingItems,
        error: itemsError,
        refetch: refetchItems
    } = useQuery({
        queryKey: ['cartItems', user?.id],
        queryFn: () => cartService.getCartItems(),
        enabled: !!user && loadCartItems,
        staleTime: 15 * 60 * 1000, // 15 minutes - cart doesn't change often
        cacheTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
        retry: 1,
    });

    // Calculate cart count from cart items
    const cartCount = loadCartItems && Array.isArray(cartItems) ? 
        cartItems.reduce((total, item) => total + (item.quantity || 1), 0) : 
        0; // Default to 0 instead of localStorage to avoid stale data
    
    // Update localStorage and dispatch event when cart count changes
    useEffect(() => {
        if (cartItems !== undefined) { // Only when data is loaded
            localStorage.setItem('cartCount', cartCount.toString());
            window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: cartCount }));
        }
    }, [cartCount, cartItems]);

        const addToCartMutation = useMutation({
        mutationFn: ({ listingId, quantity, notes }) => 
            cartService.addToCart(listingId, quantity, notes),
        onSuccess: (data, variables) => {
            // Invalidate cart items to refresh the count
            queryClient.invalidateQueries(['cartItems']);
            // Also update localStorage immediately for instant UI feedback
            const currentCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
            const newCount = currentCount + (variables.quantity || 1);
            localStorage.setItem('cartCount', newCount.toString());
            window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: newCount }));
        },
        onError: (error) => {
            console.error('Failed to add to cart:', error);
        }
    });

        const updateCartItemMutation = useMutation({
        mutationFn: ({ listingId, quantity, notes }) => 
            cartService.updateCartItem(listingId, quantity, notes),
        onSuccess: () => {
            // Only invalidate cart items - count is calculated from items
            queryClient.invalidateQueries(['cartItems']);
        },
        onError: (error) => {
            console.error('Failed to update cart item:', error);
        }
    });

        const removeFromCartMutation = useMutation({
        mutationFn: (listingId) => cartService.removeFromCart(listingId),
        onSuccess: () => {
            // Invalidate cart items to refresh the count
            queryClient.invalidateQueries(['cartItems']);
            // Trigger immediate UI update
            window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: 'refresh' }));
        },
        onError: (error) => {
            console.error('Failed to remove from cart:', error);
        }
    });

        const clearCartMutation = useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            // Invalidate cart items to refresh the count
            queryClient.invalidateQueries(['cartItems']);
            // Clear localStorage and trigger immediate UI update
            localStorage.setItem('cartCount', '0');
            window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: 0 }));
        },
        onError: (error) => {
            console.error('Failed to clear cart:', error);
        }
    });

        const checkInCartMutation = useMutation({
        mutationFn: (listingId) => cartService.isInCart(listingId),
        onError: (error) => {
            console.error('Failed to check cart status:', error);
        }
    });

        const addToCart = (listingId, quantity = 1, notes = '') => {
        addToCartMutation.mutate({ listingId, quantity, notes });
    };

    const updateCartItem = (listingId, quantity, notes = '') => {
        updateCartItemMutation.mutate({ listingId, quantity, notes });
    };

    const removeFromCart = (listingId) => {
        removeFromCartMutation.mutate(listingId);
    };

    const clearCart = async () => {
        await clearCartMutation.mutateAsync();
    };

    const checkInCart = (listingId) => {
        return checkInCartMutation.mutateAsync(listingId);
    };

    return {
                cartItems,
        cartCount, // Now calculated from cartItems
        
                isLoading: isLoadingItems,
        isLoadingItems,
        isLoadingCount: isLoadingItems, // Same as items loading since count is calculated
        
                error: itemsError,
        
                addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        checkInCart,
        
                isAddingToCart: addToCartMutation.isPending,
        isUpdatingCart: updateCartItemMutation.isPending,
        isRemovingFromCart: removeFromCartMutation.isPending,
        isClearingCart: clearCartMutation.isPending,
        isCheckingCart: checkInCartMutation.isPending,
        
                refetchItems,
        refetchCount: refetchItems, // Same as refetchItems since count is calculated
        
                addToCartError: addToCartMutation.error,
        updateCartError: updateCartItemMutation.error,
        removeFromCartError: removeFromCartMutation.error,
        clearCartError: clearCartMutation.error,
    };
};
