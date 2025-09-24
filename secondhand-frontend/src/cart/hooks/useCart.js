import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cartService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

export const useCart = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

        const {
        data: cartItems = [],
        isLoading: isLoadingItems,
        error: itemsError,
        refetch: refetchItems
    } = useQuery({
        queryKey: ['cartItems', user?.id],
        queryFn: () => cartService.getCartItems(),
        enabled: !!user,
        staleTime: 5 * 60 * 1000,     });

        const {
        data: cartCount = { count: 0 },
        isLoading: isLoadingCount,
        refetch: refetchCount
    } = useQuery({
        queryKey: ['cartCount', user?.id],
        queryFn: () => cartService.getCartItemCount(),
        enabled: !!user,
        staleTime: 2 * 60 * 1000,     });

        const addToCartMutation = useMutation({
        mutationFn: ({ listingId, quantity, notes }) => 
            cartService.addToCart(listingId, quantity, notes),
        onSuccess: () => {
            queryClient.invalidateQueries(['cartItems']);
            queryClient.invalidateQueries(['cartCount']);
        },
        onError: (error) => {
            console.error('Failed to add to cart:', error);
        }
    });

        const updateCartItemMutation = useMutation({
        mutationFn: ({ listingId, quantity, notes }) => 
            cartService.updateCartItem(listingId, quantity, notes),
        onSuccess: () => {
            queryClient.invalidateQueries(['cartItems']);
            queryClient.invalidateQueries(['cartCount']);
        },
        onError: (error) => {
            console.error('Failed to update cart item:', error);
        }
    });

        const removeFromCartMutation = useMutation({
        mutationFn: (listingId) => cartService.removeFromCart(listingId),
        onSuccess: () => {
            queryClient.invalidateQueries(['cartItems']);
            queryClient.invalidateQueries(['cartCount']);
        },
        onError: (error) => {
            console.error('Failed to remove from cart:', error);
        }
    });

        const clearCartMutation = useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            queryClient.invalidateQueries(['cartItems']);
            queryClient.invalidateQueries(['cartCount']);
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

    const clearCart = () => {
        clearCartMutation.mutate();
    };

    const checkInCart = (listingId) => {
        return checkInCartMutation.mutateAsync(listingId);
    };

    return {
                cartItems,
        cartCount: cartCount.count,
        
                isLoading: isLoadingItems || isLoadingCount,
        isLoadingItems,
        isLoadingCount,
        
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
        refetchCount,
        
                addToCartError: addToCartMutation.error,
        updateCartError: updateCartItemMutation.error,
        removeFromCartError: removeFromCartMutation.error,
        clearCartError: clearCartMutation.error,
    };
};
