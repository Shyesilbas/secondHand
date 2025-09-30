package com.serhat.secondhand.showcase;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.service.PaymentService;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ShowcaseService {
    
    private final ShowcaseRepository showcaseRepository;
    private final ShowcaseMapper showcaseMapper;
    private final ListingService listingService;
    private final PaymentService paymentService;
    private final UserService userService;

    @Getter
    @Value("${app.showcase.daily.cost}")
    private BigDecimal showcaseDailyCost;

    @Getter
    @Value("${app.showcase.fee.tax}")
    private BigDecimal showcaseFeeTax;
    
    public Showcase createShowcase(ShowcasePaymentRequest request, Authentication authentication) {
        if (request.days() <= 0 || request.days() > 30) {
            throw new BusinessException(ShowcaseErrorCodes.INVALID_DAYS_COUNT);
        }
        User user = userService.getAuthenticatedUser(authentication);


        Listing listing = listingService.findById(request.listingId())
                .orElseThrow(() -> new BusinessException(ListingErrorCodes.LISTING_NOT_FOUND));
        
        BigDecimal dailyCostWithTax = showcaseDailyCost
                .multiply(showcaseFeeTax)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                .add(showcaseDailyCost);
        BigDecimal totalCost = dailyCostWithTax.multiply(new BigDecimal(request.days()));
        
        PaymentRequest paymentRequest = new PaymentRequest(
                user.getId(),
                null,
                user.getName(),
                user.getSurname(),
                listing.getId(),
                totalCost,
                request.paymentType(),
                PaymentTransactionType.SHOWCASE_PAYMENT,
                PaymentDirection.OUTGOING
        );

        paymentService.createPayment(paymentRequest, authentication);
        
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusDays(request.days());


        return showcaseRepository.save(Showcase.builder()
                .listing(listing)
                .user(user)
                .startDate(startDate)
                .endDate(endDate)
                .totalCost(totalCost)
                .dailyCost(showcaseDailyCost)
                .status(ShowcaseStatus.ACTIVE)
                .build());


    }
    
    public List<ShowcaseDto> getActiveShowcases() {
        List<Showcase> activeShowcases = showcaseRepository.findActiveShowcases(ShowcaseStatus.ACTIVE,LocalDateTime.now());

      return activeShowcases.stream()
              .map(showcaseMapper::toDto)
              .toList();
    }
    
    public List<ShowcaseDto> getUserShowcases(Long userId) {
        List<Showcase> activeShowcases = showcaseRepository.findByUserIdAndStatus(userId,ShowcaseStatus.ACTIVE);

        return activeShowcases.stream()
                .map(showcaseMapper::toDto)
                .toList();
    }
    
    public void extendShowcase(UUID showcaseId, int additionalDays) {
        Showcase showcase = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new BusinessException(ShowcaseErrorCodes.SHOWCASE_NOT_FOUND));
        
        if (showcase.getStatus() != ShowcaseStatus.ACTIVE) {
            throw new BusinessException(ShowcaseErrorCodes.SHOWCASE_NOT_ACTIVE);
        }
        
        showcase.setEndDate(showcase.getEndDate().plusDays(additionalDays));
        BigDecimal dailyCostWithTax = showcaseDailyCost
                .multiply(showcaseFeeTax)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                .add(showcaseDailyCost);
        showcase.setTotalCost(showcase.getTotalCost().add(dailyCostWithTax.multiply(new BigDecimal(additionalDays))));
        
        showcaseRepository.save(showcase);
    }
    
    public void cancelShowcase(UUID showcaseId) {
        Showcase showcase = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new BusinessException(ShowcaseErrorCodes.SHOWCASE_NOT_FOUND));
        
        showcase.setStatus(ShowcaseStatus.CANCELLED);
        showcaseRepository.save(showcase);
    }
    
    @Transactional
    public void expireShowcases() {
        List<Showcase> expiredShowcases = showcaseRepository.findByStatusAndEndDateAfter(
                ShowcaseStatus.ACTIVE, LocalDateTime.now());
        
        expiredShowcases.forEach(showcase -> {
            showcase.setStatus(ShowcaseStatus.EXPIRED);
            showcaseRepository.save(showcase);
        });
    }
    
    public ShowcasePricingDto getShowcasePricingConfig() {
        log.info("Getting showcase pricing configuration");

        BigDecimal dailyCostTax = showcaseDailyCost
                .multiply(showcaseFeeTax)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalDailyCost = showcaseDailyCost.add(dailyCostTax);

        return ShowcasePricingDto.builder()
                .dailyCost(showcaseDailyCost)
                .taxPercentage(showcaseFeeTax)
                .totalDailyCost(totalDailyCost)
                .build();
    }
}
