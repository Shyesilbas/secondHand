package com.serhat.secondhand.refund.controller;

import com.serhat.secondhand.refund.dto.CreateRefundRequestDto;
import com.serhat.secondhand.refund.dto.RefundRequestDto;
import com.serhat.secondhand.refund.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/refunds")
@RequiredArgsConstructor
@Slf4j
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    public ResponseEntity<RefundRequestDto> createRefundRequest(
            @Valid @RequestBody CreateRefundRequestDto dto) {
        log.info("Creating refund request for order item: {}", dto.getOrderItemId());
        RefundRequestDto refundRequest = refundService.createRefundRequest(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(refundRequest);
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<RefundRequestDto> getRefundRequest(@PathVariable Long id) {
        log.info("Getting refund request details: {}", id);
        RefundRequestDto refundRequest = refundService.getRefundRequest(id);
        return ResponseEntity.ok(refundRequest);
    }

    @GetMapping
    public ResponseEntity<Page<RefundRequestDto>> getUserRefundRequests(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<RefundRequestDto> refundRequests = refundService.getUserRefundRequests(pageable);
        return ResponseEntity.ok(refundRequests);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Page<RefundRequestDto>> getOrderRefundRequests(
            @PathVariable Long orderId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<RefundRequestDto> refundRequests = refundService.getOrderRefundRequests(orderId, pageable);
        return ResponseEntity.ok(refundRequests);
    }

    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<Void> cancelRefundRequest(@PathVariable Long id) {
        log.info("Cancelling refund request: {}", id);
        refundService.cancelRefundRequest(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/can-cancel/order/{orderId}")
    public ResponseEntity<Boolean> canCancelOrder(@PathVariable Long orderId) {
        boolean canCancel = refundService.canCancelOrder(orderId);
        return ResponseEntity.ok(canCancel);
    }

    @GetMapping("/can-cancel/order-item/{orderItemId}")
    public ResponseEntity<Boolean> canCancelOrderItem(@PathVariable Long orderItemId) {
        boolean canCancel = refundService.canCancelOrderItem(orderItemId);
        return ResponseEntity.ok(canCancel);
    }
}

