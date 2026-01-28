package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {


    @Query("SELECT oi.listing.listingType, COUNT(DISTINCT oi.order) FROM OrderItem oi " +
            "WHERE oi.listing.seller.id = :sellerId " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.listing.listingType")
    List<Object[]> countOrdersBySellerAndCategory(@Param("sellerId") Long sellerId,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);


    @Query("SELECT COUNT(DISTINCT oi.listing) FROM OrderItem oi " +
            "WHERE oi.listing.seller.id = :sellerId " +
            "AND oi.order.paymentStatus = 'PAID' " +
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
            "AND o.payment_status = 'PAID' " +
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
            "AND oi.order.paymentStatus = 'PAID' " +
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
            "AND o.payment_status = 'PAID' " +
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
            "WHERE oi.sellerId = :sellerId " + // JOIN KALKTI
            "AND oi.order.paymentStatus = 'PAID' " +
            "AND oi.order.status != 'CANCELLED' " +
            "AND oi.order.status != 'REFUNDED' " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueBySellerAndDateRange(@Param("sellerId") Long sellerId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT oi.listingType, SUM(oi.totalPrice) FROM OrderItem oi " +
            "WHERE oi.sellerId = :sellerId " + // JOIN KALKTI
            "AND oi.order.paymentStatus = 'PAID' " +
            "AND oi.order.status != 'CANCELLED' " +
            "AND oi.order.status != 'REFUNDED' " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.listingType")
    List<Object[]> sumRevenueBySellerAndCategory(@Param("sellerId") Long sellerId,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT oi.listing.id, SUM(oi.totalPrice) as revenue, COUNT(DISTINCT oi.order) as orderCount " +
            "FROM OrderItem oi " +
            "WHERE oi.sellerId = :sellerId " +
            "AND oi.order.paymentStatus = 'PAID' " +
            "AND oi.order.status != 'CANCELLED' " +
            "AND oi.order.status != 'REFUNDED' " +
            "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.listing.id " +
            "ORDER BY revenue DESC")
    List<Object[]> findTopListingsByRevenue(@Param("sellerId") Long sellerId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);


}