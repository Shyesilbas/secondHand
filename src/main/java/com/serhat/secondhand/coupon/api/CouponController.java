package com.serhat.secondhand.coupon.api;

import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.CouponPreviewRequest;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.PricingService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final UserService userService;
    private final CartRepository cartRepository;
    private final PricingService pricingService;
    private final CouponService couponService;

    @PostMapping("/preview")
    public ResponseEntity<PricingResultDto> preview(@RequestBody CouponPreviewRequest request, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        var cartItems = cartRepository.findByUserWithListing(user);
        PricingResultDto pricing = pricingService.priceCart(user, cartItems, request != null ? request.getCouponCode() : null);
        return ResponseEntity.ok(pricing);
    }

    @GetMapping("/active")
    public ResponseEntity<java.util.List<ActiveCouponDto>> active(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return ResponseEntity.ok(couponService.listActiveForUser(user));
    }
}

