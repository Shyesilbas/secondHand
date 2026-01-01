package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.user.domain.entity.User;
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

        Page<Order> findByUser(User user, Pageable pageable);

        @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<Order> findByUserWithOrderItems(@Param("user") User user);

        Optional<Order> findByOrderNumber(String orderNumber);

        @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
        Optional<Order> findByIdWithOrderItems(@Param("id") Long id);

        List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);

        @Query("SELECT o FROM Order o LEFT JOIN FETCH o.shipping WHERE o.status = :status ORDER BY o.updatedAt ASC")
        List<Order> findByStatusWithShipping(@Param("status") Order.OrderStatus status);

        List<Order> findByPaymentStatusOrderByCreatedAtDesc(Order.PaymentStatus paymentStatus);

        long countByUser(User user);

        List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);

        List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, Order.OrderStatus status);

        Optional<Order> findByPaymentReference(String paymentReference);

        // Dashboard queries
        @Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user AND o.createdAt BETWEEN :startDate AND :endDate")
        long countByUserAndCreatedAtBetween(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.user = :user AND o.createdAt BETWEEN :startDate AND :endDate GROUP BY o.status")
        List<Object[]> countByUserAndStatusGrouped(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user = :user AND o.createdAt BETWEEN :startDate AND :endDate AND o.paymentStatus = 'PAID' AND o.status != 'CANCELLED' AND o.status != 'REFUNDED'")
        BigDecimal sumTotalAmountByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}