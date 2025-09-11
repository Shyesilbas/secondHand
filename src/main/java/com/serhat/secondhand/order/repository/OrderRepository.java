package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Find all orders for a specific user
     */
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Find all orders for a specific user with order items
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<Order> findByUserWithOrderItems(@Param("user") User user);

    /**
     * Find order by order number
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Find orders by status
     */
    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);

    /**
     * Find orders by payment status
     */
    List<Order> findByPaymentStatusOrderByCreatedAtDesc(Order.PaymentStatus paymentStatus);

    /**
     * Count orders by user
     */
    long countByUser(User user);

    /**
     * Find orders created between dates
     */
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find orders by user and status
     */
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, Order.OrderStatus status);

    /**
     * Find orders by payment reference
     */
    Optional<Order> findByPaymentReference(String paymentReference);
}