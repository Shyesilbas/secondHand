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

        Page<Order> findByUser(User user, Pageable pageable);

        @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<Order> findByUserWithOrderItems(@Param("user") User user);

        Optional<Order> findByOrderNumber(String orderNumber);

        List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);

        List<Order> findByPaymentStatusOrderByCreatedAtDesc(Order.PaymentStatus paymentStatus);

        long countByUser(User user);

        List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);

        List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, Order.OrderStatus status);

        Optional<Order> findByPaymentReference(String paymentReference);
}