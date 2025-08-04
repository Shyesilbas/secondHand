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
@Table(name = "credit_card")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "card_holder_id", nullable = false)
    private User cardHolder;

    @Column(nullable = false)
    private String number;
    
    @Column(nullable = false)
    private String cvv;
    
    @Column(nullable = false)
    private int expiryMonth;
    
    @Column(nullable = false)
    private int expiryYear;
    
    @Column(nullable = false)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;
    
    @Column(name = "credit_limit", nullable = false)
    private BigDecimal limit;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
