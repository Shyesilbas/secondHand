package com.serhat.secondhand.repository;

import com.serhat.secondhand.entity.Token;
import com.serhat.secondhand.entity.User;
import com.serhat.secondhand.entity.enums.TokenStatus;
import com.serhat.secondhand.entity.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token,Long> {

    Optional<Token> findByToken(String token);

    Optional<Token> findByTokenAndTokenStatus(String token, TokenStatus tokenStatus);

    List<Token> findByUserAndTokenStatus(User user, TokenStatus tokenStatus);

    List<Token> findByUserAndTokenTypeAndTokenStatus(User user, TokenType tokenType, TokenStatus tokenStatus);

    List<Token> findByUserAndTokenType(User user, TokenType tokenType);

    @Query("SELECT t FROM Token t WHERE t.expiresAt < :currentTime AND t.tokenStatus = 'ACTIVE'")
    List<Token> findExpiredTokens(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT t FROM Token t WHERE t.user.id = :userId AND t.tokenStatus = 'ACTIVE'")
    List<Token> findActiveTokensByUserId(@Param("userId") Long userId);

    void deleteByUser(User user);

    void deleteByTokenStatus(TokenStatus tokenStatus);

}
