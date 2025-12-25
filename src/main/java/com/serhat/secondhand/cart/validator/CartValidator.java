package com.serhat.secondhand.cart.validator;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.util.CartErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartValidator {

    public void validateListingExists(Listing listing) {
        if (listing == null) {
            throw new BusinessException(CartErrorCodes.LISTING_NOT_FOUND);
        }
    }

    public void validateListingActive(Listing listing) {
        if (!ListingStatus.ACTIVE.equals(listing.getStatus())) {
            throw new BusinessException(CartErrorCodes.LISTING_NOT_ACTIVE);
        }
    }

    public void validateListingType(Listing listing) {
        if (listing.getListingType() == ListingType.VEHICLE ||
                listing.getListingType() == ListingType.REAL_ESTATE) {
            throw new BusinessException(CartErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }
    }

    public void validateQuantity(int quantity) {
        if (quantity < 1) {
            throw new BusinessException(CartErrorCodes.INVALID_QUANTITY);
        }
    }

    public void validateStock(int requestedQty, Integer availableQty) {
        if (availableQty != null && requestedQty > availableQty) {
            throw new BusinessException(CartErrorCodes.INSUFFICIENT_STOCK);
        }
    }

    public void validateCartItemExists(Optional<Cart> cartOpt) {
        if (cartOpt.isEmpty()) {
            throw new BusinessException(CartErrorCodes.ITEM_NOT_FOUND_IN_CART);
        }
    }
}
