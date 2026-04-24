package com.serhat.secondhand.showcase.application;

import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.core.dto.CachedPage;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.application.PaymentRequestFactory;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.showcase.Showcase;
import com.serhat.secondhand.showcase.ShowcaseErrorCodes;
import com.serhat.secondhand.showcase.ShowcaseMapper;
import com.serhat.secondhand.showcase.ShowcaseStatus;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import com.serhat.secondhand.showcase.repository.ShowcaseRepository;
import com.serhat.secondhand.showcase.validator.ShowcaseValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final ListingQueryService listingService;
    private final PaymentProcessor paymentProcessor;
    private final IUserService userService;
    private final ShowcaseValidator showcaseValidator;
    private final PaymentRequestFactory paymentRequestFactory;

    @Lazy
    @Autowired
    private ShowcaseService self;

    @Override
    @CacheEvict(value = "activeShowcases", allEntries = true)
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

        return listingService.findById(request.listingId())
                .map(listing -> createShowcaseInternal(request, user, listing, userId))
                .orElseGet(() -> Result.error("Listing not found", ListingErrorCodes.LISTING_NOT_FOUND.toString()));
    }
    
    private Result<Showcase> createShowcaseInternal(ShowcasePaymentRequest request, User user, Listing listing, Long userId) {
        // Pricing Calculation
        BigDecimal showcaseDailyCost = showcaseConfig.getDaily().getCost();
        BigDecimal showcaseFeeTax = showcaseConfig.getFee().getTax();
        BigDecimal dailyCostWithTax = showcaseMapper.calculateDailyCostWithTax(showcaseDailyCost, showcaseFeeTax);
        BigDecimal totalCost = showcaseMapper.calculateTotalCost(dailyCostWithTax, request.days());

        // Payment Processing
        PaymentRequest paymentRequest = paymentRequestFactory.buildShowcasePaymentRequest(user, listing, request, totalCost);
        var paymentResult = paymentProcessor.executeSinglePayment(userId, paymentRequest);

        if (paymentResult.isError()) {
            return Result.error(ShowcaseErrorCodes.PAYMENT_FAILED);
        }

        // Success - Save Showcase
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusDays(request.days());

        Showcase showcase = showcaseMapper.fromCreateRequest(request, user, listing, showcaseDailyCost, totalCost, startDate, endDate);
        return Result.success(showcaseRepository.save(showcase));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ShowcaseDto> getActiveShowcases(int page, int size) {
        return self.getCachedActiveShowcases(page, size).toPage();
    }

    @Cacheable(value = "activeShowcases", key = "#page + '_' + #size")
    public CachedPage<ShowcaseDto> getCachedActiveShowcases(int page, int size) {
        log.info("[CACHE MISS] activeShowcases::page={}, size={}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<Showcase> activeShowcases = showcaseRepository.findActiveShowcasesPage(ShowcaseStatus.ACTIVE, LocalDateTime.now(), pageable);
        List<ShowcaseDto> dtoList = showcaseMapper.toDtos(activeShowcases.getContent(), null);
        return CachedPage.from(new PageImpl<>(dtoList, pageable, activeShowcases.getTotalElements()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowcaseDto> getUserShowcases(Long userId) {
        List<Showcase> activeShowcases = showcaseRepository.findByUserIdAndStatusWithListing(userId, ShowcaseStatus.ACTIVE);
        return showcaseMapper.toDtos(activeShowcases, userId);
    }

    @Override
    @CacheEvict(value = "activeShowcases", allEntries = true)
    public Result<Void> extendShowcase(Long userId, UUID showcaseId, int additionalDays) {
        Result<Void> daysValidation = showcaseValidator.validateDaysCount(additionalDays);
        if (daysValidation.isError()) {
            return Result.error(daysValidation.getMessage(), daysValidation.getErrorCode());
        }
        return showcaseRepository.findById(showcaseId)
                .map(showcase -> performExtension(showcase, userId, additionalDays))
                .orElseGet(() -> Result.error(ShowcaseErrorCodes.SHOWCASE_NOT_FOUND));
    }
    
    private Result<Void> performExtension(Showcase showcase, Long userId, int additionalDays) {
        if (!showcase.getUser().getId().equals(userId)) {
            return Result.error(ListingErrorCodes.NOT_LISTING_OWNER);
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
    @CacheEvict(value = "activeShowcases", allEntries = true)
    public Result<Void> cancelShowcase(Long userId, UUID showcaseId) {
        return showcaseRepository.findById(showcaseId)
                .map(showcase -> {
                    if (!showcase.getUser().getId().equals(userId)) {
                        return Result.<Void>error(ListingErrorCodes.NOT_LISTING_OWNER);
                    }
                    showcase.setStatus(ShowcaseStatus.CANCELLED);
                    showcaseRepository.save(showcase);
                    return Result.<Void>success();
                })
                .orElseGet(() -> Result.error(ShowcaseErrorCodes.SHOWCASE_NOT_FOUND));
    }

    @Override
    @Transactional
    public void expireShowcases() {
        List<Showcase> expiredShowcases = showcaseRepository.findByStatusAndEndDateLessThanEqual(
                ShowcaseStatus.ACTIVE, LocalDateTime.now());

        expiredShowcases.forEach(showcase -> showcase.setStatus(ShowcaseStatus.EXPIRED));
        showcaseRepository.saveAll(expiredShowcases);
    }

    @Override
    public ShowcasePricingDto getShowcasePricingConfig() {
        log.info("Getting showcase pricing configuration");
        return showcaseMapper.toPricingDto(showcaseConfig.getDaily().getCost(), showcaseConfig.getFee().getTax());
    }
}
