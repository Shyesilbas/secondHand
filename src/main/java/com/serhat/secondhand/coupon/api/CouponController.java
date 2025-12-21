package com.serhat.secondhand.coupon.api;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.CouponPreviewRequest;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.service.OfferService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.PricingService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final UserService userService;
    private final CartRepository cartRepository;
    private final PricingService pricingService;
    private final CouponService couponService;
    private final OfferService offerService;

    @PostMapping("/preview")
    public ResponseEntity<PricingResultDto> preview(@RequestBody CouponPreviewRequest request, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        var cartItems = cartRepository.findByUserWithListing(user);
        Offer acceptedOffer = null;
        var effectiveCartItems = cartItems;
        if (request != null && request.getOfferId() != null) {
            acceptedOffer = offerService.getAcceptedOfferForCheckout(user, request.getOfferId());
            effectiveCartItems = new ArrayList<>();
            for (var ci : cartItems) {
                if (ci.getListing() != null && acceptedOffer.getListing() != null && acceptedOffer.getListing().getId() != null
                        && acceptedOffer.getListing().getId().equals(ci.getListing().getId())) {
                    continue;
                }
                effectiveCartItems.add(ci);
            }
            effectiveCartItems.add(com.serhat.secondhand.cart.entity.Cart.builder()
                    .user(user)
                    .listing(acceptedOffer.getListing())
                    .quantity(acceptedOffer.getQuantity())
                    .notes(null)
                    .build());
        }

        String couponCode = request != null ? request.getCouponCode() : null;
        PricingResultDto pricing = acceptedOffer != null
                ? pricingService.priceCart(user, effectiveCartItems, couponCode, acceptedOffer.getListing().getId(), acceptedOffer.getQuantity(), acceptedOffer.getTotalPrice())
                : pricingService.priceCart(user, effectiveCartItems, couponCode);
        return ResponseEntity.ok(pricing);
    }

    @GetMapping("/active")
    public ResponseEntity<java.util.List<ActiveCouponDto>> active(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return ResponseEntity.ok(couponService.listActiveForUser(user));
    }
}


