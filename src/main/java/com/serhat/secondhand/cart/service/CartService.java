package com.serhat.secondhand.cart.service;

import com.serhat.secondhand.cart.dto.AddToCartRequest;
import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.dto.UpdateCartItemRequest;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.mapper.CartMapper;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.cart.util.CartErrorCodes;
import com.serhat.secondhand.cart.validator.CartValidator;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.enrich.ListingEnrichmentService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    private final ListingService listingService;
    private final CartValidator cartValidator;
    private final ListingEnrichmentService enrichmentService;

    @Transactional(readOnly = true)
    public List<CartDto> getCartItems(User user) {
        log.info("Getting cart items for user: {}", user.getEmail());
        List<Cart> cartItems = cartRepository.findByUserWithListing(user);
        List<CartDto> cartDtos = cartMapper.toDtoList(cartItems);

        for (CartDto cartDto : cartDtos) {
            if (cartDto.getListing() != null) {
                cartDto.setListing(enrichmentService.enrich(cartDto.getListing(), user.getEmail()));
            }
        }

        return cartDtos;
    }

    public CartDto addToCart(User user, AddToCartRequest request) {
        Listing listing = listingService.findById(request.getListingId())
                .orElseThrow(() -> new BusinessException(CartErrorCodes.LISTING_NOT_FOUND));

        cartValidator.validateListingExists(listing);
        cartValidator.validateListingActive(listing);
        cartValidator.validateListingType(listing);

        int reqQty = Optional.ofNullable(request.getQuantity()).orElse(0);
        cartValidator.validateQuantity(reqQty);
        cartValidator.validateStock(reqQty, listing.getQuantity());

        Optional<Cart> existingCartItemOpt = cartRepository.findByUserAndListing(user, listing);

        Cart cartItem;
        if (existingCartItemOpt.isPresent()) {
            cartItem = existingCartItemOpt.get();
            int nextQty = (cartItem.getQuantity() != null ? cartItem.getQuantity() : 0) + reqQty;
            cartValidator.validateStock(nextQty, listing.getQuantity());
            cartItem.setQuantity(nextQty);
            cartItem.setNotes(request.getNotes());
        } else {
            cartItem = Cart.builder()
                    .user(user)
                    .listing(listing)
                    .quantity(reqQty)
                    .notes(request.getNotes())
                    .build();
        }

        Cart savedCart = cartRepository.save(cartItem);
        CartDto dto = cartMapper.toDto(savedCart);
        dto.setListing(enrichmentService.enrich(dto.getListing(), user.getEmail()));
        return dto;
    }

    public CartDto updateCartItem(User user, UUID listingId, UpdateCartItemRequest request) {
        Listing listing = listingService.findById(listingId)
                .orElseThrow(() -> new BusinessException(CartErrorCodes.LISTING_NOT_FOUND));

        Cart cartItem = cartRepository.findByUserAndListing(user, listing)
                .orElseThrow(() -> new BusinessException(CartErrorCodes.ITEM_NOT_FOUND_IN_CART));

        int reqQty = Optional.ofNullable(request.getQuantity()).orElse(0);
        cartValidator.validateQuantity(reqQty);
        cartValidator.validateStock(reqQty, listing.getQuantity());

        cartItem.setQuantity(reqQty);
        cartItem.setNotes(request.getNotes());

        Cart updatedCart = cartRepository.save(cartItem);
        CartDto dto = cartMapper.toDto(updatedCart);
        dto.setListing(enrichmentService.enrich(dto.getListing(), user.getEmail()));
        return dto;
    }

    public void removeFromCart(User user, UUID listingId) {
        Listing listing = listingService.findById(listingId)
                .orElseThrow(() -> new BusinessException(CartErrorCodes.LISTING_NOT_FOUND));

        if (!cartRepository.existsByUserAndListing(user, listing)) {
            throw new BusinessException(CartErrorCodes.ITEM_NOT_FOUND_IN_CART);
        }

        cartRepository.deleteByUserAndListing(user, listing);
        log.info("Removed item from cart for user: {} - listingId: {}", user.getEmail(), listingId);
    }

    public void clearCart(User user) {
        cartRepository.deleteByUser(user);
        log.info("Cleared cart for user: {}", user.getEmail());
    }

    @Transactional(readOnly = true)
    public long getCartItemCount(User user) {
        return cartRepository.countByUser(user);
    }

    @Transactional(readOnly = true)
    public boolean isInCart(User user, UUID listingId) {
        Listing listing = listingService.findById(listingId)
                .orElseThrow(() -> new BusinessException(CartErrorCodes.LISTING_NOT_FOUND));
        return cartRepository.existsByUserAndListing(user, listing);
    }
}
