package com.serhat.secondhand.showcase;

import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.payment.service.PaymentService;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ShowcaseService {
    
    private final ShowcaseRepository showcaseRepository;
    private final ShowcaseMapper showcaseMapper;
    private final ListingService listingService;
    private final PaymentService paymentService;
    private final UserService userService;

    private static final BigDecimal DAILY_COST = new BigDecimal("10.00");
    
    public Showcase createShowcase(ShowcasePaymentRequest request, Authentication authentication) {
        if (request.days() <= 0 || request.days() > 30) {
            throw new IllegalArgumentException("Showcase duration must be between 1 and 30 days");
        }
        User user = userService.getAuthenticatedUser(authentication);


        Listing listing = listingService.findById(request.listingId())
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        
        BigDecimal totalCost = DAILY_COST.multiply(new BigDecimal(request.days()));
        
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

        System.out.println("ShowcasePaymentRequest: " + request);

        paymentService.createPayment(paymentRequest, authentication);
        
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusDays(request.days());


        return showcaseRepository.save(Showcase.builder()
                .listing(listing)
                .user(user)
                .startDate(startDate)
                .endDate(endDate)
                .totalCost(totalCost)
                .dailyCost(DAILY_COST)
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
                .orElseThrow(() -> new RuntimeException("Showcase not found"));
        
        if (showcase.getStatus() != ShowcaseStatus.ACTIVE) {
            throw new IllegalStateException("Cannot extend inactive showcase");
        }
        
        showcase.setEndDate(showcase.getEndDate().plusDays(additionalDays));
        showcase.setTotalCost(showcase.getTotalCost().add(DAILY_COST.multiply(new BigDecimal(additionalDays))));
        
        showcaseRepository.save(showcase);
    }
    
    public void cancelShowcase(UUID showcaseId) {
        Showcase showcase = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new RuntimeException("Showcase not found"));
        
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
}
