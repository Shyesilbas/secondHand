package com.serhat.secondhand.offer.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.offer.dto.CounterOfferRequest;
import com.serhat.secondhand.offer.dto.CreateOfferRequest;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferActor;
import com.serhat.secondhand.offer.util.OfferErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OfferValidator {

    public Result<Void> validateCreateRequest(CreateOfferRequest request) {
        return validateQuantityAndPrice(request.getQuantity(), request.getTotalPrice());
    }

    public Result<Void> validateCounterRequest(CounterOfferRequest request) {
        return validateQuantityAndPrice(request.getQuantity(), request.getTotalPrice());
    }

    public Result<Void> validateQuantityAndPrice(Integer quantity, BigDecimal totalPrice) {
        if (quantity == null || quantity < 1) {
            return Result.error(OfferErrorCodes.INVALID_QUANTITY);
        }
        if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error(OfferErrorCodes.INVALID_TOTAL_PRICE);
        }
        return Result.success();
    }

    public Result<Void> validateListingForOffer(Listing listing, User buyer) {
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            return Result.error(OfferErrorCodes.LISTING_NOT_ACTIVE);
        }
        if (listing.getListingType() == ListingType.VEHICLE || listing.getListingType() == ListingType.REAL_ESTATE) {
            return Result.error(OfferErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }
        if (listing.getSeller() != null && listing.getSeller().getId() != null
                && listing.getSeller().getId().equals(buyer.getId())) {
            return Result.error(OfferErrorCodes.SELF_OFFER_NOT_ALLOWED);
        }
        return Result.success();
    }

    public Result<Void> validateListingEligibility(Listing listing) {
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            return Result.error(OfferErrorCodes.LISTING_NOT_ACTIVE);
        }
        if (listing.getListingType() == ListingType.VEHICLE || listing.getListingType() == ListingType.REAL_ESTATE) {
            return Result.error(OfferErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }
        return Result.success();
    }


    public boolean isBuyerOrSeller(User user, Offer offer) {
        Long userId = user.getId();
        return offer.getBuyer() != null && offer.getBuyer().getId().equals(userId)
                || offer.getSeller() != null && offer.getSeller().getId().equals(userId);
    }

    public boolean isReceiver(User user, Offer offer) {
        return offer.getCreatedBy() != resolveActor(user, offer);
    }

    public OfferActor resolveActor(User user, Offer offer) {
        Long userId = user.getId();
        if (offer.getBuyer() != null && offer.getBuyer().getId().equals(userId)) {
            return OfferActor.BUYER;
        }
        if (offer.getSeller() != null && offer.getSeller().getId().equals(userId)) {
            return OfferActor.SELLER;
        }
        return null;
    }

}
