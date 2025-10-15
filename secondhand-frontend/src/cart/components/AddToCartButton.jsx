import React from 'react';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const AddToCartButton = ({
                             listing,
                             size = 'sm',
                             showText = false,
                             className = ''
                         }) => {
    const { user } = useAuth();
    const { addToCart, isAddingToCart, cartItems } = useCart({ loadCartItems: true });
    
    // Check if item is in cart from cartItems array (no API call needed!)
    const isInCart = Array.isArray(cartItems) && cartItems.some(item => item.listing?.id === listing?.id);

    const canAddToCart = () => {
        if (!user) return false;
        if (!listing) return false;
        if (String(listing.seller?.id || listing.sellerId) === String(user.id)) return false;
        if (listing.type === 'VEHICLE') return false;
        if (listing.type === 'REAL_ESTATE') return false;
        if (listing.status !== 'ACTIVE') return false;
        return true;
    };

    const handleAddToCart = async () => {
        if (!canAddToCart() || isInCart) return;
        try {
            await addToCart(listing.id, 1, '');
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    if (!canAddToCart()) {
        return null;
    }

    const sizeClasses = {
        xs: 'p-1.5',
        sm: 'p-2',
        md: 'p-3',
        lg: 'p-4'
    };

    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const textSizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isInCart}
            className={`
                ${sizeClasses[size]}
                ${isInCart
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }
                rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center space-x-2 ${className}
            `}
            title={isInCart ? 'Added to cart' : 'Add to cart'}
        >
            {isAddingToCart ? (
                <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent`} />
            ) : isInCart ? (
                <CheckIcon className={iconSizes[size]} />
            ) : (
                <ShoppingCartIcon className={iconSizes[size]} />
            )}

            {showText && (
                <span className={`${textSizes[size]} font-medium`}>
                    {isInCart ? 'Added' : 'Add to Cart'}
                </span>
            )}
        </button>
    );
};

export default AddToCartButton;
