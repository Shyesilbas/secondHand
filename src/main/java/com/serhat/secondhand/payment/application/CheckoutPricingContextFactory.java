package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.application.IPricingService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CheckoutPricingContextFactory {

    private final CartRepository cartRepository;
    private final IOfferService offerService;
    private final IPricingService pricingService;
    private final IUserService userService;

    public Result<CheckoutPricingContext> build(Long userId, CheckoutRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();

        List<Cart> cartItems = cartRepository.findByUserIdWithListing(userId);
        Result<Offer> offerResult = resolveAcceptedOffer(userId, request);
        if (offerResult.isError()) {
            return Result.error(offerResult.getMessage(), offerResult.getErrorCode());
        }

        Offer acceptedOffer = offerResult.getData();
        List<Cart> effectiveCartItems = buildEffectiveCartItems(cartItems, acceptedOffer, user);
        PricingResultDto pricing = calculatePricing(user, effectiveCartItems, request, acceptedOffer);

        return Result.success(new CheckoutPricingContext(user, effectiveCartItems, acceptedOffer, pricing));
    }

    private Result<Offer> resolveAcceptedOffer(Long userId, CheckoutRequest request) {
        if (request.getOfferId() == null) {
            return Result.success(null);
        }
        return offerService.getAcceptedOfferForCheckout(userId, request.getOfferId());
    }

    private List<Cart> buildEffectiveCartItems(List<Cart> cartItems, Offer acceptedOffer, User user) {
        if (acceptedOffer == null) {
            return cartItems;
        }

        List<Cart> effectiveCartItems = new ArrayList<>();
        UUID offerListingId = acceptedOffer.getListing().getId();

        for (Cart ci : cartItems) {
            if (ci.getListing() != null && ci.getListing().getId().equals(offerListingId)) {
                continue;
            }
            effectiveCartItems.add(ci);
        }

        effectiveCartItems.add(Cart.builder()
                .user(user)
                .listing(acceptedOffer.getListing())
                .quantity(acceptedOffer.getQuantity())
                .build());

        return effectiveCartItems;
    }

    private PricingResultDto calculatePricing(
            User user,
            List<Cart> effectiveCartItems,
            CheckoutRequest request,
            Offer acceptedOffer
    ) {
        if (acceptedOffer != null) {
            return pricingService.priceCart(
                    user,
                    effectiveCartItems,
                    request.getCouponCode(),
                    acceptedOffer.getListing().getId(),
                    acceptedOffer.getQuantity(),
                    acceptedOffer.getTotalPrice()
            );
        }
        return pricingService.priceCart(user, effectiveCartItems, request.getCouponCode());
    }

    public record CheckoutPricingContext(
            User user,
            List<Cart> effectiveCartItems,
            Offer acceptedOffer,
            PricingResultDto pricing
    ) {
    }
}
