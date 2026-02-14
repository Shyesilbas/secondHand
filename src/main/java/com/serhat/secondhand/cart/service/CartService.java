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
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.enrich.ListingEnrichmentService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.util.UserErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    private final IUserService userService;
    private final CartValidator cartValidator;
    private final ListingEnrichmentService enrichmentService;
    private final ListingRepository listingRepository;
    private final CartConfig cartConfig;

    private static final ZoneId ZONE = ZoneId.of("Europe/Istanbul");
    private static final int DEFAULT_CART_QUANTITY = 1;


    @Transactional(readOnly = true)
    public Result<Page<CartDto>> getCartItems(Long userId, Pageable pageable) {
        Result<User> userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getErrorCode());
        }

        Page<Cart> cartPage = cartRepository.findByUserIdWithListing(userId, pageable);

        Page<CartDto> dtoPage = cartPage.map(cartMapper::toDto);

        List<CartDto> content = dtoPage.getContent();
        if (!content.isEmpty()) {
            List<ListingDto> listings = content.stream()
                    .map(CartDto::getListing)
                    .filter(Objects::nonNull)
                    .toList();

            enrichmentService.enrich(listings, userId);
        }

        return Result.success(dtoPage);
    }

    private void applyReservationIfLowStock(Listing listing, Cart cartItem) {
        Integer qty = listing.getQuantity();
        if (qty != null && qty <= 3) {
            LocalDateTime now = LocalDateTime.now(ZONE);
            cartItem.setReservedAt(now);
            cartItem.setReservationEndTime(now.plusMinutes(cartConfig.getReservation().getTimeoutDuration().toMinutes()));
            cartItem.setIsReserved(true);
        } else {
            cartItem.setReservedAt(null);
            cartItem.setReservationEndTime(null);
            cartItem.setIsReserved(false);
        }
    }

    @Transactional
    protected Result<CartDto> processCartAction(
            Long userId,
            UUID listingId,
            Integer requestedQty,
            String notes,
            boolean isUpdate
    ) {
        Result<User> userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(UserErrorCodes.USER_NOT_FOUND);
        }
        User user = userResult.getData();

        Listing listing = listingRepository.findByIdWithLock(listingId)
                .orElse(null);
        if (listing == null) {
            return Result.error(CartErrorCodes.LISTING_NOT_FOUND);
        }

        Result<Void> listingValidation = cartValidator.validateListing(listing,userId);
        if (listingValidation.isError()) {
            return Result.error(listingValidation.getErrorCode());
        }

        int targetQty = Optional.ofNullable(requestedQty).orElse(DEFAULT_CART_QUANTITY);
        Optional<Cart> existingCartItemOpt = cartRepository
                .findByUserIdAndListingId(userId, listing.getId());

        int currentInCartQty = existingCartItemOpt
                .map(Cart::getQuantity)
                .orElse(0);
        int finalTotalQty = isUpdate ? targetQty : (currentInCartQty + targetQty);

        boolean reservationEnabled = cartConfig.getReservation().isEnabled();
        if (reservationEnabled) {
            Result<Void> reservationValidation = cartValidator.validateReservationPossible(
                    listing,
                    finalTotalQty,
                    currentInCartQty
            );
            if (reservationValidation.isError()) {
                return Result.error(reservationValidation.getErrorCode());
            }
        }

        Cart cartItem = existingCartItemOpt.orElseGet(() ->
                Cart.builder()
                        .user(user)
                        .listing(listing)
                        .build()
        );

        cartItem.setQuantity(finalTotalQty);
        if (notes != null) {
            cartItem.setNotes(notes);
        }

        if (reservationEnabled) {
            applyReservationIfLowStock(listing, cartItem);
        }

        Cart savedCart = cartRepository.save(cartItem);
        CartDto dto = cartMapper.toDto(savedCart);

        enrichmentService.enrichInPlace(dto.getListing(), userId);
        return Result.success(dto);
    }


    @Transactional
    public Result<CartDto> addToCart(Long userId, AddToCartRequest request) {
        return processCartAction(userId, request.getListingId(), request.getQuantity(), request.getNotes(), false);
    }

    @Transactional
    public Result<CartDto> updateCartItem(Long userId, UUID listingId, UpdateCartItemRequest request) {
        return processCartAction(userId, listingId, request.getQuantity(), request.getNotes(), true);
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


    @Transactional(readOnly = true)
    public Result<Long> getCartItemCount(Long userId) {
        return Result.success(cartRepository.countByUserId(userId));
    }

    @Transactional(readOnly = true)
    public Result<Boolean> isInCart(Long userId, UUID listingId) {
        return Result.success(cartRepository.existsByUserIdAndListingId(userId, listingId));
    }

}