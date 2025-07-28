package com.serhat.secondhand.service;

import com.serhat.secondhand.dto.TokenValidationResult;
import com.serhat.secondhand.entity.Token;
import com.serhat.secondhand.entity.User;
import com.serhat.secondhand.entity.enums.TokenStatus;
import com.serhat.secondhand.entity.enums.TokenType;
import com.serhat.secondhand.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;

@RequiredArgsConstructor
@Service
@Slf4j
public class TokenService {
    private final TokenRepository tokenRepository;

    public Token saveToken(String tokenValue, TokenType tokenType, User user, LocalDateTime expiresAt) {
        return saveTokenWithJti(tokenValue, UUID.randomUUID().toString(), tokenType, user, expiresAt, null);
    }

    public Token saveTokenWithJti(String tokenValue, String jti, TokenType tokenType, User user, LocalDateTime expiresAt, String accessTokenJti) {
        return saveTokenWithBidirectionalJti(tokenValue, jti, tokenType, user, expiresAt, accessTokenJti, null);
    }

    public Token saveTokenWithBidirectionalJti(String tokenValue, String jti, TokenType tokenType, User user, 
                                               LocalDateTime expiresAt, String accessTokenJti, String refreshTokenJti) {
        Token token = Token.builder()
                .token(tokenValue)
                .jti(jti)
                .accessTokenJti(accessTokenJti) // For refresh tokens, link to access token
                .refreshTokenJti(refreshTokenJti) // For access tokens, link to refresh token
                .tokenType(tokenType)
                .tokenStatus(TokenStatus.ACTIVE)
                .user(user)
                .expiresAt(expiresAt)
                .build();

        Token savedToken = tokenRepository.save(token);
        log.info("Token saved with bidirectional JTI - Type: {}, JTI: {}, AccessJTI: {}, RefreshJTI: {}, User: {}", 
                 tokenType, jti, accessTokenJti, refreshTokenJti, user.getUsername());
        return savedToken;
    }

    public List<Token> findActiveTokensByUser(User user) {
        return tokenRepository.findByUserAndTokenStatus(user, TokenStatus.ACTIVE);
    }

    public void revokeToken(String tokenValue) {
        tokenRepository.findByToken(tokenValue)
                .ifPresent(token -> {
                    token.setTokenStatus(TokenStatus.REVOKED);
                    tokenRepository.save(token);
                    log.info("Token revoked - JTI: {}, Type: {}", token.getJti(), token.getTokenType());
                });
    }

    public void revokeTokenByJti(String jti) {
        tokenRepository.findByJti(jti)
                .ifPresent(token -> {
                    token.setTokenStatus(TokenStatus.REVOKED);
                    tokenRepository.save(token);
                    log.info("Token revoked by JTI - JTI: {}, Type: {}", jti, token.getTokenType());
                });
    }

    public void revokeTokenByJtiWithLinked(String jti, boolean revokeLinked) {
        Optional<Token> tokenOpt = tokenRepository.findByJti(jti);
        if (tokenOpt.isPresent()) {
            Token token = tokenOpt.get();
            
            // Revoke the main token
            token.setTokenStatus(TokenStatus.REVOKED);
            tokenRepository.save(token);
            log.info("Token revoked by JTI - JTI: {}, Type: {}", jti, token.getTokenType());
            
            if (revokeLinked) {
                // Revoke linked tokens based on token type
                if (token.getTokenType() == TokenType.ACCESS_TOKEN && token.getRefreshTokenJti() != null) {
                    // Access token revoked → revoke linked refresh token
                    revokeTokenByJti(token.getRefreshTokenJti());
                    log.info("Linked refresh token revoked - RefreshJTI: {}", token.getRefreshTokenJti());
                    
                } else if (token.getTokenType() == TokenType.REFRESH_TOKEN && token.getAccessTokenJti() != null) {
                    // Refresh token revoked → revoke linked access token
                    revokeTokenByJti(token.getAccessTokenJti());
                    log.info("Linked access token revoked - AccessJTI: {}", token.getAccessTokenJti());
                }
            }
        }
    }

