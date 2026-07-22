package com.serhat.secondhand.payment.entity;

import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment", indexes = {
    @Index(name = "idx_payment_from_user_idempotency", columnList = "from_user_id,idempotency_key")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Version
    @Builder.Default
    private Long version = 0L;

    private BigDecimal amount;
    
    @Builder.Default
    private String currency = "TRY";

    private UUID listingId;

    @Column(name = "order_item_id")
    private Long orderItemId;
	    
    private String listingTitle;
    
    private String listingNo;

    @Column(name = "provider_name", length = 50)
    private String providerName;

    @Column(name = "provider_transaction_id", length = 100)
    private String providerTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private PaymentTransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_direction", nullable = false)
    private PaymentDirection paymentDirection;

    private LocalDateTime processedAt;

    private boolean isSuccess;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_id", nullable = false)
    private User fromUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user_id", nullable = true)
    private User toUser;

    @Column(name = "idempotency_key", nullable = true, length = 255)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.COMPLETED;

    private UUID orderId;
    
    @Column(columnDefinition = "TEXT")
    private String description;

}
