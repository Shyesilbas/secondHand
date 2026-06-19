package com.serhat.secondhand.checkout.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CheckoutStockReservationService {

    private final ListingRepository listingRepository;

    public Result<Map<UUID, Integer>> reserveStock(List<Cart> cartItems) {
        Map<UUID, Integer> reserved = new HashMap<>();
        for (Cart item : cartItems) {
            Listing listing = listingRepository.findByIdWithLock(item.getListing().getId()).orElse(null);

            if (listing == null) {
                releaseReservedStock(reserved);
                return Result.error(ListingErrorCodes.LISTING_NOT_FOUND.toString(), "Listing Not Found.");
            }

            int requestedQty = item.getQuantity() != null ? item.getQuantity() : 1;
            try {
                listing.reserveQuantityForCheckout(requestedQty);
                listingRepository.save(listing);
                if (listing.getQuantity() != null) {
                    reserved.merge(listing.getId(), requestedQty, Integer::sum);
                }
            } catch (BusinessException e) {
                releaseReservedStock(reserved);
                return Result.error(e.getMessage(), e.getErrorCode());
            }
        }
        return Result.success(reserved);
    }

    public void releaseReservedStock(Map<UUID, Integer> reserved) {
        if (reserved == null) {
            return;
        }
        reserved.forEach((listingId, quantity) ->
                listingRepository.findByIdWithLock(listingId).ifPresent(listing -> {
                    listing.restoreReservedQuantity(quantity);
                    listingRepository.save(listing);
                }));
    }
}
