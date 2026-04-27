package com.serhat.secondhand.payment.repository;

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

    List<Payment> findByOrderIdAndToUserId(UUID orderId, Long toUserId);


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


    @Query("SELECT p FROM Payment p " +
            "LEFT JOIN FETCH p.fromUser fu " +
            "LEFT JOIN FETCH p.toUser tu " +
            "WHERE " +
            "(p.fromUser.id = :userId OR p.toUser.id = :userId) AND " +
            "(:transactionType IS NULL OR p.transactionType = :transactionType OR " +
            "  (:transactionType = com.serhat.secondhand.payment.entity.PaymentTransactionType.ITEM_SALE AND p.transactionType = com.serhat.secondhand.payment.entity.PaymentTransactionType.ITEM_PURCHASE AND p.toUser.id = :userId) OR " +
            "  (:transactionType = com.serhat.secondhand.payment.entity.PaymentTransactionType.ITEM_PURCHASE AND p.transactionType = com.serhat.secondhand.payment.entity.PaymentTransactionType.ITEM_SALE AND p.fromUser.id = :userId)) AND " +
            "(:paymentType IS NULL OR p.paymentType = :paymentType) AND " +
            "(:paymentDirection IS NULL OR " +
            "  (:paymentDirection = com.serhat.secondhand.payment.entity.PaymentDirection.INCOMING AND p.toUser.id = :userId) OR " +
            "  (:paymentDirection = com.serhat.secondhand.payment.entity.PaymentDirection.OUTGOING AND p.fromUser.id = :userId)) AND " +
            "(:dateFrom IS NULL OR p.processedAt >= :dateFrom) AND " +
            "(:dateTo IS NULL OR p.processedAt <= :dateTo) AND " +
            "(:amountMin IS NULL OR p.amount >= :amountMin) AND " +
            "(:amountMax IS NULL OR p.amount <= :amountMax) AND " +
            "(:searchTerm IS NULL OR LOWER(tu.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(tu.surname) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(fu.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(fu.surname) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.listingTitle) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.listingNo) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Payment> findByFilters(
            @Param("userId") Long userId,
            @Param("transactionType") PaymentTransactionType transactionType,
            @Param("paymentType") PaymentType paymentType,
            @Param("paymentDirection") PaymentDirection paymentDirection,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("amountMin") BigDecimal amountMin,
            @Param("amountMax") BigDecimal amountMax,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT SUM(p.amount) FROM Payment p " +
           "WHERE p.fromUser.id = :userId " +
           "AND p.paymentType = com.serhat.secondhand.payment.entity.PaymentType.EWALLET " +
           "AND p.paymentDirection = com.serhat.secondhand.payment.entity.PaymentDirection.OUTGOING " +
           "AND p.processedAt >= :startOfMonth " +
           "AND p.isSuccess = true")
    BigDecimal sumMonthlyEwalletSpending(@Param("userId") Long userId, @Param("startOfMonth") LocalDateTime startOfMonth);
}
