package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.PriceHistoryDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.PriceHistory;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import com.serhat.secondhand.listing.domain.mapper.PriceHistoryMapper;
import com.serhat.secondhand.listing.domain.repository.PriceHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceHistoryService {

    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceHistoryMapper priceHistoryMapper;

    public List<PriceHistoryDto> getPriceHistoryByListingId(UUID listingId) {
        return priceHistoryRepository.findByListingIdOrderByChangeDateDesc(listingId)
                .stream()
                .map(priceHistoryMapper::toDto)
                .toList();
    }

    public List<PriceHistoryDto> getPriceHistoryByListing(Listing listing) {
        return priceHistoryRepository.findByListingOrderByChangeDateDesc(listing)
                .stream()
                .map(priceHistoryMapper::toDto)
                .toList();
    }

    @Transactional
    public void recordPriceChange(Listing listing, BigDecimal oldPrice, BigDecimal newPrice, 
                                 Currency currency, String changeReason) {
        // İlk fiyat kaydı ise (oldPrice null), sadece yeni fiyatı kaydet
        if (oldPrice == null) {
            PriceHistory initialPrice = PriceHistory.builder()
                    .listing(listing)
                    .oldPrice(null)
                    .newPrice(newPrice)
                    .currency(currency)
                    .changeDate(LocalDateTime.now())
                    .changeReason("Initial price")
                    .percentageChange(BigDecimal.ZERO)
                    .build();
            priceHistoryRepository.save(initialPrice);
            log.info("Initial price recorded for listing: {}, price: {}", listing.getId(), newPrice);
            return;
        }

        // Fiyat değişikliği varsa kaydet
        if (oldPrice.compareTo(newPrice) != 0) {
            PriceHistory priceHistory = PriceHistory.builder()
                    .listing(listing)
                    .oldPrice(oldPrice)
                    .newPrice(newPrice)
                    .currency(currency)
                    .changeDate(LocalDateTime.now())
                    .changeReason(changeReason != null ? changeReason : "Price updated")
                    .build();
            
            priceHistoryRepository.save(priceHistory);
            log.info("Price change recorded for listing: {}, from: {} to: {}", 
                    listing.getId(), oldPrice, newPrice);
        }
    }

    public PriceHistoryDto getLatestPriceChange(UUID listingId) {
        List<PriceHistory> history = priceHistoryRepository.findByListingIdOrderByChangeDateDesc(listingId);
        return history.isEmpty() ? null : priceHistoryMapper.toDto(history.get(0));
    }

    public boolean hasPriceHistory(UUID listingId) {
        return !priceHistoryRepository.findByListingIdOrderByChangeDateDesc(listingId).isEmpty();
    }
}
