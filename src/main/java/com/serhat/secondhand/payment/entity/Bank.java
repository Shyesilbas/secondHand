package com.serhat.secondhand.payment.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bank")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bank {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "to_user_id", nullable = false)
    private User accountHolder;

    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDateTime createdAt;

    private String IBAN;

}
