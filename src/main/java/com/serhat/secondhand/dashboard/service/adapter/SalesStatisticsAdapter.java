package com.serhat.secondhand.dashboard.service.adapter;

import com.serhat.secondhand.dashboard.service.port.SalesStatisticsPort;
import com.serhat.secondhand.order.repository.OrderItemRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SalesStatisticsAdapter implements SalesStatisticsPort {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public BigDecimal sumRevenueBySellerAndDateRange(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.sumRevenueBySellerAndDateRange(sellerId, startDate, endDate);
    }

    @Override
    public List<Object[]> getDailyRevenueTrend(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.getDailyRevenueTrend(sellerId, startDate, endDate);
    }

    @Override
    public List<Object[]> countDistinctOrdersBySellerAndStatusGrouped(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.countDistinctOrdersBySellerAndStatusGrouped(sellerId, startDate, endDate);
    }

    @Override
    public long countDistinctListingsSoldBySellerAndDateRange(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.countDistinctListingsSoldBySellerAndDateRange(sellerId, startDate, endDate);
    }

    @Override
    public BigDecimal sumTotalAmountByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.sumTotalAmountByUserIdAndDateRange(userId, startDate, endDate);
    }

    @Override
    public long countOrdersByUserIdAndCreatedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.countByUserIdAndCreatedAtBetween(userId, startDate, endDate);
    }

    @Override
    public List<Object[]> countOrdersByUserIdAndStatusGrouped(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.countByUserIdAndStatusGrouped(userId, startDate, endDate);
    }

    @Override
    public List<Object[]> getDailySpendingTrend(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.getDailySpendingTrend(buyerId, startDate, endDate);
    }

    @Override
    public List<Object[]> sumRevenueBySellerAndCategory(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.sumRevenueBySellerAndCategory(sellerId, startDate, endDate);
    }

    @Override
    public List<Object[]> sumSpendingByBuyerAndCategory(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.sumSpendingByBuyerAndCategory(buyerId, startDate, endDate);
    }

    @Override
    public List<Object[]> countOrdersByBuyerAndCategory(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.countOrdersByBuyerAndCategory(buyerId, startDate, endDate);
    }

    @Override
    public List<Object[]> findTopListingsByRevenue(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderItemRepository.findTopListingsByRevenue(sellerId, startDate, endDate);
    }
}

