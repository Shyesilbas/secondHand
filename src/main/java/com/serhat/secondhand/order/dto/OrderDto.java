package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.payment.entity.PaymentStatus;

import com.serhat.secondhand.order.entity.enums.OrderAction;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.shipping.dto.ShippingDto;
import com.serhat.secondhand.user.domain.dto.AddressDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {

    private Long id;
    private String orderNumber;
    private String name;
    private Long userId;
    private String buyerName;
    private String buyerSurname;
    private String buyerEmail;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal subtotal;
    private BigDecimal campaignDiscount;
    private String couponCode;
    private BigDecimal couponDiscount;
    private BigDecimal discountTotal;
    private Currency currency;
    private AddressDto shippingAddress;
    private AddressDto billingAddress;
    private String notes;
    private String paymentReference;
    private PaymentStatus paymentStatus;
    private String paymentProviderName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDto> orderItems;
    private ShippingDto shipping;

    private com.serhat.secondhand.order.entity.enums.DeliveryMethod deliveryMethod;
    private String meetupLocation;
    private String meetupVerificationCode;
    private int verificationAttempts;
    private LocalDateTime verificationLockedUntil;
    private LocalDateTime meetupVerifiedAt;
    private LocalDateTime meetupVerificationCodeGeneratedAt;

    /** Populated only in seller view (getSellerOrders / getSellerOrderById). Null in buyer view. */
    private BigDecimal escrowAmount;

    private LocalDateTime completedAt;
    private Long completedByUserId;
    private String completedByUserName;

    private String buyerPhone;
    private String sellerPhone;
    private String sellerFullName;

    // Viewer-specific state from OrderViewPolicy; set on read endpoints, null on write-path responses.
    /** Operations the current viewer may start; the frontend renders controls only for these. */
    private Set<OrderAction> allowedActions;
    /** Buyer view, DELIVERED only: last moment a refund is accepted. */
    private LocalDateTime refundDeadline;
    /** Unshipped cargo orders: the scheduler cancels the order after this. */
    private LocalDateTime shipDeadline;
    /** DELIVERED / HANDOVER_CONFIRMED: earliest automatic completion and escrow release. */
    private LocalDateTime autoCompleteAt;
    /** Buyer view, MEETUP_PENDING only: the current OTP/QR code stops being accepted. */
    private LocalDateTime meetupCodeExpiresAt;
    /** Seller view only: this seller's share (escrow amounts held or released, excluding cancelled/refunded lines). */
    private BigDecimal sellerTotal;
}
