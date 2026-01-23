package com.serhat.secondhand.coupon.api;

import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.CouponPreviewRequest;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final UserService userService;
    private final CouponService couponService;

    @PostMapping("/preview")
    public ResponseEntity<PricingResultDto> preview(@RequestBody CouponPreviewRequest request, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        PricingResultDto pricing = couponService.previewPricing(user, request);
        return ResponseEntity.ok(pricing);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ActiveCouponDto>> active(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        return ResponseEntity.ok(couponService.listActiveForUser(user));
    }
}


