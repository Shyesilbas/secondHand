package com.serhat.secondhand.order.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.order.dto.*;
import com.serhat.secondhand.order.service.*;
import com.serhat.secondhand.payment.service.CheckoutService;
import com.serhat.secondhand.review.service.IReviewService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "Order operations")
public class OrderController {

    private final CheckoutService checkoutService;
    private final OrderQueryService orderQueryService;
    private final OrderCancellationService orderCancellationService;
    private final OrderRefundService orderRefundService;
    private final OrderCompletionService orderCompletionService;
    private final OrderNameService orderNameService;
    private final OrderModificationService orderModificationService;
    private final OrderEscrowService orderEscrowService;
    private final IReviewService reviewService;
    private final OrderLogService orderLog;

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
        orderLog.logApiMutation("checkout", null, currentUser.getEmail());
        return ResultResponses.ok(checkoutService.checkout(currentUser.getId(), request));
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

        orderLog.logApiRequest("getUserOrders", currentUser.getEmail());
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
        orderLog.logApiRequest("getSellerOrders", currentUser.getEmail());
        Page<OrderDto> orders = orderQueryService.getSellerOrders(currentUser.getId(), pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller/{orderId}")
    @Operation(summary = "Get seller order by ID", description = "Retrieve specific order details for seller (only if order contains seller items)")
    public ResponseEntity<?> getSellerOrderById(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser) {
        orderLog.logApiRequest("getSellerOrderById", currentUser.getEmail());
        return ResultResponses.ok(orderQueryService.getSellerOrderById(orderId, currentUser.getId()));
    }

    @GetMapping("/seller/pending-escrow-amount")
    @Operation(summary = "Get pending escrow amount", description = "Get total pending escrow amount for seller")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending escrow amount retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, BigDecimal>> getPendingEscrowAmount(
            @AuthenticationPrincipal User currentUser) {
        orderLog.logApiRequest("getPendingEscrowAmount", currentUser.getEmail());
        BigDecimal amount = orderEscrowService.getPendingEscrowAmount(currentUser);
        return ResponseEntity.ok(Map.of("amount", amount));
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
        orderLog.logApiRequest("getOrderById", currentUser.getEmail());
        return ResultResponses.ok(orderQueryService.getOrderById(orderId, currentUser.getId()));
    }

    @GetMapping("/pending-completion")
    @Operation(summary = "Check pending completion orders", description = "Check if user has any orders waiting for completion (DELIVERED status)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Map<String, Object>> getPendingCompletionStatus(
            @AuthenticationPrincipal User currentUser) {
        orderLog.logApiRequest("getPendingCompletionStatus", currentUser.getEmail());
        Map<String, Object> status = orderQueryService.getPendingCompletionStatus(currentUser.getId());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/items/{orderItemId}/review")
    public ResponseEntity<?> getReviewByOrderItem(
            @PathVariable Long orderItemId,
            @AuthenticationPrincipal User currentUser) {
        orderLog.logApiRequest("getReviewByOrderItem", currentUser.getEmail());
        return ResultResponses.ok(reviewService.getReviewByOrderItem(orderItemId, currentUser.getId()));
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
        orderLog.logApiMutation("cancelOrder", orderId, currentUser.getEmail());
        return ResultResponses.ok(orderCancellationService.cancelOrder(orderId, request, currentUser));
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
        orderLog.logApiMutation("refundOrder", orderId, currentUser.getEmail());
        return ResultResponses.ok(orderRefundService.refundOrder(orderId, request, currentUser));
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
        orderLog.logApiMutation("completeOrder", orderId, currentUser.getEmail());
        return ResultResponses.ok(orderCompletionService.completeOrder(orderId, currentUser));
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
        orderLog.logApiMutation("updateOrderName", orderId, currentUser.getEmail());
        return ResultResponses.ok(orderNameService.updateOrderName(orderId, request.getName(), currentUser));
    }

    @PutMapping("/{orderId}/address")
    @Operation(summary = "Update order address", description = "Update shipping/billing address of a modifiable order (pending or confirmed)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order address updated successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be modified"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order or address not found")
    })
    public ResponseEntity<?> updateOrderAddress(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderAddressRequest request,
            @AuthenticationPrincipal User currentUser) {
        orderLog.logApiMutation("updateOrderAddress", orderId, currentUser.getEmail());
        return ResultResponses.ok(orderModificationService.updateOrderAddress(
                orderId, request.getShippingAddressId(), request.getBillingAddressId(), currentUser));
    }

    @PutMapping("/{orderId}/notes")
    @Operation(summary = "Update order notes", description = "Update notes of a modifiable order (pending or confirmed)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order notes updated successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be modified"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> updateOrderNotes(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderNotesRequest request,
            @AuthenticationPrincipal User currentUser) {
        orderLog.logApiMutation("updateOrderNotes", orderId, currentUser.getEmail());
        return ResultResponses.ok(orderModificationService.updateOrderNotes(orderId, request.getNotes(), currentUser));
    }
}
