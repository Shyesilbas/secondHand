package com.serhat.secondhand.cart.service;

import com.serhat.secondhand.cart.dto.AddToCartRequest;
import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.dto.UpdateCartItemRequest;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.mapper.CartMapper;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    private final UserService userService;
    private final ListingService listingService;

    /**
     * Get all items in user's cart
     */
    @Transactional(readOnly = true)
    public List<CartDto> getCartItems(User user) {
        log.info("Getting cart items for user: {}", user.getEmail());
        List<Cart> cartItems = cartRepository.findByUserWithListing(user);
        return cartMapper.toDtoList(cartItems);
    }


    public CartDto addToCart(User user, AddToCartRequest request) {
        log.info("Adding item to cart for user: {} - listingId: {}, quantity: {}", 
                user.getEmail(), request.getListingId(), request.getQuantity());

        Listing listing = listingService.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + request.getListingId()));

        if (!listing.getStatus().name().equals("ACTIVE")) {
            throw new RuntimeException("Listing status must be active to add to card");
        }
        if(listing.getListingType().equals(ListingType.VEHICLE) || listing.getListingType().equals(ListingType.REAL_ESTATE)) {
            throw new RuntimeException("This Listing type is not allowed to add to card");
        }

        Cart existingCartItem = cartRepository.findByUserAndListing(user, listing).orElse(null);
        
        if (existingCartItem != null) {
            existingCartItem.setQuantity(existingCartItem.getQuantity() + request.getQuantity());
            existingCartItem.setNotes(request.getNotes());
            Cart updatedCartItem = cartRepository.save(existingCartItem);
            log.info("Updated existing cart item for user: {} - new quantity: {}", 
                    user.getEmail(), updatedCartItem.getQuantity());
            return cartMapper.toDto(updatedCartItem);
        } else {
            Cart newCartItem = Cart.builder()
                    .user(user)
                    .listing(listing)
                    .quantity(request.getQuantity())
                    .notes(request.getNotes())
                    .build();
            
            Cart savedCartItem = cartRepository.save(newCartItem);
            log.info("Added new item to cart for user: {} - listingId: {}, quantity: {}", 
                    user.getEmail(), request.getListingId(), request.getQuantity());
            return cartMapper.toDto(savedCartItem);
        }
    }

    /**
     * Update cart item quantity and notes
     */
    public CartDto updateCartItem(User user, UUID listingId, UpdateCartItemRequest request) {
        log.info("Updating cart item for user: {} - listingId: {}", user.getEmail(), listingId);

        Listing listing = listingService.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + listingId));

        Cart cartItem = cartRepository.findByUserAndListing(user, listing)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cartItem.setQuantity(request.getQuantity());
        cartItem.setNotes(request.getNotes());
        
        Cart updatedCartItem = cartRepository.save(cartItem);
        log.info("Updated cart item for user: {} - new quantity: {}", 
                user.getEmail(), updatedCartItem.getQuantity());
        
        return cartMapper.toDto(updatedCartItem);
    }

    /**
     * Remove item from cart
     */
    public void removeFromCart(User user, UUID listingId) {
        log.info("Removing item from cart for user: {} - listingId: {}", user.getEmail(), listingId);

        Listing listing = listingService.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + listingId));

        if (!cartRepository.existsByUserAndListing(user, listing)) {
            throw new RuntimeException("Item not found in cart");
        }

        cartRepository.deleteByUserAndListing(user, listing);
        log.info("Removed item from cart for user: {} - listingId: {}", user.getEmail(), listingId);
    }

    /**
     * Clear entire cart
     */
    public void clearCart(User user) {
        log.info("Clearing cart for user: {}", user.getEmail());
        cartRepository.deleteByUser(user);
        log.info("Cleared cart for user: {}", user.getEmail());
    }

    /**
     * Get cart item count
     */
    @Transactional(readOnly = true)
    public long getCartItemCount(User user) {
        return cartRepository.countByUser(user);
    }

    /**
     * Check if listing is in user's cart
     */
    @Transactional(readOnly = true)
    public boolean isInCart(User user, UUID listingId) {
        Listing listing = listingService.findById(listingId).orElse(null);
        if (listing == null) {
            return false;
        }
        return cartRepository.existsByUserAndListing(user, listing);
    }
}
