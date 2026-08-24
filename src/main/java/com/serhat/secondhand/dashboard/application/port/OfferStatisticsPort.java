package com.serhat.secondhand.dashboard.application.port;

import java.time.LocalDateTime;
import java.util.List;

public interface OfferStatisticsPort {

    long countOffersBySellerAndDateRange(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> countOffersBySellerAndStatusGrouped(Long sellerId, LocalDateTime startDate, LocalDateTime endDate);

    long countOffersByBuyerAndDateRange(Long buyerId, LocalDateTime startDate, LocalDateTime endDate);

    List<Object[]> countOffersByBuyerAndStatusGrouped(Long buyerId, LocalDateTime startDate, LocalDateTime endDate);
}
