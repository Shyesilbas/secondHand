package com.serhat.secondhand.service;

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

@RequiredArgsConstructor
@Service
@Slf4j
public class TokenService {
    private final TokenRepository tokenRepository;

    public Token saveToken(String tokenValue, TokenType tokenType, User user, LocalDateTime expiresAt) {
        Token token = Token.builder()
                .token(tokenValue)
                .tokenType(tokenType)
                .tokenStatus(TokenStatus.ACTIVE)
                .user(user)
                .expiresAt(expiresAt)
                .build();

        Token savedToken = tokenRepository.save(token);
        log.info("Token saved to database - Type: {}, User: {}, ID: {}", tokenType, user.getUsername(), savedToken.getId());
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
                });
    }

    public void revokeAllUserTokens(User user) {
        List<Token> activeTokens = findActiveTokensByUser(user);
        activeTokens.forEach(token -> token.setTokenStatus(TokenStatus.REVOKED));
        tokenRepository.saveAll(activeTokens);
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
                log.debug(" Expired token: {} - Type: {} - User: {}",
                        token.getToken().substring(0, 10) + "...",
                        token.getTokenType(),
                        token.getUser().getUsername());
            });

            tokenRepository.saveAll(expiredTokens);
        } else {
            log.debug("️ No expired tokens found to cleanup");
        }
    }

    public boolean isTokenValid(String tokenValue) {
        return tokenRepository.findByTokenAndTokenStatus(tokenValue, TokenStatus.ACTIVE)
                .map(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }
}
