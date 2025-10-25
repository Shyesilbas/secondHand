package com.serhat.secondhand.cart.service;

import com.serhat.secondhand.cart.dto.AddToCartRequest;
import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.dto.UpdateCartItemRequest;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.mapper.CartMapper;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.cart.util.CartErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.util.ListingFavoriteStatsUtil;
import com.serhat.secondhand.listing.application.util.ListingReviewStatsUtil;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final ListingFavoriteStatsUtil favoriteStatsUtil;
    private final ListingReviewStatsUtil reviewStatsUtil;

    @Transactional(readOnly = true)
    public List<CartDto> getCartItems(User user) {
        log.info("Getting cart items for user: {}", user.getEmail());
        List<Cart> cartItems = cartRepository.findByUserWithListing(user);
        List<CartDto> cartDtos = cartMapper.toDtoList(cartItems);
        
        for (CartDto cartDto : cartDtos) {
            if (cartDto.getListing() != null) {
                ListingDto listingDto = cartDto.getListing();
                favoriteStatsUtil.enrichWithFavoriteStats(listingDto, user.getEmail());
                reviewStatsUtil.enrichWithReviewStats(listingDto);
            }
        }
        
        return cartDtos;
    }

    public CartDto addToCart(User user, AddToCartRequest request) {
        Listing listing = listingService.findById(request.getListingId())
                .orElseThrow(() -> new BusinessException(CartErrorCodes.LISTING_NOT_FOUND));

        if (!listing.getStatus().equals(ListingStatus.ACTIVE)) {
            throw new BusinessException(CartErrorCodes.LISTING_NOT_ACTIVE);
        }

        if (listing.getListingType().equals(ListingType.VEHICLE) || listing.getListingType().equals(ListingType.REAL_ESTATE)) {
            throw new BusinessException(CartErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }

        Optional<Cart> existingCartItemOpt = cartRepository.findByUserAndListing(user, listing);

        if (existingCartItemOpt.isPresent()) {
            Cart existingCartItem = existingCartItemOpt.get();
            existingCartItem.setQuantity(existingCartItem.getQuantity() + request.getQuantity());
            existingCartItem.setNotes(request.getNotes());
            return cartMapper.toDto(cartRepository.save(existingCartItem));
        }

        Cart newCartItem = Cart.builder()
                .user(user)
                .listing(listing)
                .quantity(request.getQuantity())
                .notes(request.getNotes())
                .build();

        return cartMapper.toDto(cartRepository.save(newCartItem));
    }

    public CartDto updateCartItem(User user, UUID listingId, UpdateCartItemRequest request) {
        log.info("Updating cart item for user: {} - listingId: {}", user.getEmail(), listingId);

        Listing listing = listingService.findById(listingId)
                .orElseThrow(() -> new BusinessException(CartErrorCodes.LISTING_NOT_FOUND));

        Cart cartItem = cartRepository.findByUserAndListing(user, listing)
                .orElseThrow(() -> new BusinessException(CartErrorCodes.ITEM_NOT_FOUND_IN_CART));

        cartItem.setQuantity(request.getQuantity());
        cartItem.setNotes(request.getNotes());

        Cart updatedCartItem = cartRepository.save(cartItem);
        log.info("Updated cart item for user: {} - new quantity: {}", user.getEmail(), updatedCartItem.getQuantity());

        return cartMapper.toDto(updatedCartItem);
    }

    public void removeFromCart(User user, UUID listingId) {
        Listing listing = listingService.findById(listingId)
                .orElseThrow(() -> new BusinessException(CartErrorCodes.LISTING_NOT_FOUND));

        if (!isInCart(user, listingId)) {
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
        return getCartListing(user, listingId).isPresent();
    }


    @Transactional(readOnly = true)
    public Optional<Listing> getCartListing(User user, UUID listingId) {
        return listingService.findById(listingId)
                .filter(listing -> cartRepository.existsByUserAndListing(user, listing));
    }
}
