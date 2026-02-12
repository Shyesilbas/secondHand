package com.serhat.secondhand.listing.aspect;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class PriceHistoryAspect {
    
    private final ListingRepository listingRepository;
    private final PriceHistoryService priceHistoryService;
    
    @Around("@annotation(trackPriceChange)")
    public Object trackPriceChange(ProceedingJoinPoint joinPoint, TrackPriceChange trackPriceChange) throws Throwable {
        // Extract listing ID from method parameters (first parameter is UUID id)
        UUID listingId = extractListingId(joinPoint);
        
        if (listingId == null) {
            log.warn("Could not extract listing ID from method parameters, skipping price tracking");
            return joinPoint.proceed();
        }
        
        // Capture old price before method execution
        BigDecimal oldPrice = capturePrice(listingId);
        
        // Execute the actual update method
        Object result = joinPoint.proceed();
        
        // Check if the update was successful
        if (isSuccessfulResult(result)) {
            // Capture new price after method execution
            BigDecimal newPrice = capturePrice(listingId);
            
            // Record price change if different
            if (hasPriceChanged(oldPrice, newPrice)) {
                recordPriceChange(listingId, oldPrice, newPrice, trackPriceChange.reason());
            }
        }
        
        return result;
    }
    
    private UUID extractListingId(ProceedingJoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] instanceof UUID) {
            return (UUID) args[0];
        }
        return null;
    }
    
    private BigDecimal capturePrice(UUID listingId) {
        Optional<Listing> listingOpt = listingRepository.findById(listingId);
        return listingOpt.map(Listing::getPrice).orElse(null);
    }
    
    private boolean isSuccessfulResult(Object result) {
        if (result instanceof Result) {
            Result<?> resultObj = (Result<?>) result;
            return resultObj.isSuccess();
        }
        return false;
    }
    
    private boolean hasPriceChanged(BigDecimal oldPrice, BigDecimal newPrice) {
        if (oldPrice == null && newPrice == null) {
            return false;
        }
        if (oldPrice == null || newPrice == null) {
            return true;
        }
        return oldPrice.compareTo(newPrice) != 0;
    }
    
    private void recordPriceChange(UUID listingId, BigDecimal oldPrice, BigDecimal newPrice, String reason) {
        try {
            Optional<Listing> listingOpt = listingRepository.findById(listingId);
            if (listingOpt.isPresent()) {
                Listing listing = listingOpt.get();
                priceHistoryService.recordPriceChange(
                    listingId,
                    listing.getTitle(),
                    oldPrice,
                    newPrice,
                    listing.getCurrency(),
                    reason
                );
                log.debug("Price change tracked for listing {}: {} -> {}", listingId, oldPrice, newPrice);
            }
        } catch (Exception e) {
            log.error("Failed to record price change for listing {}: {}", listingId, e.getMessage(), e);
        }
    }
}
