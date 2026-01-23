package com.serhat.secondhand.cart.service;

import com.serhat.secondhand.cart.config.CartConfig;
import com.serhat.secondhand.cart.dto.AddToCartRequest;
import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.dto.UpdateCartItemRequest;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.mapper.CartMapper;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.cart.util.CartErrorCodes;
import com.serhat.secondhand.cart.validator.CartValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.enrich.ListingEnrichmentService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final ListingRepository listingRepository;
    private final CartConfig cartConfig;

    @Transactional(readOnly = true)
    public Result<List<CartDto>> getCartItems(User user) {
        log.info("Getting cart items for user: {}", user.getEmail());
        List<Cart> cartItems = cartRepository.findByUserWithListing(user);
        List<CartDto> cartDtos = cartMapper.toDtoList(cartItems);

        for (CartDto cartDto : cartDtos) {
            if (cartDto.getListing() != null) {
                cartDto.setListing(enrichmentService.enrich(cartDto.getListing(), user.getEmail()));
            }
        }

        return Result.success(cartDtos);
    }

    public Result<CartDto> addToCart(User user, AddToCartRequest request) {
        Listing listing = listingService.findById(request.getListingId())
                .orElse(null);
        
        if (listing == null) {
            return Result.error(CartErrorCodes.LISTING_NOT_FOUND);
        }

        Result<Void> existsResult = cartValidator.validateListingExists(listing);
        if (existsResult.isError()) {
            return Result.error(existsResult.getMessage(), existsResult.getErrorCode());
        }
        
        Result<Void> activeResult = cartValidator.validateListingActive(listing);
        if (activeResult.isError()) {
            return Result.error(activeResult.getMessage(), activeResult.getErrorCode());
        }
        
        Result<Void> typeResult = cartValidator.validateListingType(listing);
        if (typeResult.isError()) {
            return Result.error(typeResult.getMessage(), typeResult.getErrorCode());
        }

        int reqQty = Optional.ofNullable(request.getQuantity()).orElse(0);
        Result<Void> quantityResult = cartValidator.validateQuantity(reqQty);
        if (quantityResult.isError()) {
            return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
        }

        Optional<Cart> existingCartItemOpt = cartRepository.findByUserAndListing(user, listing);

        Cart cartItem;
        int totalQty;
        if (existingCartItemOpt.isPresent()) {
            cartItem = existingCartItemOpt.get();
            totalQty = (cartItem.getQuantity() != null ? cartItem.getQuantity() : 0) + reqQty;
        } else {
            totalQty = reqQty;
            cartItem = Cart.builder()
                    .user(user)
                    .listing(listing)
                    .quantity(reqQty)
                    .notes(request.getNotes())
                    .build();
        }

        if (cartConfig.getReservation().isEnabled()) {
            Result<Void> reserveResult = reserveStockForCart(listing, totalQty, existingCartItemOpt.map(Cart::getQuantity).orElse(0));
            if (reserveResult.isError()) {
                return Result.error(reserveResult.getMessage(), reserveResult.getErrorCode());
            }
            cartItem.setReservedAt(LocalDateTime.now());
        } else {
            Result<Void> stockResult = cartValidator.validateStock(totalQty, listing.getQuantity());
            if (stockResult.isError()) {
                return Result.error(stockResult.getMessage(), stockResult.getErrorCode());
            }
        }

        if (existingCartItemOpt.isPresent()) {
            cartItem.setQuantity(totalQty);
            cartItem.setNotes(request.getNotes());
        }

        Cart savedCart = cartRepository.save(cartItem);
        CartDto dto = cartMapper.toDto(savedCart);
        dto.setListing(enrichmentService.enrich(dto.getListing(), user.getEmail()));
        return Result.success(dto);
    }

    private Result<Void> reserveStockForCart(Listing listing, int requestedQty, int previousQty) {
        Listing lockedListing = listingRepository.findByIdWithLock(listing.getId())
                .orElse(null);
        
        if (lockedListing == null) {
            return Result.error(ListingErrorCodes.LISTING_NOT_FOUND);
        }

        if (lockedListing.getQuantity() == null) {
            return Result.success();
        }

        int qtyDifference = requestedQty - previousQty;
        if (qtyDifference <= 0) {
            return Result.success();
        }

        int availableStock = lockedListing.getQuantity() - getReservedQuantityForListing(lockedListing.getId());
        
        if (availableStock < qtyDifference) {
            return Result.error(ListingErrorCodes.STOCK_INSUFFICIENT);
        }
        
        return Result.success();
    }

    private int getReservedQuantityForListing(UUID listingId) {
        LocalDateTime expirationTime = LocalDateTime.now().minus(cartConfig.getReservation().getTimeoutMinutes());
        return cartRepository.countReservedQuantityByListing(listingId, expirationTime);
    }

    public Result<CartDto> updateCartItem(User user, UUID listingId, UpdateCartItemRequest request) {
        Listing listing = listingService.findById(listingId)
                .orElse(null);
        
        if (listing == null) {
            return Result.error(CartErrorCodes.LISTING_NOT_FOUND);
        }

        Cart cartItem = cartRepository.findByUserAndListing(user, listing)
                .orElse(null);
        
        if (cartItem == null) {
            return Result.error(CartErrorCodes.ITEM_NOT_FOUND_IN_CART);
        }

        int reqQty = Optional.ofNullable(request.getQuantity()).orElse(0);
        Result<Void> quantityResult = cartValidator.validateQuantity(reqQty);
        if (quantityResult.isError()) {
            return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
        }

        int previousQty = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;

        if (cartConfig.getReservation().isEnabled()) {
            Result<Void> reserveResult = reserveStockForCart(listing, reqQty, previousQty);
            if (reserveResult.isError()) {
                return Result.error(reserveResult.getMessage(), reserveResult.getErrorCode());
            }
            cartItem.setReservedAt(LocalDateTime.now());
        } else {
            Result<Void> stockResult = cartValidator.validateStock(reqQty, listing.getQuantity());
            if (stockResult.isError()) {
                return Result.error(stockResult.getMessage(), stockResult.getErrorCode());
            }
        }

        cartItem.setQuantity(reqQty);
        cartItem.setNotes(request.getNotes());

        Cart updatedCart = cartRepository.save(cartItem);
        CartDto dto = cartMapper.toDto(updatedCart);
        dto.setListing(enrichmentService.enrich(dto.getListing(), user.getEmail()));
        return Result.success(dto);
    }

    public Result<Void> removeFromCart(User user, UUID listingId) {
        Listing listing = listingService.findById(listingId)
                .orElse(null);
        
        if (listing == null) {
            return Result.error(CartErrorCodes.LISTING_NOT_FOUND);
        }

        if (!cartRepository.existsByUserAndListing(user, listing)) {
            return Result.error(CartErrorCodes.ITEM_NOT_FOUND_IN_CART);
        }

        cartRepository.deleteByUserAndListing(user, listing);
        log.info("Removed item from cart for user: {} - listingId: {}", user.getEmail(), listingId);
        return Result.success();
    }

    public Result<Void> clearCart(User user) {
        cartRepository.deleteByUser(user);
        log.info("Cleared cart for user: {}", user.getEmail());
        return Result.success();
    }

    @Transactional(readOnly = true)
    public Result<Long> getCartItemCount(User user) {
        return Result.success(cartRepository.countByUser(user));
    }

    @Transactional(readOnly = true)
    public Result<Boolean> isInCart(User user, UUID listingId) {
        Listing listing = listingService.findById(listingId)
                .orElse(null);
        
        if (listing == null) {
            return Result.error(CartErrorCodes.LISTING_NOT_FOUND);
        }
        
        return Result.success(cartRepository.existsByUserAndListing(user, listing));
    }
}
