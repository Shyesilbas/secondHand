package com.serhat.secondhand.ewallet.entity;

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
@Table(name = "ewallet")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal balance;

    @Column(precision = 19, scale = 2)
    private BigDecimal walletLimit;

    @Column(precision = 19, scale = 2)
    private BigDecimal spendingWarningLimit;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

}
