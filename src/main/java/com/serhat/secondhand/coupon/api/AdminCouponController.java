package com.serhat.secondhand.coupon.api;

import com.serhat.secondhand.coupon.dto.CouponDto;
import com.serhat.secondhand.coupon.dto.CreateCouponRequest;
import com.serhat.secondhand.coupon.dto.UpdateCouponRequest;
import com.serhat.secondhand.coupon.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @PostMapping
    public ResponseEntity<CouponDto> create(@RequestBody CreateCouponRequest request) {
        return ResponseEntity.ok(couponService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponDto> update(@PathVariable UUID id, @RequestBody UpdateCouponRequest request) {
        return ResponseEntity.ok(couponService.update(id, request));
    }

    @GetMapping
    public ResponseEntity<List<CouponDto>> list() {
        return ResponseEntity.ok(couponService.listAll());
    }
}

