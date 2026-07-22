package com.serhat.secondhand.cart.validator;

import com.serhat.secondhand.cart.util.CartErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.cart.config.CartConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import com.serhat.secondhand.inventory.application.InventoryService;

@Service
@RequiredArgsConstructor
public class CartValidator {

    private final CartConfig cartConfig;
    private final InventoryService inventoryService;

    public Result<Void> validateListingExists(Listing listing) {
        if (listing == null) {
            return Result.error(CartErrorCodes.LISTING_NOT_FOUND);
        }
        return Result.success();
    }

    public Result<Void> validateListingActive(Listing listing) {
        if (!ListingStatus.ACTIVE.equals(listing.getStatus())) {
            return Result.error(CartErrorCodes.LISTING_NOT_ACTIVE);
        }
        return Result.success();
    }

    public Result<Void> validateListingType(Listing listing) {
        if (listing.getListingType() == ListingType.VEHICLE ||
                listing.getListingType() == ListingType.REAL_ESTATE) {
            return Result.error(CartErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }
        return Result.success();
    }

    public Result<Void> validateListingNotBelongToUser(Listing listing, Long userId) {
        if (listing.getSeller().getId().equals(userId)) {
            return Result.error(ListingErrorCodes.LISTING_BELONGS_TO_USER);
        }
        return Result.success();
    }

    public Result<Void> validateReservationPossible(
            Listing listing,
            int requestedTotalQty,
            int currentInCartQty,
            int activeReservationQty
    ) {
        Integer invQty = inventoryService.getAvailableQuantity(listing.getId());
        int actualStock = Optional.ofNullable(invQty).orElse(0);
        int effectiveReservedQty = Math.max(activeReservationQty - currentInCartQty, 0);
        int availableStock = Math.max(actualStock - effectiveReservedQty, 0);

        if (availableStock <= 0) {
            return Result.error(CartErrorCodes.INSUFFICIENT_STOCK);
        }

        if (requestedTotalQty > availableStock) {
            int threshold = Optional.ofNullable(cartConfig.getReservation().getThreshold()).orElse(3);
            if (actualStock <= threshold) {
                return Result.error(ListingErrorCodes.LISTING_IS_RESERVED);
            }
            return Result.error(CartErrorCodes.INSUFFICIENT_STOCK);
        }

        return Result.success();
    }

    public Result<Void> validateListing(Listing listing, Long currentUserId) {
        var exists = validateListingExists(listing);
        if (exists.isError()) return exists;

        var active = validateListingActive(listing);
        if (active.isError()) return active;

        var type = validateListingType(listing);
        if (type.isError()) return type;

        var belongs = validateListingNotBelongToUser(listing, currentUserId);
        if (belongs.isError()) return belongs;

        return Result.success();
    }
}
