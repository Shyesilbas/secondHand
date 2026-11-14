package com.serhat.secondhand.order.api;

import com.serhat.secondhand.checkout.application.CheckoutOrchestrator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.order.application.*;
import com.serhat.secondhand.order.dto.*;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.review.application.IReviewService;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "Order operations")
public class OrderController {

    private final CheckoutOrchestrator checkoutOrchestrator;
    private final OrderQueryService orderQueryService;
    private final OrderCancellationService orderCancellationService;
    private final OrderRefundService orderRefundService;
    private final OrderCompletionService orderCompletionService;
    private final OrderModificationService orderModificationService;
    private final OrderShippingService orderShippingService;
    private final OrderEscrowQueryService orderEscrowQueryService;
    private final IReviewService reviewService;

    @PostMapping("/checkout")
    @Operation(summary = "Checkout cart items", description = "Create order from cart items and process payment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Address not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CheckoutResultDto> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(checkoutOrchestrator.executeCheckout(currentUser.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get user orders", description = "Paginated list of the current buyer's orders, filterable by delivery method, statuses and exact order number")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders or single order retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Unknown order status"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderDto>> getUserOrders(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String deliveryMethod,
            @RequestParam(required = false) Set<OrderStatus> statuses,
            @RequestParam(required = false) String orderNumber,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResultResponses.ok(orderQueryService.getUserOrders(
                currentUser.getId(), new OrderListFilter(parseDeliveryMethod(deliveryMethod), statuses, orderNumber), pageable));
    }

    @GetMapping("/status-counts")
    @Operation(summary = "Count buyer orders by status", description = "Order count per status for the current buyer, optionally limited to one delivery method")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status counts retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderStatusCountDto>> getUserOrderStatusCounts(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String deliveryMethod) {
        return ResultResponses.ok(orderQueryService.getUserOrderStatusCounts(
                currentUser.getId(), parseDeliveryMethod(deliveryMethod)));
    }

    @GetMapping("/seller")
    @Operation(summary = "Get seller orders", description = "Paginated list of orders containing the current user's items, filterable by delivery method, statuses and exact order number")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Seller orders retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderDto>> getSellerOrders(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String deliveryMethod,
            @RequestParam(required = false) Set<OrderStatus> statuses,
            @RequestParam(required = false) String orderNumber,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResultResponses.ok(orderQueryService.getSellerOrders(
                currentUser.getId(), new OrderListFilter(parseDeliveryMethod(deliveryMethod), statuses, orderNumber), pageable));
    }

    @GetMapping("/seller/status-counts")
    @Operation(summary = "Count seller orders by status", description = "Order count per status for orders containing the current user's items")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status counts retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderStatusCountDto>> getSellerOrderStatusCounts(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String deliveryMethod) {
        return ResultResponses.ok(orderQueryService.getSellerOrderStatusCounts(
                currentUser.getId(), parseDeliveryMethod(deliveryMethod)));
    }

    @GetMapping("/seller/{order-id}")
    @Operation(summary = "Get seller order by ID", description = "Retrieve specific order details for seller (only if order contains seller items)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> getSellerOrderById(
            @PathVariable("order-id") Long orderId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderQueryService.getSellerOrderById(orderId, currentUser.getId()));
    }

    @GetMapping("/seller/pending-escrow-amount")
    @Operation(summary = "Get pending escrow amount", description = "Get total pending escrow amount for seller")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending escrow amount retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, BigDecimal>> getPendingEscrowAmount(
            @AuthenticationPrincipal User currentUser) {
        BigDecimal amount = orderEscrowQueryService.getPendingEscrowAmount(currentUser.getId());
        return ResultResponses.ok(Result.success(Map.of("amount", amount)));
    }

    @GetMapping("/{order-id}")
    @Operation(summary = "Get order by ID", description = "Retrieve specific order details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> getOrderById(
            @PathVariable("order-id") Long orderId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderQueryService.getOrderById(orderId, currentUser.getId()));
    }

    @GetMapping("/pending-completion")
    @Operation(summary = "Check pending completion orders", description = "Check if user has any orders waiting for completion (DELIVERED status)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getPendingCompletionStatus(
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(Result.success(orderQueryService.getPendingCompletionStatus(currentUser.getId())));
    }

    @GetMapping("/items/{order-item-id}/review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDto> getReviewByOrderItem(
            @PathVariable("order-item-id") Long orderItemId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(reviewService.getReviewByOrderItem(orderItemId, currentUser.getId()));
    }

    @PutMapping("/{order-id}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel a confirmed order (partial or full)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable("order-id") Long orderId,
            @Valid @RequestBody OrderCancelRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderCancellationService.cancelOrder(orderId, request, currentUser));
    }

    @PostMapping("/{order-id}/refund")
    @Operation(summary = "Refund order", description = "Refund a delivered order within 48 hours (partial or full)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order refunded successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be refunded"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> refundOrder(
            @PathVariable("order-id") Long orderId,
            @Valid @RequestBody OrderRefundRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderRefundService.refundOrder(orderId, request, currentUser));
    }

    @PutMapping("/{order-id}/complete")
    @Operation(summary = "Complete order", description = "Manually complete a delivered order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order completed successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be completed"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> completeOrder(
            @PathVariable("order-id") Long orderId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderCompletionService.completeOrder(orderId, currentUser));
    }

    @PutMapping("/{order-id}/name")
    @Operation(summary = "Update order name", description = "Update the name of an order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order name updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid order name"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> updateOrderName(
            @PathVariable("order-id") Long orderId,
            @Valid @RequestBody UpdateOrderNameRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderModificationService.updateOrderName(orderId, request.getName(), currentUser));
    }

    @PutMapping("/{order-id}/address")
    @Operation(summary = "Update order address", description = "Update shipping/billing address of a modifiable order (pending or confirmed)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order address updated successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be modified"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order or address not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> updateOrderAddress(
            @PathVariable("order-id") Long orderId,
            @Valid @RequestBody UpdateOrderAddressRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderModificationService.updateOrderAddress(
                orderId, request.getShippingAddressId(), request.getBillingAddressId(), currentUser));
    }

    @PutMapping("/{order-id}/notes")
    @Operation(summary = "Update order notes", description = "Update notes of a modifiable order (pending or confirmed)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order notes updated successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be modified"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> updateOrderNotes(
            @PathVariable("order-id") Long orderId,
            @Valid @RequestBody UpdateOrderNotesRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderModificationService.updateOrderNotes(orderId, request.getNotes(), currentUser));
    }

    @PutMapping("/{order-id}/ship")
    @Operation(summary = "Ship order", description = "Mark order as shipped (Seller only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order marked as shipped successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be shipped"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> shipOrder(
            @PathVariable("order-id") Long orderId,
            @Valid @RequestBody OrderShipRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderShippingService.shipOrder(orderId, request, currentUser));
    }

    @PostMapping("/{order-number}/verify-meetup")
    @Operation(summary = "Verify meetup code", description = "Verify 6-digit meetup OTP code (Seller only)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> verifyMeetup(
            @PathVariable("order-number") String orderNumber,
            @RequestParam String code,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderCompletionService.verifyMeetupCode(orderNumber, code, currentUser));
    }

    @PostMapping("/{order-number}/confirm-handover-completion")
    @Operation(summary = "Confirm handover completion", description = "Manually finalize order handover to complete order (Buyer/Seller)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> confirmHandoverCompletion(
            @PathVariable("order-number") String orderNumber,
            @RequestBody Map<String, Boolean> payload,
            @AuthenticationPrincipal User currentUser) {
        boolean confirmed = payload != null && payload.getOrDefault("confirmed", false);
        return ResultResponses.ok(orderCompletionService.confirmHandoverCompletion(orderNumber, confirmed, currentUser));
    }

    @GetMapping(value = "/{order-number}/qr-code", produces = org.springframework.http.MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "Get order meetup QR code", description = "Generates and returns order's meetup verification QR code as an image (PNG) locally using ZXing")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> getOrderQrCode(
            @PathVariable("order-number") String orderNumber,
            @AuthenticationPrincipal User currentUser) {
        byte[] qrBytes = orderCompletionService.generateMeetupQrCode(orderNumber, currentUser);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "no-cache")
                .body(qrBytes);
    }

    @PostMapping("/{order-number}/regenerate-meetup-code")
    @Operation(summary = "Regenerate meetup code", description = "Regenerates and returns new meetup code and hash (Buyer only)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> regenerateMeetupCode(
            @PathVariable("order-number") String orderNumber,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(orderCompletionService.regenerateMeetupCode(orderNumber, currentUser));
    }

    // Unknown or "ALL" delivery methods mean no delivery filter (existing list behaviour).
    private static DeliveryMethod parseDeliveryMethod(String deliveryMethod) {
        if (deliveryMethod == null || deliveryMethod.isBlank() || "ALL".equalsIgnoreCase(deliveryMethod)) {
            return null;
        }
        try {
            return DeliveryMethod.valueOf(deliveryMethod.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
