package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.entity.Order;
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

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdWithOrderItems(@Param("userId") Long userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    long countByUserIdAndStatus(Long userId, Order.OrderStatus status);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
    Optional<Order> findByIdWithOrderItems(@Param("id") Long id);

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.orderItems oi JOIN FETCH oi.listing l WHERE o.id = :orderId AND l.seller.id = :sellerId")
    Optional<Order> findByIdForSeller(@Param("orderId") Long orderId, @Param("sellerId") Long sellerId);

    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.shipping WHERE o.status = :status ORDER BY o.updatedAt ASC")
    List<Order> findByStatusWithShipping(@Param("status") Order.OrderStatus status);

    long countByUserId(Long userId);

    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Order.OrderStatus status);

    // Dashboard Queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate")
    long countByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate GROUP BY o.status")
    List<Object[]> countByUserIdAndStatusGrouped(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate AND o.paymentStatus = 'PAID' AND o.status != 'CANCELLED' AND o.status != 'REFUNDED'")
    BigDecimal sumTotalAmountByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi WHERE oi.listing.seller.id = :sellerId ORDER BY o.createdAt DESC")
    Page<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    boolean existsByUserIdAndStatus(Long userId, Order.OrderStatus status);
}