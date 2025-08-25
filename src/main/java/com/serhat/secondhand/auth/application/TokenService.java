package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.entity.enums.TokenStatus;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.auth.domain.repository.TokenRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Slf4j
public class TokenService {

    private final TokenRepository tokenRepository;

    @Transactional
    public Token saveToken(String tokenValue, TokenType tokenType, User user, LocalDateTime expiresAt, Token oldRefreshToken) {
        Token token = new Token();
        token.setToken(tokenValue);
        token.setTokenType(tokenType);
        token.setTokenStatus(TokenStatus.ACTIVE);
        token.setUser(user);
        token.setExpiresAt(expiresAt);

        if (tokenType == TokenType.REFRESH_TOKEN) {
            if (oldRefreshToken == null) {
                token.setFamilyId(UUID.randomUUID());
            } else {
                token.setFamilyId(oldRefreshToken.getFamilyId());
                token.setParentId(oldRefreshToken.getId());
            }
        }

        Token savedToken = tokenRepository.save(token);
        log.info("Token saved - Type: {}, User: {}", tokenType, user.getUsername());
        return savedToken;
    }

    public List<Token> findActiveTokensByUser(User user) {
        return tokenRepository.findByUserAndTokenStatus(user, TokenStatus.ACTIVE);
    }

    @Transactional
    public void revokeToken(String tokenValue) {
        tokenRepository.findByToken(tokenValue)
                .ifPresent(token -> {
                    token.setTokenStatus(TokenStatus.REVOKED);
                    tokenRepository.save(token);
                    log.info("Token revoked - Type: {}, User: {}", token.getTokenType(), token.getUser().getUsername());
                });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        List<Token> activeTokens = findActiveTokensByUser(user);
        if (!activeTokens.isEmpty()) {
            activeTokens.forEach(token -> token.setTokenStatus(TokenStatus.REVOKED));
            tokenRepository.saveAll(activeTokens);
            log.info("Revoked {} active tokens for user: {}", activeTokens.size(), user.getUsername());
        }
    }

    @Transactional
    public void revokeUserTokensByType(User user, TokenType tokenType) {
        List<Token> activeTokens = tokenRepository.findByUserAndTokenTypeAndTokenStatus(user, tokenType, TokenStatus.ACTIVE);
        if (!activeTokens.isEmpty()) {
            activeTokens.forEach(token -> token.setTokenStatus(TokenStatus.REVOKED));
            tokenRepository.saveAll(activeTokens);
            log.info("Revoked {} active {} tokens for user: {}", activeTokens.size(), tokenType, user.getUsername());
        }
    }

    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<Token> expiredTokens = tokenRepository.findExpiredTokens(now);

        if (!expiredTokens.isEmpty()) {
            expiredTokens.forEach(token -> token.setTokenStatus(TokenStatus.EXPIRED));
            tokenRepository.saveAll(expiredTokens);
            log.info("Cleaned up {} expired tokens", expiredTokens.size());
        } else {
            log.debug("No expired tokens found to cleanup");
        }
    }

    public boolean isTokenValid(String tokenValue) {
        return tokenRepository.findByTokenAndTokenStatus(tokenValue, TokenStatus.ACTIVE)
                .map(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    public Optional<Token> findByToken(String tokenValue) {
        return tokenRepository.findByToken(tokenValue);
    }

    public Optional<Token> findByUserAndType(User user, TokenType tokenType) {
        return tokenRepository.findByUserAndTokenTypeAndTokenStatus(user, tokenType, TokenStatus.ACTIVE)
                .stream().findFirst();
    }


    public Optional<TokenStatus> getTokenStatus(String tokenValue) {
        return tokenRepository.findByToken(tokenValue).map(Token::getTokenStatus);
    }
}
