package com.serhat.secondhand.offer.validator;

import com.serhat.secondhand.core.exception.BusinessException;
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

    public void validateCreateRequest(CreateOfferRequest request) {
        validateQuantityAndPrice(request.getQuantity(), request.getTotalPrice());
    }

    public void validateCounterRequest(CounterOfferRequest request) {
        validateQuantityAndPrice(request.getQuantity(), request.getTotalPrice());
    }

    public void validateQuantityAndPrice(Integer quantity, BigDecimal totalPrice) {
        if (quantity == null || quantity < 1) {
            throw new BusinessException(OfferErrorCodes.INVALID_QUANTITY);
        }
        if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(OfferErrorCodes.INVALID_TOTAL_PRICE);
        }
    }

    public void validateListingForOffer(Listing listing, User buyer) {
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BusinessException(OfferErrorCodes.LISTING_NOT_ACTIVE);
        }
        if (listing.getListingType() == ListingType.VEHICLE || listing.getListingType() == ListingType.REAL_ESTATE) {
            throw new BusinessException(OfferErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }
        if (listing.getSeller() != null && listing.getSeller().getId() != null
                && listing.getSeller().getId().equals(buyer.getId())) {
            throw new BusinessException(OfferErrorCodes.SELF_OFFER_NOT_ALLOWED);
        }
    }

    public void validateListingEligibility(Listing listing) {
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BusinessException(OfferErrorCodes.LISTING_NOT_ACTIVE);
        }
        if (listing.getListingType() == ListingType.VEHICLE || listing.getListingType() == ListingType.REAL_ESTATE) {
            throw new BusinessException(OfferErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }
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
