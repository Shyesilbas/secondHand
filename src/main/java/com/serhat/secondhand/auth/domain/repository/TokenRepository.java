package com.serhat.secondhand.auth.domain.repository;

import com.serhat.secondhand.auth.domain.entity.Token;
import com.serhat.secondhand.auth.domain.entity.enums.TokenStatus;
import com.serhat.secondhand.auth.domain.entity.enums.TokenType;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    Optional<Token> findByToken(String token);

    Optional<Token> findByTokenAndTokenStatus(String token, TokenStatus tokenStatus);

    List<Token> findByUserAndTokenStatus(User user, TokenStatus tokenStatus);

    @Query("SELECT t FROM Token t WHERE t.expiresAt <= :now")
    List<Token> findExpiredTokens(@Param("now") LocalDateTime now);
    
    Optional<Token> findByTokenAndTokenTypeAndTokenStatus(String token, TokenType tokenType, TokenStatus tokenStatus);

    List<Token> findByUserAndTokenTypeAndTokenStatus(User user, TokenType tokenType, TokenStatus tokenStatus);
}
