package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.entity.enums.TokenStatus;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.auth.domain.repository.TokenRepository;
import com.serhat.secondhand.user.domain.entity.User;
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
        Token token = new Token();
        token.setToken(tokenValue);
        token.setTokenType(tokenType);
        token.setTokenStatus(TokenStatus.ACTIVE);
        token.setUser(user);
        token.setExpiresAt(expiresAt);

        Token savedToken = tokenRepository.save(token);
        log.info("Token saved - Type: {}, User: {}", tokenType, user.getUsername());
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
                    log.info("Token revoked - Type: {}", token.getTokenType());
                });
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
                log.debug("Expired token: Type: {} - User: {}",
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

    public Token createPasswordResetToken(User user, String tokenValue, LocalDateTime expiresAt) {
        revokeUserTokensByType(user, TokenType.PASSWORD_RESET);
        
        return saveToken(tokenValue, TokenType.PASSWORD_RESET, user, expiresAt);
    }

    public Optional<Token> findPasswordResetToken(String tokenValue) {
        return tokenRepository.findByTokenAndTokenTypeAndTokenStatus(
            tokenValue, TokenType.PASSWORD_RESET, TokenStatus.ACTIVE
        );
    }

    public User validateAndGetUserByPasswordResetToken(String tokenValue) {
        return findPasswordResetToken(tokenValue)
                .filter(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(Token::getUser)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
    }

    public boolean isPasswordResetTokenValid(String tokenValue) {
        return findPasswordResetToken(tokenValue)
                .map(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    public void revokePasswordResetToken(String tokenValue) {
        tokenRepository.findByTokenAndTokenTypeAndTokenStatus(
            tokenValue, TokenType.PASSWORD_RESET, TokenStatus.ACTIVE
        ).ifPresent(token -> {
            token.setTokenStatus(TokenStatus.REVOKED);
            tokenRepository.save(token);
            log.info("Password reset token revoked - User: {}", 
                     token.getUser().getUsername());
        });
    }
}
