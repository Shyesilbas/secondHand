package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.dto.OrderStatusCountDto;
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
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.seller LEFT JOIN FETCH o.user WHERE o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithItemsAndSellers(@Param("orderNumber") String orderNumber);

    long countByUser_IdAndPaymentStatus(Long userId, PaymentStatus paymentStatus);
    // Order.shipping is the inverse side of a one-to-one and is always loaded; fetch it in the page query
    // instead of one extra select per order (PF-07). To-one fetch joins are safe with pagination.
    // `statuses` must never be empty: callers pass every status when no filter is requested (OrderListFilter.statusesOrAll).
    @Query(value = "SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.shipping " +
           "WHERE o.user.id = :userId " +
           "AND (:deliveryMethod IS NULL OR o.deliveryMethod = :deliveryMethod) " +
           "AND o.status IN :statuses " +
           "AND (:orderNumber IS NULL OR o.orderNumber = :orderNumber)",
           countQuery = "SELECT COUNT(o) FROM Order o " +
           "WHERE o.user.id = :userId " +
           "AND (:deliveryMethod IS NULL OR o.deliveryMethod = :deliveryMethod) " +
           "AND o.status IN :statuses " +
           "AND (:orderNumber IS NULL OR o.orderNumber = :orderNumber)")
    Page<Order> findByUserIdAndDeliveryMethod(
            @Param("userId") Long userId,
            @Param("deliveryMethod") DeliveryMethod deliveryMethod,
            @Param("statuses") Collection<OrderStatus> statuses,
            @Param("orderNumber") String orderNumber,
            Pageable pageable);

    @Query("SELECT new com.serhat.secondhand.order.dto.OrderStatusCountDto(o.status, COUNT(o)) FROM Order o " +
           "WHERE o.user.id = :userId " +
           "AND (:deliveryMethod IS NULL OR o.deliveryMethod = :deliveryMethod) " +
           "GROUP BY o.status")
    List<OrderStatusCountDto> countUserOrdersByStatus(
            @Param("userId") Long userId,
            @Param("deliveryMethod") DeliveryMethod deliveryMethod);


    long countByUserIdAndStatus(Long userId, OrderStatus status);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
    Optional<Order> findByIdWithOrderItems(@Param("id") Long id);

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.user JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.listing JOIN FETCH oi.seller WHERE o.id = :id")
    Optional<Order> findByIdWithOrderItemsAndSellers(@Param("id") Long id);


    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.orderItems oi JOIN FETCH oi.listing l WHERE o.id = :orderId AND l.seller.id = :sellerId")
    Optional<Order> findByIdForSeller(@Param("orderId") Long orderId, @Param("sellerId") Long sellerId);

    // ── Status scheduler: due-order id queries (coarse DB prefilter, exact check runs per order) ──

    @Query("SELECT o.id FROM Order o WHERE o.status = :status AND COALESCE(o.updatedAt, o.createdAt) <= :cutoff ORDER BY o.id")
    List<Long> findIdsByStatusTouchedBefore(@Param("status") OrderStatus status,
                                            @Param("cutoff") LocalDateTime cutoff, Pageable pageable);

    @Query("SELECT o.id FROM Order o LEFT JOIN o.shipping s WHERE o.status = :status AND COALESCE(s.inTransitAt, o.updatedAt) <= :cutoff ORDER BY o.id")
    List<Long> findIdsByStatusInTransitBefore(@Param("status") OrderStatus status,
                                              @Param("cutoff") LocalDateTime cutoff, Pageable pageable);

    @Query("SELECT o.id FROM Order o JOIN o.shipping s WHERE o.status = :status AND s.deliveredAt <= :cutoff ORDER BY o.id")
    List<Long> findIdsByStatusDeliveredBefore(@Param("status") OrderStatus status,
                                              @Param("cutoff") LocalDateTime cutoff, Pageable pageable);

    @Query("SELECT o.id FROM Order o WHERE o.status = :status AND o.deliveryMethod = :method AND o.meetupVerifiedAt <= :cutoff ORDER BY o.id")
    List<Long> findIdsByStatusMeetupVerifiedBefore(@Param("status") OrderStatus status, @Param("method") DeliveryMethod method,
                                                   @Param("cutoff") LocalDateTime cutoff, Pageable pageable);

    @Query("SELECT o.id FROM Order o WHERE o.status = :status AND o.deliveryMethod = :method AND o.createdAt <= :cutoff ORDER BY o.id")
    List<Long> findIdsByStatusCreatedBefore(@Param("status") OrderStatus status, @Param("method") DeliveryMethod method,
                                            @Param("cutoff") LocalDateTime cutoff, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.shipping LEFT JOIN FETCH o.user WHERE o.id = :id")
    Optional<Order> findByIdWithShippingAndUser(@Param("id") Long id);


    // Dashboard Queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate")
    long countByUserIdAndCreatedAtBetween(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate GROUP BY o.status")
    List<Object[]> countByUserIdAndStatusGrouped(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate AND o.paymentStatus = 'COMPLETED' AND o.status != 'CANCELLED' AND o.status != 'REFUNDED'")
    BigDecimal sumTotalAmountByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT DISTINCT o FROM Order o " +
           "JOIN o.orderItems oi " +
           "JOIN FETCH o.user u " +
           "LEFT JOIN FETCH o.shipping " +
           "WHERE oi.listing.seller.id = :sellerId " +
           "AND (:deliveryMethod IS NULL OR o.deliveryMethod = :deliveryMethod) " +
           "AND o.status IN :statuses " +
           "AND (:orderNumber IS NULL OR o.orderNumber = :orderNumber) " +
           "ORDER BY o.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT o) FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE oi.listing.seller.id = :sellerId " +
           "AND (:deliveryMethod IS NULL OR o.deliveryMethod = :deliveryMethod) " +
           "AND o.status IN :statuses " +
           "AND (:orderNumber IS NULL OR o.orderNumber = :orderNumber)")
    Page<Order> findOrdersBySellerIdAndDeliveryMethod(
            @Param("sellerId") Long sellerId,
            @Param("deliveryMethod") DeliveryMethod deliveryMethod,
            @Param("statuses") Collection<OrderStatus> statuses,
            @Param("orderNumber") String orderNumber,
            Pageable pageable);

    @Query("SELECT new com.serhat.secondhand.order.dto.OrderStatusCountDto(o.status, COUNT(DISTINCT o)) FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE oi.listing.seller.id = :sellerId " +
           "AND (:deliveryMethod IS NULL OR o.deliveryMethod = :deliveryMethod) " +
           "GROUP BY o.status")
    List<OrderStatusCountDto> countSellerOrdersByStatus(
            @Param("sellerId") Long sellerId,
            @Param("deliveryMethod") DeliveryMethod deliveryMethod);

    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.orderItems oi " +
           "JOIN FETCH oi.listing l " +
           "LEFT JOIN FETCH oi.seller s " +
           "LEFT JOIN FETCH o.shipping " +
           "WHERE o.user.id = :userId " +
           "AND o.status IN :statuses " +
           "ORDER BY o.createdAt DESC")
    List<Order> findActiveOrdersForBuyer(@Param("userId") Long userId, @Param("statuses") List<OrderStatus> statuses);

    boolean existsByUserIdAndStatus(Long userId, OrderStatus status);
}