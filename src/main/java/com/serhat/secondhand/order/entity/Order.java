package com.serhat.secondhand.order.entity;

import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.entity.enums.Carrier;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Getter @Setter
@EqualsAndHashCode(of = "externalId")
@ToString(exclude = {"shipping", "orderItems", "user", "shippingAddress", "billingAddress"})
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
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

    @Column(name = "external_id", unique = true)
    @Builder.Default
    private UUID externalId = UUID.randomUUID();

    @PrePersist
    protected void onCreate() {
        if (this.externalId == null) {
            this.externalId = UUID.randomUUID();
        }
    }

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

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", length = 10, nullable = false)
    @Builder.Default
    private Currency currency = Currency.TRY;

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
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Shipping shipping;

    public Order(String orderNumber, User user, Address shippingAddress, Address billingAddress, 
                 BigDecimal totalAmount, Currency currency, String notes, String name) {
        this.orderNumber = orderNumber;
        this.user = user;
        this.shippingAddress = shippingAddress;
        this.billingAddress = billingAddress;
        this.totalAmount = totalAmount;
        this.currency = currency != null ? currency : Currency.TRY;
        this.notes = notes;
        this.name = name;
        this.status = OrderStatus.PENDING;
        this.paymentStatus = PaymentStatus.PENDING;
        this.externalId = UUID.randomUUID();
        this.orderItems = new ArrayList<>();
    }

    public void addItem(OrderItem item) {
        if (this.orderItems == null) {
            this.orderItems = new ArrayList<>();
        }
        this.orderItems.add(item);
        item.setOrder(this);
        calculateTotals();
    }

    public void calculateTotals() {
        this.subtotal = orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // subtotal already includes campaign discounts (unit prices are campaign prices)
        BigDecimal couponAmt = couponDiscount != null ? couponDiscount : BigDecimal.ZERO;
        this.totalAmount = subtotal.subtract(couponAmt).max(BigDecimal.ZERO);
        
        BigDecimal totalDisc = couponAmt;
        if (campaignDiscount != null) totalDisc = totalDisc.add(campaignDiscount);
        this.discountTotal = totalDisc;
    }

    public void confirm() {
        if (this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be confirmed");
        }
        this.status = OrderStatus.CONFIRMED;
    }

    public void cancel() {
        if (!this.status.isCancellable()) {
            throw new IllegalStateException("Order in status " + this.status + " cannot be cancelled");
        }
        this.status = OrderStatus.CANCELLED;
    }

    public void markAsPaid(String reference) {
        this.paymentStatus = PaymentStatus.COMPLETED;
        this.paymentReference = reference;
        if (this.status == OrderStatus.PENDING) {
            this.status = OrderStatus.CONFIRMED;
        }
    }

    public void updateAddress(Address shippingAddress, Address billingAddress) {
        if (!this.status.isModifiable()) {
            throw new IllegalStateException("Order is not modifiable in status " + this.status);
        }
        this.shippingAddress = shippingAddress;
        this.billingAddress = billingAddress;
    }

    public void updateNotes(String notes) {
        if (!this.status.isModifiable()) {
            throw new IllegalStateException("Order is not modifiable in status " + this.status);
        }
        this.notes = notes;
    }

    public void markAsProcessing() {
        if (this.status != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed orders can be moved to processing");
        }
        this.status = OrderStatus.PROCESSING;
        this.setUpdatedAt(LocalDateTime.now());
    }

    public void markAsShipped(Carrier carrier, String trackingNumber) {
        if (this.status != OrderStatus.PROCESSING) {
            throw new IllegalStateException("Only processing orders can be moved to shipped");
        }
        this.status = OrderStatus.SHIPPED;
        this.setUpdatedAt(LocalDateTime.now());
        if (this.shipping != null) {
            this.shipping.ship(carrier, trackingNumber);
        }
    }

    public void markAsDelivered() {
        if (this.status != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Only shipped orders can be moved to delivered");
        }
        this.status = OrderStatus.DELIVERED;
        this.setUpdatedAt(LocalDateTime.now());
        if (this.shipping != null) {
            this.shipping.markAsDelivered();
        }
    }

    public void applyCompletion() {
        this.status = OrderStatus.COMPLETED;
        if (this.shipping != null && this.shipping.getStatus() != ShippingStatus.DELIVERED) {
            this.shipping.setStatus(ShippingStatus.DELIVERED);
            this.shipping.setDeliveredAt(LocalDateTime.now());
        }
    }

    public void applyCancellation(boolean allItemsCancelled) {
        if (allItemsCancelled) {
            this.status = OrderStatus.CANCELLED;
            if (this.shipping != null) {
                this.shipping.setStatus(ShippingStatus.CANCELLED);
            }
            this.paymentStatus = PaymentStatus.REFUNDED;
        } else {
            this.paymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
        }
    }

    public void applyRefund(boolean allItemsRefunded) {
        if (allItemsRefunded) {
            this.status = OrderStatus.REFUNDED;
            this.paymentStatus = PaymentStatus.REFUNDED;
        } else {
            this.paymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
        }
    }
}
