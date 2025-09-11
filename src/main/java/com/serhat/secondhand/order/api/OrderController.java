package com.serhat.secondhand.order.api;

import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.service.OrderService;
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

    private final OrderService orderService;

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
        OrderDto order = orderService.checkout(currentUser, request);
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
            @PageableDefault(size = 10) Pageable pageable) {
        log.info("API request to get orders for user: {}", currentUser.getEmail());
        Page<OrderDto> orders = orderService.getUserOrders(currentUser, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
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
        OrderDto order = orderService.getOrderById(orderId, currentUser);
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
        OrderDto order = orderService.getOrderByOrderNumber(orderNumber, currentUser);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel a pending or confirmed order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User currentUser) {
        log.info("API request to cancel order: {} for user: {}", orderId, currentUser.getEmail());
        OrderDto order = orderService.cancelOrder(orderId, currentUser);
        return ResponseEntity.ok(order);
    }
}
