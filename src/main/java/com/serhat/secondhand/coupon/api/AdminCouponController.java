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
    public ResponseEntity<?> create(@RequestBody CreateCouponRequest request) {
        var result = couponService.create(request);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody UpdateCouponRequest request) {
        var result = couponService.update(id, request);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping
    public ResponseEntity<List<CouponDto>> list() {
        return ResponseEntity.ok(couponService.listAll());
    }
}


