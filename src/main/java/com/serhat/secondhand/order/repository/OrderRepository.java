package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.seller LEFT JOIN FETCH o.user WHERE o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithItemsAndSellers(@Param("orderNumber") String orderNumber);

    long countByUser_IdAndPaymentStatus(Long userId, PaymentStatus paymentStatus);
    @Query("SELECT DISTINCT o FROM Order o " +
           "WHERE o.user.id = :userId " +
           "AND (:deliveryMethod IS NULL OR o.deliveryMethod = :deliveryMethod)")
    Page<Order> findByUserIdAndDeliveryMethod(
            @Param("userId") Long userId,
            @Param("deliveryMethod") DeliveryMethod deliveryMethod,
            Pageable pageable);


    long countByUserIdAndStatus(Long userId, OrderStatus status);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
    Optional<Order> findByIdWithOrderItems(@Param("id") Long id);

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.user JOIN FETCH o.orderItems oi JOIN FETCH oi.seller WHERE o.id = :id")
    Optional<Order> findByIdWithOrderItemsAndSellers(@Param("id") Long id);


    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.orderItems oi JOIN FETCH oi.listing l WHERE o.id = :orderId AND l.seller.id = :sellerId")
    Optional<Order> findByIdForSeller(@Param("orderId") Long orderId, @Param("sellerId") Long sellerId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.shipping WHERE o.status = :status ORDER BY o.updatedAt ASC")
    List<Order> findByStatusWithShipping(@Param("status") OrderStatus status);


    // Dashboard Queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate")
    long countByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate GROUP BY o.status")
    List<Object[]> countByUserIdAndStatusGrouped(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate AND o.paymentStatus = 'COMPLETED' AND o.status != 'CANCELLED' AND o.status != 'REFUNDED'")
    BigDecimal sumTotalAmountByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "JOIN FETCH o.user u " +
           "WHERE oi.listing.seller.id = :sellerId " +
           "AND (:deliveryMethod IS NULL OR o.deliveryMethod = :deliveryMethod) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findOrdersBySellerIdAndDeliveryMethod(
            @Param("sellerId") Long sellerId,
            @Param("deliveryMethod") DeliveryMethod deliveryMethod,
            Pageable pageable);

    boolean existsByUserIdAndStatus(Long userId, OrderStatus status);
}