package com.serhat.secondhand.order.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.PaymentService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderPaymentService {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;


    public PaymentProcessingResult processOrderPayments(User user, List<Cart> cartItems, 
                                                      CheckoutRequest request, Order order) {
        log.info("Processing payments for order: {}", order.getOrderNumber());

        try {
            List<PaymentRequest> paymentRequests = createPaymentRequests(user, cartItems, request);
            List<PaymentDto> paymentResults = paymentService.createPurchasePayments(paymentRequests, getAuthentication());
            
            boolean allPaymentsSuccessful = paymentResults.stream().allMatch(PaymentDto::isSuccess);
            updateOrderPaymentStatus(order, paymentResults, allPaymentsSuccessful);

            return new PaymentProcessingResult(paymentResults, allPaymentsSuccessful);
            
        } catch (BusinessException e) {
            log.error("Payment failed for order: {} - {}", order.getOrderNumber(), e.getMessage());
            handlePaymentFailure(order, e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected payment error for order: {}", order.getOrderNumber(), e);
            handlePaymentFailure(order, e);
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

        private List<PaymentRequest> createPaymentRequests(User user, List<Cart> cartItems, CheckoutRequest request) {
        var paymentsBySeller = groupCartItemsBySeller(cartItems);
        List<PaymentRequest> paymentRequests = new ArrayList<>();

        for (var entry : paymentsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            List<Cart> sellerItems = entry.getValue();
            
            PaymentRequest paymentRequest = createPaymentRequestForSeller(user, sellerId, sellerItems, request);
            paymentRequests.add(paymentRequest);
        }

        log.debug("Created {} payment requests for order", paymentRequests.size());
        return paymentRequests;
    }

        private Map<Long, List<Cart>> groupCartItemsBySeller(List<Cart> cartItems) {
        return cartItems.stream()
                .collect(Collectors.groupingBy(cart -> cart.getListing().getSeller().getId()));
    }

        private PaymentRequest createPaymentRequestForSeller(User user, Long sellerId, List<Cart> sellerItems, CheckoutRequest request) {
        BigDecimal sellerTotal = calculateSellerTotal(sellerItems);
        var sellerInfo = getSellerInfo(sellerItems);

        return PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(sellerId)
                .receiverName(sellerInfo.name())
                .receiverSurname(sellerInfo.surname())
                .listingId(null)
                .amount(sellerTotal)
                .paymentType(resolvePaymentType(request))
                .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                .paymentDirection(PaymentDirection.OUTGOING)
                .build();
    }

        private BigDecimal calculateSellerTotal(List<Cart> sellerItems) {
        return sellerItems.stream()
                .map(cart -> cart.getListing().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

        private SellerInfo getSellerInfo(List<Cart> sellerItems) {
        var seller = sellerItems.get(0).getListing().getSeller();
        return new SellerInfo(seller.getName(), seller.getSurname());
    }

        private PaymentType resolvePaymentType(CheckoutRequest request) {
        return request.getPaymentType() != null ? request.getPaymentType() : PaymentType.CREDIT_CARD;
    }

        private void updateOrderPaymentStatus(Order order, List<PaymentDto> paymentResults, boolean allSuccessful) {
        order.setPaymentReference(paymentResults.get(0).paymentId().toString());
        order.setPaymentStatus(allSuccessful ? Order.PaymentStatus.PAID : Order.PaymentStatus.FAILED);
        order.setStatus(allSuccessful ? Order.OrderStatus.CONFIRMED : Order.OrderStatus.CANCELLED);
        
        orderRepository.save(order);
        log.info("Updated order {} payment status to: {}", order.getOrderNumber(), order.getPaymentStatus());
    }


    private void handlePaymentFailure(Order order, Exception exception) {
        order.setPaymentStatus(Order.PaymentStatus.FAILED);
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.error("Order {} marked as failed due to payment error", order.getOrderNumber());
    }


    private Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }


    private record SellerInfo(String name, String surname) {}


        public record PaymentProcessingResult(List<PaymentDto> paymentResults, boolean allSuccessful) {

    }
}
