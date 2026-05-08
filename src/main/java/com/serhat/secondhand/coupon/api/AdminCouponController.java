package com.serhat.secondhand.coupon.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.coupon.application.CouponService;
import com.serhat.secondhand.coupon.dto.CreateCouponRequest;
import com.serhat.secondhand.coupon.dto.CouponDto;
import com.serhat.secondhand.coupon.dto.UpdateCouponRequest;
import com.serhat.secondhand.coupon.entity.CouponAudience;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Coupons", description = "Create and manage coupons (ADMIN only)")
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    @Operation(summary = "List all coupons")
    public ResponseEntity<?> listAll() {
        List<CouponDto> list = couponService.listAll();
        return ResultResponses.ok(Result.success(list));
    }

    @PostMapping
    @Operation(summary = "Create coupon")
    public ResponseEntity<?> create(@Valid @RequestBody CreateCouponRequest request) {
        return ResultResponses.created(couponService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update coupon")
    public ResponseEntity<?> update(@PathVariable UUID id, @Valid @RequestBody UpdateCouponRequest request) {
        return ResultResponses.ok(couponService.update(id, request));
    }

    @GetMapping("/audience-stats")
    @Operation(summary = "Eligible user count for a rule-based audience")
    public ResponseEntity<?> audienceStats(@RequestParam CouponAudience audience) {
        return ResultResponses.ok(couponService.audienceStats(audience));
    }
}
