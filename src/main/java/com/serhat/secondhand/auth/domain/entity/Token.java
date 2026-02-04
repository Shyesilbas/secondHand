package com.serhat.secondhand.auth.domain.entity;

import com.serhat.secondhand.auth.domain.entity.enums.TokenStatus;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 1000)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenType tokenType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenStatus tokenStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "family_id")
    private UUID familyId;

    @Column(name = "parent_token_id")
    private UUID parentId;

    @Column(name = "remember_me", nullable = false, columnDefinition = "boolean not null default false")
    private boolean rememberMe;
}
