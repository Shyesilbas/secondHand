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

    const syncCartCount = (nextCount) => {
        const safeCount = Math.max(0, Number(nextCount) || 0);
        localStorage.setItem('cartCount', safeCount.toString());
        window.dispatchEvent(new CustomEvent('cartCountChanged', { detail: safeCount }));
    };

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
            syncCartCount(cartCount);
        }
    }, [cartCount, cartItems, isLoadingItems, loadCartItems]);

    const invalidateCart = () => {
        queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    };

    const getStoredCartCount = () => {
        const raw = Number(localStorage.getItem('cartCount'));
        return Number.isFinite(raw) && raw >= 0 ? raw : 0;
    };

    const addToCartMutation = useMutation({
        mutationFn: ({ listingId, quantity, notes }) => cartService.addToCart(listingId, quantity, notes),
        onSuccess: (_data, variables) => {
            invalidateCart();
            const qty = Number(variables?.quantity) || 1;
            syncCartCount(getStoredCartCount() + qty);
            showSuccess(null, 'Added to cart successfully.', { toast: true });
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: (listingId) => cartService.removeFromCart(listingId),
        onSuccess: (_data, listingId) => {
            invalidateCart();
            const currentItems = queryClient.getQueryData(['cartItems', user?.id]);
            const normalizedItems = Array.isArray(currentItems)
                ? currentItems
                : Array.isArray(currentItems?.content) ? currentItems.content : [];
            const removedItem = normalizedItems.find((item) => String(item?.listing?.id) === String(listingId));
            const removedQty = Number(removedItem?.quantity) || 1;
            syncCartCount(getStoredCartCount() - removedQty);
        },
    });

    const updateCartItemMutation = useMutation({
        mutationFn: ({ listingId, quantity, notes }) => cartService.updateCartItem(listingId, quantity, notes),
        onSuccess: (_data, variables) => {
            invalidateCart();
            const currentItems = queryClient.getQueryData(['cartItems', user?.id]);
            const normalizedItems = Array.isArray(currentItems)
                ? currentItems
                : Array.isArray(currentItems?.content) ? currentItems.content : [];
            const targetItem = normalizedItems.find((item) => String(item?.listing?.id) === String(variables?.listingId));
            const previousQty = Number(targetItem?.quantity) || 0;
            const nextQty = Number(variables?.quantity) || 0;
            syncCartCount(getStoredCartCount() - previousQty + nextQty);
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            invalidateCart();
            syncCartCount(0);
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