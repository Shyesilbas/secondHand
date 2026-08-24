package com.serhat.secondhand.dashboard.application.adapter;

import com.serhat.secondhand.dashboard.application.port.OfferStatisticsPort;
import com.serhat.secondhand.offer.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OfferStatisticsAdapter implements OfferStatisticsPort {

    private final OfferRepository offerRepository;

    @Override
    public long countOffersBySellerAndDateRange(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return offerRepository.countBySellerIdAndCreatedAtBetween(sellerId, startDate, endDate);
    }

    @Override
    public List<Object[]> countOffersBySellerAndStatusGrouped(Long sellerId, LocalDateTime startDate, LocalDateTime endDate) {
        return offerRepository.countOffersBySellerAndStatusGrouped(sellerId, startDate, endDate);
    }

    @Override
    public long countOffersByBuyerAndDateRange(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        return offerRepository.countByBuyerIdAndCreatedAtBetween(buyerId, startDate, endDate);
    }

    @Override
    public List<Object[]> countOffersByBuyerAndStatusGrouped(Long buyerId, LocalDateTime startDate, LocalDateTime endDate) {
        return offerRepository.countOffersByBuyerAndStatusGrouped(buyerId, startDate, endDate);
    }
}
