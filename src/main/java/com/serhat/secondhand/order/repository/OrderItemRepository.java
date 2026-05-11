package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
            SELECT COUNT(oi) FROM OrderItem oi
            WHERE oi.seller.id = :sellerId
              AND oi.order.paymentStatus = :completed
              AND oi.order.status <> :cancelled
              AND oi.order.status <> :refunded
              AND oi.order.createdAt >= :startDate
              AND oi.order.createdAt <= :endDate
              AND oi.unitPrice >= :minUnitPrice
              AND oi.currency = :currency
            """)
    long countGreatSellerEligibleSales(
            @Param("sellerId") Long sellerId,
            @Param("completed") PaymentStatus completed,
            @Param("cancelled") OrderStatus cancelled,
            @Param("refunded") OrderStatus refunded,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minUnitPrice") BigDecimal minUnitPrice,
            @Param("currency") Currency currency);

    /** Aynı filtreler {@link #countGreatSellerEligibleSales} ile; liste için tek GROUP BY (N kez COUNT çalıştırmamak). */
    @Query("""
            SELECT oi.seller.id, COUNT(oi)
            FROM OrderItem oi
            WHERE oi.order.paymentStatus = :completed
              AND oi.order.status <> :cancelled
              AND oi.order.status <> :refunded
              AND oi.order.createdAt >= :startDate
              AND oi.order.createdAt <= :endDate
              AND oi.unitPrice >= :minUnitPrice
              AND oi.currency = :currency
            GROUP BY oi.seller.id
            HAVING COUNT(oi) >= :minSales
            ORDER BY COUNT(oi) DESC
            """)
    List<Object[]> findSellerIdsWithGreatSellerEligibleSalesVolume(
            @Param("completed") PaymentStatus completed,
            @Param("cancelled") OrderStatus cancelled,
            @Param("refunded") OrderStatus refunded,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minUnitPrice") BigDecimal minUnitPrice,
            @Param("currency") Currency currency,
            @Param("minSales") long minSales,
            Pageable pageable);

    @Query("SELECT oi.listing.listingType, COUNT(DISTINCT oi.order) FROM OrderItem oi " +
            "WHERE oi.listing.seller.id = :sellerId " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.listing.listingType")
    List<Object[]> countOrdersBySellerAndCategory(@Param("sellerId") Long sellerId,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);


    @Query("SELECT COUNT(DISTINCT oi.listing) FROM OrderItem oi " +
            "WHERE oi.listing.seller.id = :sellerId " +
            "AND oi.order.paymentStatus = 'COMPLETED' " +
            "AND oi.order.status != 'CANCELLED' " +
            "AND oi.order.status != 'REFUNDED' " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate")
    long countDistinctListingsSoldBySellerAndDateRange(@Param("sellerId") Long sellerId,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);

    @Query("SELECT oi.order.status, COUNT(DISTINCT oi.order) FROM OrderItem oi " +
            "WHERE oi.listing.seller.id = :sellerId " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.order.status")
    List<Object[]> countDistinctOrdersBySellerAndStatusGrouped(@Param("sellerId") Long sellerId,
                                                               @Param("startDate") LocalDateTime startDate,
                                                               @Param("endDate") LocalDateTime endDate);


    @Query(value = "SELECT CAST(o.created_at AS DATE), SUM(oi.total_price) " +
            "FROM order_items oi " +
            "JOIN orders o ON oi.order_id = o.id " +
            "JOIN listings l ON oi.listing_id = l.id " +
            "WHERE l.seller_id = :sellerId " +
            "AND o.payment_status = 'COMPLETED' " +
            "AND o.status != 'CANCELLED' " +
            "AND o.status != 'REFUNDED' " +
            "AND o.created_at BETWEEN :startDate AND :endDate " +
            "GROUP BY CAST(o.created_at AS DATE) " +
            "ORDER BY CAST(o.created_at AS DATE)", nativeQuery = true)
    List<Object[]> getDailyRevenueTrend(@Param("sellerId") Long sellerId,
                                        @Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    // Buyer Dashboard Queries
    @Query("SELECT oi.listing.listingType, SUM(oi.totalPrice) FROM OrderItem oi " +
            "WHERE oi.order.user.id = :buyerId " +
            "AND oi.order.paymentStatus = 'COMPLETED' " +
            "AND oi.order.status != 'CANCELLED' " +
            "AND oi.order.status != 'REFUNDED' " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.listing.listingType")
    List<Object[]> sumSpendingByBuyerAndCategory(@Param("buyerId") Long buyerId,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT CAST(o.created_at AS DATE), SUM(oi.total_price) " +
            "FROM order_items oi " +
            "JOIN orders o ON oi.order_id = o.id " +
            "WHERE o.user_id = :buyerId " +
            "AND o.payment_status = 'COMPLETED' " +
            "AND o.status != 'CANCELLED' " +
            "AND o.status != 'REFUNDED' " +
            "AND o.created_at BETWEEN :startDate AND :endDate " +
            "GROUP BY CAST(o.created_at AS DATE) " +
            "ORDER BY CAST(o.created_at AS DATE)", nativeQuery = true)
    List<Object[]> getDailySpendingTrend(@Param("buyerId") Long buyerId,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT oi.listing.listingType, COUNT(DISTINCT oi.order) FROM OrderItem oi " +
            "WHERE oi.order.user.id = :buyerId " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.listing.listingType")
    List<Object[]> countOrdersByBuyerAndCategory(@Param("buyerId") Long buyerId,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi " +
            "WHERE oi.seller.id = :sellerId " + 
            "AND oi.order.paymentStatus = 'COMPLETED' " +
            "AND oi.order.status != 'CANCELLED' " +
            "AND oi.order.status != 'REFUNDED' " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueBySellerAndDateRange(@Param("sellerId") Long sellerId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT oi.listingType, SUM(oi.totalPrice) FROM OrderItem oi " +
            "WHERE oi.seller.id = :sellerId " + 
            "AND oi.order.paymentStatus = 'COMPLETED' " +
            "AND oi.order.status != 'CANCELLED' " +
            "AND oi.order.status != 'REFUNDED' " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.listingType")
    List<Object[]> sumRevenueBySellerAndCategory(@Param("sellerId") Long sellerId,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT oi.listing.id, SUM(oi.totalPrice) as revenue, COUNT(DISTINCT oi.order) as orderCount " +
            "FROM OrderItem oi " +
            "WHERE oi.seller.id = :sellerId " +
            "AND oi.order.paymentStatus = 'COMPLETED' " +
            "AND oi.order.status != 'CANCELLED' " +
            "AND oi.order.status != 'REFUNDED' " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.listing.id " +
            "ORDER BY revenue DESC")
    List<Object[]> findTopListingsByRevenue(@Param("sellerId") Long sellerId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);


}