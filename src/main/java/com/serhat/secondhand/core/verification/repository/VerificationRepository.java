package com.serhat.secondhand.core.verification.repository;

import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.Verification;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, UUID> {
    
    @Query("SELECT v FROM Verification v WHERE v.user = :user AND v.codeType = :codeType AND v.isVerified = false AND v.codeExpiresAt > :currentTime ORDER BY v.createdAt DESC")
    Optional<Verification> findLatestActiveVerificationByUserAndCodeType(@Param("user") User user, @Param("codeType") CodeType codeType, @Param("currentTime") LocalDateTime currentTime);
    

    /** Row-locked lookup: a concurrent request with the same code waits, then no longer matches once it is used. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Verification v WHERE v.user = :user AND v.codeType = :codeType AND v.code = :code AND v.isVerified = false AND v.codeExpiresAt > :currentTime")
    Optional<Verification> findActiveVerificationForUpdate(@Param("user") User user, @Param("codeType") CodeType codeType, @Param("code") String code, @Param("currentTime") LocalDateTime currentTime);

        Optional<Verification> findTopByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfterOrderByCreatedAtDesc(User user, CodeType codeType, LocalDateTime currentTime);

    List<Verification> findByUserAndCodeTypeAndIsVerifiedFalseAndCodeExpiresAtAfter(User user, CodeType codeType, LocalDateTime currentTime);
}
