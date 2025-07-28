package com.serhat.secondhand.entity;

import com.serhat.secondhand.entity.enums.TokenStatus;
import com.serhat.secondhand.entity.enums.TokenType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens", indexes = {
    @Index(name = "idx_jti", columnList = "jti"),
    @Index(name = "idx_access_token_jti", columnList = "accessTokenJti"),
    @Index(name = "idx_refresh_token_jti", columnList = "refreshTokenJti"),
    @Index(name = "idx_user_token_type", columnList = "user_id, tokenType, tokenStatus")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 1000)
    private String token;

    @Column(name = "jti", nullable = false, unique = true, length = 36)
    private String jti; // JWT ID - unique identifier for this token

    @Column(name = "access_token_jti", length = 36)
    private String accessTokenJti; // JTI of the related access token (for refresh tokens)

    @Column(name = "refresh_token_jti", length = 36)
    private String refreshTokenJti; // JTI of the related refresh token (for access tokens)

    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false)
    private TokenType tokenType;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_status", nullable = false)
    private TokenStatus tokenStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

}
