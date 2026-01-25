package com.serhat.secondhand.coupon.api;

import com.serhat.secondhand.coupon.dto.ActiveCouponDto;
import com.serhat.secondhand.coupon.dto.CouponPreviewRequest;
import com.serhat.secondhand.coupon.service.CouponService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Coupon Management", description = "Coupon and pricing preview operations")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/preview")
    @Operation(summary = "Preview pricing with coupon", description = "Calculate total price with cart items, accepted offers and potential coupon codes")
    public ResponseEntity<PricingResultDto> preview(
            @RequestBody CouponPreviewRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("API request to preview pricing for user: {}", currentUser.getId());

        PricingResultDto pricing = couponService.previewPricing(currentUser.getId(), request);
        return ResponseEntity.ok(pricing);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active coupons", description = "List all coupons currently available and valid for the authenticated user")
    public ResponseEntity<List<ActiveCouponDto>> active(@AuthenticationPrincipal User currentUser) {

        log.info("API request to list active coupons for user: {}", currentUser.getId());

        return ResponseEntity.ok(couponService.listActiveForUser(currentUser.getId()));
    }
}