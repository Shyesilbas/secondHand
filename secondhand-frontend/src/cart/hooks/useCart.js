import {useEffect} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {cartService} from '../services/cartService.js';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {useNotification} from '../../notification/NotificationContext.jsx';

export const useCart = (options = {}) => {
    const { user } = useAuthState();
    const queryClient = useQueryClient();
    const { showSuccess } = useNotification();

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
        select: (res) => {
            if (Array.isArray(res)) return res;
            if (Array.isArray(res?.content)) return res.content;
            return [];
        },
        enabled: !!user && loadCartItems,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });

    const cartCount = Array.isArray(cartItems) ?
        cartItems.reduce((total, item) => total + (item.quantity || 1), 0) : 0;

    useEffect(() => {
        if (loadCartItems && !isLoadingItems) {
            localStorage.setItem('cartCount', cartCount.toString());
            window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: cartCount }));
        }
    }, [cartCount, cartItems, isLoadingItems, loadCartItems]);

    const addToCartMutation = useMutation({
        mutationFn: ({ listingId, quantity, notes }) => cartService.addToCart(listingId, quantity, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
            queryClient.invalidateQueries({ queryKey: ['badgeCounts'] });
            showSuccess(null, 'Added to cart successfully.', { toast: true });
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: (listingId) => cartService.removeFromCart(listingId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cartItems'] }),
    });

    const updateCartItemMutation = useMutation({
        mutationFn: ({ listingId, quantity, notes }) => cartService.updateCartItem(listingId, quantity, notes),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cartItems'] }),
    });

    const clearCartMutation = useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
            localStorage.setItem('cartCount', '0');
        },
    });

    return {
        cartItems,
        cartCount,
        isLoading: isLoadingItems,
        error: itemsError,
        addToCart: (listingId, quantity = 1, notes = '') => addToCartMutation.mutate({ listingId, quantity, notes }),
        updateCartItem: (listingId, quantity, notes = '') => updateCartItemMutation.mutate({ listingId, quantity, notes }),
        removeFromCart: (listingId) => removeFromCartMutation.mutate(listingId),
        clearCart: () => clearCartMutation.mutate(),
        refetchItems,
        isAdding: addToCartMutation.isPending,
        isUpdating: updateCartItemMutation.isPending,
        isRemoving: removeFromCartMutation.isPending,
    };
};