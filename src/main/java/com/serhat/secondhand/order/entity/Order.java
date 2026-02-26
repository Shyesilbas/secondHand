package com.serhat.secondhand.order.entity;

import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Data
@EqualsAndHashCode(exclude = {"shipping", "orderItems"})
@ToString(exclude = {"shipping", "orderItems", "user", "shippingAddress", "billingAddress"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_user", columnList = "user_id"),
    @Index(name = "idx_order_status", columnList = "status"),
    @Index(name = "idx_order_payment_status", columnList = "payment_status"),
    @Index(name = "idx_order_created", columnList = "created_at"),
    @Index(name = "idx_order_number", columnList = "order_number")
})
@EntityListeners(AuditingEntityListener.class)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "campaign_discount", precision = 10, scale = 2)
    private BigDecimal campaignDiscount;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "coupon_discount", precision = 10, scale = 2)
    private BigDecimal couponDiscount;

    @Column(name = "discount_total", precision = 10, scale = 2)
    private BigDecimal discountTotal;

    @Column(name = "currency", length = 3, nullable = false)
    @Builder.Default
    private String currency = "TRY";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_address_id", nullable = false)
    private Address shippingAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_address_id")
    private Address billingAddress;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_method")
    @Enumerated(EnumType.STRING)
    private PaymentType paymentMethod;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Shipping shipping;

    @Getter
    public enum OrderStatus {
        PENDING("Pending"),
        CONFIRMED("Confirmed"),
        PROCESSING("Processing"),
        SHIPPED("Shipped"),
        DELIVERED("Delivered"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        REFUNDED("Refunded");

        private final String displayName;

        OrderStatus(String displayName) {
            this.displayName = displayName;
        }

        /**
         * Statuses in which an order can be cancelled by the buyer.
         */
        public static final Set<OrderStatus> CANCELLABLE_STATUSES =
                EnumSet.of(PENDING, CONFIRMED);

        /**
         * Statuses in which an order can be refunded by the buyer.
         */
        public static final Set<OrderStatus> REFUNDABLE_STATUSES =
                EnumSet.of(DELIVERED);

        /**
         * Statuses in which the order details (address, notes) can still be modified.
         */
        public static final Set<OrderStatus> MODIFIABLE_STATUSES =
                EnumSet.of(PENDING, CONFIRMED);

        /**
         * Statuses in which an order can be completed (buyer confirms receipt).
         */
        public static final Set<OrderStatus> COMPLETABLE_STATUSES =
                EnumSet.of(DELIVERED);

        public boolean isCancellable() {
            return CANCELLABLE_STATUSES.contains(this);
        }

        public boolean isRefundable() {
            return REFUNDABLE_STATUSES.contains(this);
        }

        public boolean isModifiable() {
            return MODIFIABLE_STATUSES.contains(this);
        }

        public boolean isCompletable() {
            return COMPLETABLE_STATUSES.contains(this);
        }
    }

    @Getter
    public enum PaymentStatus {
        PENDING("Pending"),
        PAID("Paid"),
        FAILED("Failed"),
        REFUNDED("Refunded"),
        PARTIALLY_REFUNDED("Partially Refunded");

        private final String displayName;

        PaymentStatus(String displayName) {
            this.displayName = displayName;
        }

    }
}
