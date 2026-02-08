package com.serhat.secondhand.order.api;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.order.service.*;
import com.serhat.secondhand.payment.service.CheckoutService;
import com.serhat.secondhand.review.service.ReviewService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Order Management", description = "Order operations")
public class OrderController {

    private final CheckoutService checkoutService;
    private final OrderQueryService orderQueryService;
    private final OrderCancellationService orderCancellationService;
    private final OrderRefundService orderRefundService;
    private final OrderCompletionService orderCompletionService;
    private final OrderNameService orderNameService;
    private final OrderEscrowService orderEscrowService;
    private final ReviewService reviewService;

    @PostMapping("/checkout")
    @Operation(summary = "Checkout cart items", description = "Create order from cart items and process payment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<?> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to checkout for user: {}", currentUser.getEmail());
        Result<OrderDto> result = checkoutService.checkout(currentUser.getId(), request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping
    @Operation(summary = "Get user orders or order by order number", description = "Retrieve paginated list of user's orders, or a single order when orderNumber is provided")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders or single order retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found when querying by orderNumber")
    })
    public ResponseEntity<?> getUserOrders(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 5,sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("API request to get orders for user: {}", currentUser.getEmail());
        Page<OrderDto> orders = orderQueryService.getUserOrders(currentUser.getId(), pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller")
    @Operation(summary = "Get seller orders", description = "Retrieve paginated list of orders where current user is a seller")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Seller orders retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<OrderDto>> getSellerOrders(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 5) Pageable pageable) {
        log.info("API request to get seller orders for user: {}", currentUser.getEmail());
        Page<OrderDto> orders = orderQueryService.getSellerOrders(currentUser.getId(), pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller/{orderId}")
    @Operation(summary = "Get seller order by ID", description = "Retrieve specific order details for seller (only if order contains seller items)")
    public ResponseEntity<?> getSellerOrderById(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to get seller order by ID: {} for user: {}", orderId, currentUser.getEmail());
        Result<OrderDto> result = orderQueryService.getSellerOrderById(orderId, currentUser.getId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/seller/pending-escrow-amount")
    @Operation(summary = "Get pending escrow amount", description = "Get total pending escrow amount for seller")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending escrow amount retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<java.util.Map<String, java.math.BigDecimal>> getPendingEscrowAmount(
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to get pending escrow amount for seller: {}", currentUser.getEmail());
        java.math.BigDecimal amount = orderEscrowService.getPendingEscrowAmount(currentUser);
        return ResponseEntity.ok(java.util.Map.of("amount", amount));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID", description = "Retrieve specific order details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to get order by ID: {} for user: {}", orderId, currentUser.getEmail());
        Result<OrderDto> result = orderQueryService.getOrderById(orderId, currentUser.getId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/pending-completion")
    @Operation(summary = "Check pending completion orders", description = "Check if user has any orders waiting for completion (DELIVERED status)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<java.util.Map<String, Object>> getPendingCompletionStatus(
            @AuthenticationPrincipal User currentUser) {
        log.debug("API request to check pending completion orders for user: {}", currentUser.getEmail());
        java.util.Map<String, Object> status = orderQueryService.getPendingCompletionStatus(currentUser.getId());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/items/{orderItemId}/review")
    public ResponseEntity<?> getReviewByOrderItem(
            @PathVariable Long orderItemId,
            @AuthenticationPrincipal User currentUser) {
        log.info("Getting review for order item: {} by user: {}", orderItemId, currentUser.getId());
        var result = reviewService.getReviewByOrderItem(orderItemId, currentUser.getId());
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel a confirmed order (partial or full)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderCancelRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to cancel order: {} for user: {}", orderId, currentUser.getEmail());
        Result<OrderDto> result = orderCancellationService.cancelOrder(orderId, request, currentUser);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PostMapping("/{orderId}/refund")
    @Operation(summary = "Refund order", description = "Refund a delivered order within 48 hours (partial or full)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order refunded successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be refunded"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> refundOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderRefundRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to refund order: {} for user: {}", orderId, currentUser.getEmail());
        Result<OrderDto> result = orderRefundService.refundOrder(orderId, request, currentUser);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PutMapping("/{orderId}/complete")
    @Operation(summary = "Complete order", description = "Manually complete a delivered order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order completed successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be completed"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> completeOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to complete order: {} for user: {}", orderId, currentUser.getEmail());
        Result<OrderDto> result = orderCompletionService.completeOrder(orderId, currentUser);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PutMapping("/{orderId}/name")
    @Operation(summary = "Update order name", description = "Update the name of an order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order name updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid order name"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> updateOrderName(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderNameRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to update order name: {} for user: {}", orderId, currentUser.getEmail());
        Result<OrderDto> result = orderNameService.updateOrderName(orderId, request.getName(), currentUser);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @Setter
    @Getter
    public static class UpdateOrderNameRequest {
        @NotBlank
        private String name;
    }
}
