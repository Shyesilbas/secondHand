package com.serhat.secondhand.showcase.application;

import com.serhat.secondhand.core.config.ShowcaseConfig;
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
import com.serhat.secondhand.user.application.PlanValidator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
    private final PlanValidator planValidator;

    private <T> Result<T> validateShowcaseDays(int days) {
        Result<Void> validationResult = showcaseValidator.validateDaysCount(days);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        return null;
    }

    private BigDecimal getDailyCostWithTax() {
        return showcaseMapper.calculateDailyCostWithTax(
                showcaseConfig.getDaily().getCost(),
                showcaseConfig.getFee().getTax()
        );
    }

    @Override
    public Result<Showcase> createShowcase(Long userId, ShowcasePaymentRequest request) {
        log.info("Creating showcase for user ID: {} and listing ID: {}", userId, request.listingId());

        // 1. Validate Days
        Result<Showcase> daysError = validateShowcaseDays(request.days());
        if (daysError != null) return daysError;

        // 2. Resolve User & Listing
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();

        int currentSlotCount = showcaseRepository.countActiveByUserId(userId);
        planValidator.checkShowcaseSlot(user, currentSlotCount);

        return listingService.findById(request.listingId())
                .map(listing -> createShowcaseInternal(request, user, listing, userId))
                .orElseGet(() -> Result.error("Listing not found", ListingErrorCodes.LISTING_NOT_FOUND.toString()));
    }

    private Result<Showcase> createShowcaseInternal(ShowcasePaymentRequest request, User user, Listing listing,
            Long userId) {
        // Pricing Calculation
        BigDecimal showcaseDailyCost = showcaseConfig.getDaily().getCost();
        BigDecimal totalCost = showcaseMapper.calculateTotalCost(getDailyCostWithTax(), request.days());

        // Payment Processing
        PaymentRequest paymentRequest = paymentRequestFactory.buildShowcasePaymentRequest(user, listing, request,
                totalCost);
        var paymentResult = paymentProcessor.executeSinglePayment(userId, paymentRequest);

        if (paymentResult.isError()) {
            return Result.error(ShowcaseErrorCodes.PAYMENT_FAILED);
        }

        // Success - Save Showcase
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusDays(request.days());

        Showcase showcase = showcaseMapper.fromCreateRequest(request, user, listing, showcaseDailyCost, totalCost,
                startDate, endDate);
        return Result.success(showcaseRepository.save(showcase));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ShowcaseDto> getActiveShowcases(int page, int size) {
        log.info("Fetching active showcases from database | page={}, size={}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<Showcase> activeShowcases = showcaseRepository.findActiveShowcasesPage(ShowcaseStatus.ACTIVE,
                LocalDateTime.now(), pageable);
        List<ShowcaseDto> dtoList = showcaseMapper.toDtos(activeShowcases.getContent(), null);


        List<ShowcaseDto> safeDtoList = dtoList.stream()
                .filter(dto -> dto != null && dto.listing() != null && dto.listing().getType() != null)
                .toList();

        if (safeDtoList.size() != dtoList.size()) {
            log.warn("Filtered {} showcase DTO(s) with null listing/type before response",
                    dtoList.size() - safeDtoList.size());
        }

        return new org.springframework.data.domain.PageImpl<>(safeDtoList, pageable, activeShowcases.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowcaseDto> getUserShowcases(Long userId) {
        List<Showcase> activeShowcases = showcaseRepository.findByUserIdAndStatusWithListing(userId,
                ShowcaseStatus.ACTIVE);
        return showcaseMapper.toDtos(activeShowcases, userId);
    }

    @Override
    public Result<Void> extendShowcase(Long userId, UUID showcaseId, ShowcasePaymentRequest request) {
        Result<Void> daysError = validateShowcaseDays(request.days());
        if (daysError != null) return daysError;

        return showcaseRepository.findById(showcaseId)
                .map(showcase -> performExtension(showcase, userId, request))
                .orElseGet(() -> Result.error(ShowcaseErrorCodes.SHOWCASE_NOT_FOUND));
    }

    private Result<Void> performExtension(Showcase showcase, Long userId, ShowcasePaymentRequest request) {
        if (!showcase.getUser().getId().equals(userId)) {
            return Result.error(ListingErrorCodes.NOT_LISTING_OWNER);
        }

        Result<Void> validationResult = showcaseValidator.validateIsActive(showcase);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        // Pricing Calculation for extension
        BigDecimal additionalCost = showcaseMapper.calculateTotalCost(getDailyCostWithTax(), request.days());

        // Payment Processing for extension
        PaymentRequest paymentRequest = paymentRequestFactory.buildShowcaseExtensionRequest(
                showcase.getUser(), showcase.getListing(), request, additionalCost);

        var paymentResult = paymentProcessor.executeSinglePayment(userId, paymentRequest);
        if (paymentResult.isError()) {
            return Result.error("Payment for extension failed: " + paymentResult.getMessage(),
                    ShowcaseErrorCodes.PAYMENT_FAILED.toString());
        }

        // Success - Update dates and cost
        showcase.setEndDate(showcase.getEndDate().plusDays(request.days()));
        showcase.setTotalCost(showcase.getTotalCost().add(additionalCost));

        showcaseRepository.save(showcase);
        log.info("Successfully extended showcase {} by {} days for user {}", showcase.getId(), request.days(), userId);
        return Result.success();
    }

    @Override
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
        return showcaseMapper.toPricingDto(
                showcaseConfig.getDaily().getCost(),
                showcaseConfig.getFee().getTax(),
                showcaseConfig.getBulkDiscount().getListingThreshold(),
                showcaseConfig.getBulkDiscount().getListingDiscountPercentage());
    }

    @Override
    public Result<List<Showcase>> createBulkShowcase(Long userId,
            com.serhat.secondhand.showcase.dto.BulkShowcasePaymentRequest request) {
        log.info("Creating bulk showcase for user ID: {} for {} listings", userId, request.listingIds().size());

        // 1. Validate Days
        Result<List<Showcase>> daysError = validateShowcaseDays(request.days());
        if (daysError != null) return daysError;

        // 2. Resolve User
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();

        // 3. Resolve Listings
        List<Listing> listings = listingService.findAllByIds(request.listingIds());
        if (listings.size() != request.listingIds().size()) {
            return Result.error("Some listings were not found", ListingErrorCodes.LISTING_NOT_FOUND.toString());
        }

        // Validate Showcase Status
        LocalDateTime now = LocalDateTime.now();
        for (Listing listing : listings) {
            if (showcaseRepository.existsByListingIdAndEndDateAfter(listing.getId(), now)) {
                return Result.error("Listing '" + listing.getTitle() + "' is already in an active showcase",
                        ShowcaseErrorCodes.ALREADY_IN_SHOWCASE.toString());
            }
        }

        // 4. Calculate Costs
        BigDecimal dailyCost = showcaseConfig.getDaily().getCost();

        BigDecimal unitTotalCost = showcaseMapper.calculateTotalCost(getDailyCostWithTax(), request.days());
        BigDecimal totalAmountBeforeDiscount = unitTotalCost.multiply(BigDecimal.valueOf(listings.size()));

        BigDecimal finalTotalAmount = totalAmountBeforeDiscount;
        Integer threshold = showcaseConfig.getBulkDiscount().getListingThreshold();
        Integer discountPct = showcaseConfig.getBulkDiscount().getListingDiscountPercentage();

        if (listings.size() >= threshold) {
            BigDecimal discountMultiplier = BigDecimal.valueOf(100 - discountPct)
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            finalTotalAmount = totalAmountBeforeDiscount.multiply(discountMultiplier);
            log.info("Applying bulk discount: {}% for {} listings (Threshold: {})", discountPct, listings.size(),
                    threshold);
        }

        // 5. Payment
        String listingTitles = listings.stream()
                .map(Listing::getTitle)
                .collect(java.util.stream.Collectors.joining(", "));
        String paymentDescription = "Bulk Showcase Payment for " + listings.size() + " listings: " + listingTitles;

        String idempotencyKey = (request.idempotencyKey() != null && !request.idempotencyKey().isBlank())
                ? request.idempotencyKey()
                : "bulk-showcase-" + userId + "-" + java.util.Objects.hash(request.listingIds(), request.days());

        Listing firstListing = listings.get(0);
        ShowcasePaymentRequest tempRequest = new ShowcasePaymentRequest(
                firstListing.getId(), request.days(),
                request.providerName() != null ? request.providerName()
                        : "EWALLET",
                request.verificationCode(), request.agreementsAccepted(), request.acceptedAgreementIds(),
                idempotencyKey);

        PaymentRequest paymentRequest = paymentRequestFactory.buildShowcasePaymentRequest(user, firstListing,
                tempRequest, finalTotalAmount);

        // Override title and description for bulk
        paymentRequest = paymentRequest.toBuilder()
                .listingTitle("Bulk Showcase Payment")
                .description(paymentDescription)
                .build();

        var paymentResult = paymentProcessor.executeSinglePayment(userId, paymentRequest);

        if (paymentResult.isError()) {
            return Result.error("Bulk payment failed: " + paymentResult.getMessage(),
                    ShowcaseErrorCodes.PAYMENT_FAILED.toString());
        }

        // 6. Save Showcases
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusDays(request.days());
        BigDecimal finalUnitCost = finalTotalAmount.divide(BigDecimal.valueOf(listings.size()), 2,
                java.math.RoundingMode.HALF_UP);

        List<Showcase> createdShowcases = listings.stream()
                .map(l -> showcaseMapper.fromCreateRequest(
                        new ShowcasePaymentRequest(l.getId(), request.days(), null, null, true, null, null),
                        user, l, dailyCost, finalUnitCost, startDate, endDate))
                .map(showcaseRepository::save)
                .toList();

        return Result.success(createdShowcases);
    }
}