    public void revokeLinkedTokens(String accessTokenJti) {
        // Revoke refresh token linked to this access token
        List<Token> linkedTokens = tokenRepository.findByAccessTokenJtiAndTokenStatus(accessTokenJti, TokenStatus.ACTIVE);
        linkedTokens.forEach(token -> {
            token.setTokenStatus(TokenStatus.REVOKED);
            log.info("Linked token revoked - JTI: {}, Type: {}, Linked to: {}", 
                     token.getJti(), token.getTokenType(), accessTokenJti);
        });
        if (!linkedTokens.isEmpty()) {
            tokenRepository.saveAll(linkedTokens);
        }
    }

    public void revokeTokenPair(String accessTokenJti, String refreshTokenJti) {
        // Revoke both tokens in a pair synchronously
        List<Token> tokensToRevoke = new ArrayList<>();
        
        tokenRepository.findByJti(accessTokenJti).ifPresent(tokensToRevoke::add);
        tokenRepository.findByJti(refreshTokenJti).ifPresent(tokensToRevoke::add);
        
        tokensToRevoke.forEach(token -> {
            token.setTokenStatus(TokenStatus.REVOKED);
            log.info("Token pair revoked - JTI: {}, Type: {}", token.getJti(), token.getTokenType());
        });
        
        if (!tokensToRevoke.isEmpty()) {
            tokenRepository.saveAll(tokensToRevoke);
            log.info("Token pair revocation completed - AccessJTI: {}, RefreshJTI: {}", accessTokenJti, refreshTokenJti);
        }
    }

    public void revokeAllUserTokens(User user) {
        List<Token> activeTokens = findActiveTokensByUser(user);
        activeTokens.forEach(token -> token.setTokenStatus(TokenStatus.REVOKED));
        tokenRepository.saveAll(activeTokens);
        log.info("Revoked {} active tokens for user: {}", activeTokens.size(), user.getUsername());
    }

    public void revokeUserTokensByType(User user, TokenType tokenType) {
        List<Token> activeTokens = tokenRepository.findByUserAndTokenTypeAndTokenStatus(user, tokenType, TokenStatus.ACTIVE);
        activeTokens.forEach(token -> token.setTokenStatus(TokenStatus.REVOKED));
        tokenRepository.saveAll(activeTokens);
        log.info("Revoked {} active {} tokens for user: {}", activeTokens.size(), tokenType, user.getUsername());
    }

    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<Token> expiredTokens = tokenRepository.findExpiredTokens(now);

        if (!expiredTokens.isEmpty()) {
            expiredTokens.forEach(token -> {
                token.setTokenStatus(TokenStatus.EXPIRED);
                log.debug("Expired token: JTI: {} - Type: {} - User: {}",
                        token.getJti(),
                        token.getTokenType(),
                        token.getUser().getUsername());
            });

            tokenRepository.saveAll(expiredTokens);
        } else {
            log.debug("No expired tokens found to cleanup");
        }
    }

    public boolean isTokenValid(String tokenValue) {
        return tokenRepository.findByTokenAndTokenStatus(tokenValue, TokenStatus.ACTIVE)
                .map(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    public boolean isTokenValidByJti(String jti) {
        return tokenRepository.findByJtiAndTokenStatus(jti, TokenStatus.ACTIVE)
                .map(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    public Optional<Token> findByJti(String jti) {
        return tokenRepository.findByJti(jti);
    }

    public TokenValidationResult validateTokenByJti(String jti) {
        Optional<Token> tokenOpt = tokenRepository.findByJti(jti);
        
        if (tokenOpt.isEmpty()) {
            return TokenValidationResult.notFound();
        }
        
        Token token = tokenOpt.get();
        
        // Check if token is revoked
        if (token.getTokenStatus() == TokenStatus.REVOKED) {
            return TokenValidationResult.revoked();
        }
        
        // Check if token is expired (either by status or by time)
        if (token.getTokenStatus() == TokenStatus.EXPIRED || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return TokenValidationResult.expired();
        }
        
        // Token is active and not expired
        if (token.getTokenStatus() == TokenStatus.ACTIVE) {
            return TokenValidationResult.valid();
        }
        
        // Default case - treat as not found
        return TokenValidationResult.notFound();
    }
}
