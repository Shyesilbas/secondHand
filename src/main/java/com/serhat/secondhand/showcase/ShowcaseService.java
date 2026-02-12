package com.serhat.secondhand.showcase;

import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.mapper.PaymentRequestMapper;
import com.serhat.secondhand.payment.service.PaymentProcessor;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import com.serhat.secondhand.showcase.validator.ShowcaseValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
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
@Transactional
@Slf4j
public class ShowcaseService implements IShowcaseService {

    private final ShowcaseConfig showcaseConfig;
    private final ShowcaseRepository showcaseRepository;
    private final ShowcaseMapper showcaseMapper;
    private final IListingService listingService;
    private final PaymentProcessor paymentProcessor;
    private final IUserService userService;
    private final ShowcaseValidator showcaseValidator;
    private final PaymentRequestMapper paymentRequestMapper;

    @Override
    public Result<Showcase> createShowcase(Long userId, ShowcasePaymentRequest request) {
        log.info("Creating showcase for user ID: {} and listing ID: {}", userId, request.listingId());

        // 1. Validate Days
        Result<Void> validationResult = showcaseValidator.validateDaysCount(request.days());
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        // 2. Resolve User & Listing
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();

        Listing listing = listingService.findById(request.listingId()).orElse(null);
        if (listing == null) {
            // Result structure fix: error(message, errorCode)
            return Result.error("Listing not found", ListingErrorCodes.LISTING_NOT_FOUND.toString());
        }

        // 3. Pricing Calculation
        BigDecimal showcaseDailyCost = showcaseConfig.getDaily().getCost();
        BigDecimal showcaseFeeTax = showcaseConfig.getFee().getTax();
        BigDecimal dailyCostWithTax = showcaseMapper.calculateDailyCostWithTax(showcaseDailyCost, showcaseFeeTax);
        BigDecimal totalCost = showcaseMapper.calculateTotalCost(dailyCostWithTax, request.days());

        // 4. Payment Processing
        PaymentRequest paymentRequest = paymentRequestMapper.buildShowcasePaymentRequest(user, listing, request, totalCost);
        var paymentResult = paymentProcessor.executeSinglePayment(userId, paymentRequest);

        if (paymentResult.isError()) {
            return Result.error("Payment failed for showcase creation", "SHOWCASE_PAYMENT_FAILED");
        }

        // 5. Success - Save Showcase
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusDays(request.days());

        Showcase showcase = showcaseMapper.fromCreateRequest(request, user, listing, showcaseDailyCost, totalCost, startDate, endDate);
        return Result.success(showcaseRepository.save(showcase));
    }

    @Override
    public List<ShowcaseDto> getActiveShowcases() {
        List<Showcase> activeShowcases = showcaseRepository.findActiveShowcases(ShowcaseStatus.ACTIVE, LocalDateTime.now());
        return activeShowcases.stream().map(showcaseMapper::toDto).toList();
    }

    @Override
    public List<ShowcaseDto> getUserShowcases(Long userId) {
        List<Showcase> activeShowcases = showcaseRepository.findByUserIdAndStatus(userId, ShowcaseStatus.ACTIVE);
        return activeShowcases.stream().map(showcaseMapper::toDto).toList();
    }

    @Override
    public Result<Void> extendShowcase(UUID showcaseId, int additionalDays) {
        Showcase showcase = showcaseRepository.findById(showcaseId).orElse(null);

        if (showcase == null) {
            return Result.error("Showcase not found", "SHOWCASE_NOT_FOUND");
        }

        Result<Void> validationResult = showcaseValidator.validateIsActive(showcase);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        showcase.setEndDate(showcase.getEndDate().plusDays(additionalDays));
        BigDecimal showcaseDailyCost = showcaseConfig.getDaily().getCost();
        BigDecimal showcaseFeeTax = showcaseConfig.getFee().getTax();
        BigDecimal dailyCostWithTax = showcaseMapper.calculateDailyCostWithTax(showcaseDailyCost, showcaseFeeTax);
        BigDecimal additionalCost = showcaseMapper.calculateTotalCost(dailyCostWithTax, additionalDays);
        showcase.setTotalCost(showcase.getTotalCost().add(additionalCost));

        showcaseRepository.save(showcase);
        return Result.success();
    }

    @Override
    public Result<Void> cancelShowcase(UUID showcaseId) {
        Showcase showcase = showcaseRepository.findById(showcaseId).orElse(null);

        if (showcase == null) {
            return Result.error("Showcase not found", "SHOWCASE_NOT_FOUND");
        }

        showcase.setStatus(ShowcaseStatus.CANCELLED);
        showcaseRepository.save(showcase);
        return Result.success();
    }

    @Override
    @Transactional
    public void expireShowcases() {
        List<Showcase> expiredShowcases = showcaseRepository.findByStatusAndEndDateAfter(
                ShowcaseStatus.ACTIVE, LocalDateTime.now());

        expiredShowcases.forEach(showcase -> {
            showcase.setStatus(ShowcaseStatus.EXPIRED);
            showcaseRepository.save(showcase);
        });
    }

    @Override
    public ShowcasePricingDto getShowcasePricingConfig() {
        log.info("Getting showcase pricing configuration");
        return showcaseMapper.toPricingDto(showcaseConfig.getDaily().getCost(), showcaseConfig.getFee().getTax());
    }
}