package com.serhat.secondhand.cart.validator;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.util.CartErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartValidator {

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

    public Result<Void> validateQuantity(int quantity) {
        if (quantity < 1) {
            return Result.error(CartErrorCodes.INVALID_QUANTITY);
        }
        return Result.success();
    }

    public Result<Void> validateStock(int requestedQty, Integer availableQty) {
        if (availableQty != null && requestedQty > availableQty) {
            return Result.error(CartErrorCodes.INSUFFICIENT_STOCK);
        }
        return Result.success();
    }

    public Result<Void> validateCartItemExists(Optional<Cart> cartOpt) {
        if (cartOpt.isEmpty()) {
            return Result.error(CartErrorCodes.ITEM_NOT_FOUND_IN_CART);
        }
        return Result.success();
    }
}
