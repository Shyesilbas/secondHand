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
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private BigDecimal amount;

    private UUID listingId;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

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
    @JoinColumn(name = "to_user_id", nullable = false)
    private User toUser;



}
