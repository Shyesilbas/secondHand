package com.serhat.secondhand.payment.repository;

import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID>, JpaSpecificationExecutor<Payment> {

    List<Payment> findByOrderIdAndToUserId(UUID orderId, Long toUserId);

    List<Payment> findByOrderIdAndToUserIdAndOrderItemId(UUID orderId, Long toUserId, Long orderItemId);


    @Query("SELECT p FROM Payment p " +
           "LEFT JOIN FETCH p.fromUser " +
           "LEFT JOIN FETCH p.toUser " +
           "WHERE p.fromUser.id = :userId OR p.toUser.id = :userId")
    Page<Payment> findByUserId(@Param("userId") Long userId, Pageable pageable);


    @Query("SELECT COUNT(p), " +
            "SUM(CASE WHEN p.isSuccess = true THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN (p.toUser.id = :userId AND (p.fromUser.id IS NULL OR p.fromUser.id != :userId) AND p.isSuccess = true AND p.status = 'COMPLETED') THEN p.amount ELSE 0 END), " +
            "SUM(CASE WHEN (p.fromUser.id = :userId AND (p.toUser.id IS NULL OR p.toUser.id != :userId) AND p.isSuccess = true) THEN p.amount ELSE 0 END), " +
            "SUM(CASE WHEN (p.toUser.id = :userId AND (p.fromUser.id IS NULL OR p.fromUser.id != :userId) AND p.status = 'ESCROW') THEN p.amount ELSE 0 END) " +
            "FROM Payment p WHERE (p.fromUser.id = :userId OR p.toUser.id = :userId) " +
            "AND (:type IS NULL OR p.paymentType = :type)")
    List<Object[]> getPaymentStats(@Param("userId") Long userId, @Param("type") PaymentType type);


    Optional<Payment> findByIdempotencyKeyAndFromUserId(String idempotencyKey, Long fromUserId);




    @Query("SELECT SUM(p.amount) FROM Payment p " +
           "WHERE p.fromUser.id = :userId " +
           "AND p.paymentType = com.serhat.secondhand.payment.entity.PaymentType.EWALLET " +
           "AND p.paymentDirection = com.serhat.secondhand.payment.entity.PaymentDirection.OUTGOING " +
           "AND p.processedAt >= :startOfMonth " +
           "AND p.isSuccess = true")
    BigDecimal sumMonthlyEwalletSpending(@Param("userId") Long userId, @Param("startOfMonth") LocalDateTime startOfMonth);
}
