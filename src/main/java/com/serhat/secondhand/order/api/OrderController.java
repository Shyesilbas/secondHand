package com.serhat.secondhand.order.api;

import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderCancelRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderRefundRequest;
import com.serhat.secondhand.payment.service.CheckoutService;
import com.serhat.secondhand.order.service.OrderCancellationService;
import com.serhat.secondhand.order.service.OrderCompletionService;
import com.serhat.secondhand.order.service.OrderNameService;
import com.serhat.secondhand.order.service.OrderQueryService;
import com.serhat.secondhand.order.service.OrderRefundService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/checkout")
    @Operation(summary = "Checkout cart items", description = "Create order from cart items and process payment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<OrderDto> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to checkout for user: {}", currentUser.getEmail());
        OrderDto order = checkoutService.checkout(currentUser, request);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @Operation(summary = "Get user orders", description = "Retrieve paginated list of user's orders")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<OrderDto>> getUserOrders(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 5) Pageable pageable) {
        log.info("API request to get orders for user: {}", currentUser.getEmail());
        Page<OrderDto> orders = orderQueryService.getUserOrders(currentUser, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/details/{orderId}")
    @Operation(summary = "Get order by ID", description = "Retrieve specific order details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderDto> getOrderById(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to get order by ID: {} for user: {}", orderId, currentUser.getEmail());
        OrderDto order = orderQueryService.getOrderById(orderId, currentUser);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/order-number/{orderNumber}")
    @Operation(summary = "Get order by order number", description = "Retrieve specific order by order number")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderDto> getOrderByOrderNumber(
            @PathVariable String orderNumber,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to get order by order number: {} for user: {}", orderNumber, currentUser.getEmail());
        OrderDto order = orderQueryService.getOrderByOrderNumber(orderNumber, currentUser);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel a confirmed order (partial or full)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderCancelRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to cancel order: {} for user: {}", orderId, currentUser.getEmail());
        OrderDto order = orderCancellationService.cancelOrder(orderId, request, currentUser);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/refund")
    @Operation(summary = "Refund order", description = "Refund a delivered order within 48 hours (partial or full)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order refunded successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be refunded"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderDto> refundOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderRefundRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to refund order: {} for user: {}", orderId, currentUser.getEmail());
        OrderDto order = orderRefundService.refundOrder(orderId, request, currentUser);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/complete")
    @Operation(summary = "Complete order", description = "Manually complete a delivered order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order completed successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be completed"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderDto> completeOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to complete order: {} for user: {}", orderId, currentUser.getEmail());
        OrderDto order = orderCompletionService.completeOrder(orderId, currentUser);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/name")
    @Operation(summary = "Update order name", description = "Update the name of an order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order name updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid order name"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderDto> updateOrderName(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderNameRequest request,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to update order name: {} for user: {}", orderId, currentUser.getEmail());
        OrderDto order = orderNameService.updateOrderName(orderId, request.getName(), currentUser);
        return ResponseEntity.ok(order);
    }

    public static class UpdateOrderNameRequest {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
