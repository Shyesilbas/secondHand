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
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.enrich.ListingEnrichmentService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final UserService userService;
    private final CartValidator cartValidator;
    private final ListingEnrichmentService enrichmentService;
    private final ListingRepository listingRepository;
    private final CartConfig cartConfig;

    @Transactional(readOnly = true)
    public Result<Page<CartDto>> getCartItems(Long userId, Pageable pageable) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());
        User user = userResult.getData();

        Page<Cart> cartPage = cartRepository.findByUserIdWithListing(userId, pageable);

        Page<CartDto> cartDtos = cartPage.map(cartMapper::toDto);

        List<ListingDto> listings = cartDtos.getContent().stream()
                .map(CartDto::getListing)
                .toList();

        enrichmentService.enrich(listings, userId);

        return Result.success(cartDtos);
    }

    public Result<CartDto> addToCart(Long userId, AddToCartRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());
        User user = userResult.getData();

        Listing listing = listingService.findById(request.getListingId()).orElse(null);
        if (listing == null) return Result.error(CartErrorCodes.LISTING_NOT_FOUND);

        if (cartValidator.validateListingActive(listing).isError()) return Result.error(CartErrorCodes.LISTING_NOT_ACTIVE);

        Optional<Cart> existingCartItemOpt = cartRepository.findByUserIdAndListingId(userId, listing.getId());

        Cart cartItem;
        int reqQty = Optional.ofNullable(request.getQuantity()).orElse(1);

        if (existingCartItemOpt.isPresent()) {
            cartItem = existingCartItemOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + reqQty);
        } else {
            cartItem = Cart.builder()
                    .user(user)
                    .listing(listing)
                    .quantity(reqQty)
                    .notes(request.getNotes())
                    .build();
        }

        if (cartConfig.getReservation().isEnabled()) {
            if (reserveStockForCart(listing, cartItem.getQuantity(),
                    existingCartItemOpt.map(Cart::getQuantity).orElse(0)).isError())
            {
                return Result.error(ListingErrorCodes.STOCK_INSUFFICIENT);
            }
            cartItem.setReservedAt(LocalDateTime.now());
        }

        Cart savedCart = cartRepository.save(cartItem);
        CartDto dto = cartMapper.toDto(savedCart);
        dto.setListing(enrichmentService.enrich(dto.getListing(), userId));
        return Result.success(dto);
    }

    @Transactional
    public Result<Void> removeFromCart(Long userId, UUID listingId) {
        if (!cartRepository.existsByUserIdAndListingId(userId, listingId)) {
            return Result.error(CartErrorCodes.ITEM_NOT_FOUND_IN_CART);
        }
        cartRepository.deleteByUserIdAndListingId(userId, listingId);
        return Result.success();
    }

    @Transactional
    public Result<Void> clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
        return Result.success();
    }

    private Result<Void> reserveStockForCart(Listing listing, int requestedQty, int previousQty) {
        return listingRepository.findByIdWithLock(listing.getId())
                .map(lockedListing -> {
                    int availableStock = lockedListing.getQuantity() - getReservedQuantityForListing(lockedListing.getId());
                    return (availableStock >= (requestedQty - previousQty)) ? Result.<Void>success() : Result.<Void>error(ListingErrorCodes.STOCK_INSUFFICIENT);
                }).orElse(Result.error(ListingErrorCodes.LISTING_NOT_FOUND));
    }

    private int getReservedQuantityForListing(UUID listingId) {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(cartConfig.getReservation().getTimeoutMinutes().toMinutes());
        return cartRepository.countReservedQuantityByListing(listingId, expirationTime);
    }

    @Transactional
    public Result<CartDto> updateCartItem(Long userId, UUID listingId, UpdateCartItemRequest request) {
        log.info("Updating cart item for user: {} - listingId: {}", userId, listingId);

        Listing listing = listingService.findById(listingId).orElse(null);
        if (listing == null) return Result.error(CartErrorCodes.LISTING_NOT_FOUND);

        Cart cartItem = cartRepository.findByUserIdAndListingId(userId, listingId).orElse(null);
        if (cartItem == null) return Result.error(CartErrorCodes.ITEM_NOT_FOUND_IN_CART);

        int reqQty = Optional.ofNullable(request.getQuantity()).orElse(1);
        int previousQty = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;

        if (cartConfig.getReservation().isEnabled()) {
            if (reserveStockForCart(listing, reqQty, previousQty).isError()) {
                return Result.error(ListingErrorCodes.STOCK_INSUFFICIENT);
            }
            cartItem.setReservedAt(LocalDateTime.now());
        }

        cartItem.setQuantity(reqQty);
        cartItem.setNotes(request.getNotes());

        Cart updatedCart = cartRepository.save(cartItem);
        CartDto dto = cartMapper.toDto(updatedCart);

        dto.setListing(enrichmentService.enrich(dto.getListing(), userId));

        return Result.success(dto);
    }

    @Transactional(readOnly = true)
    public Result<Long> getCartItemCount(Long userId) {
        return Result.success(cartRepository.countByUserId(userId));
    }

    @Transactional(readOnly = true)
    public Result<Boolean> isInCart(Long userId, UUID listingId) {
        return Result.success(cartRepository.existsByUserIdAndListingId(userId, listingId));
    }

}