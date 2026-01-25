package com.serhat.secondhand.payment.repo;

import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {


    @Query("SELECT p FROM Payment p WHERE p.fromUser.id = :userId OR p.toUser.id = :userId")
    Page<Payment> findByUserId(@Param("userId") Long userId, Pageable pageable);

    List<Payment> findByFromUserIdOrToUserId(Long fromUserId, Long toUserId);

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    Optional<Payment> findByIdempotencyKeyAndFromUserId(String idempotencyKey, Long fromUserId);


    @Query("SELECT p FROM Payment p " +
            "LEFT JOIN p.toUser tu " +
            "WHERE " +
            "(p.fromUser.id = :userId OR p.toUser.id = :userId) AND " +
            "(:transactionType IS NULL OR p.transactionType = :transactionType) AND " +
            "(:paymentType IS NULL OR p.paymentType = :paymentType) AND " +
            "(:paymentDirection IS NULL OR p.paymentDirection = :paymentDirection) AND " +
            "(:dateFrom IS NULL OR p.processedAt >= :dateFrom) AND " +
            "(:dateTo IS NULL OR p.processedAt <= :dateTo) AND " +
            "(:amountMin IS NULL OR p.amount >= :amountMin) AND " +
            "(:amountMax IS NULL OR p.amount <= :amountMax) AND " +
            "(:sellerName IS NULL OR LOWER(CONCAT(COALESCE(tu.name, ''), ' ', COALESCE(tu.surname, ''))) LIKE LOWER(CONCAT('%', :sellerName, '%')))")
    Page<Payment> findByFilters(
            @Param("userId") Long userId,
            @Param("transactionType") PaymentTransactionType transactionType,
            @Param("paymentType") PaymentType paymentType,
            @Param("paymentDirection") PaymentDirection paymentDirection,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("amountMin") BigDecimal amountMin,
            @Param("amountMax") BigDecimal amountMax,
            @Param("sellerName") String sellerName,
            Pageable pageable);
}