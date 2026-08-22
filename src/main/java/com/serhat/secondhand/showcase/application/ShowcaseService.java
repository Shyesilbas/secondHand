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
import java.util.ArrayList;
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
    private final ShowcaseRedisManagerService showcaseRedisManagerService;

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
        Showcase saved = showcaseRepository.save(showcase);
        showcaseRedisManagerService.registerActiveShowcase(saved.getId(), listing.getId(), endDate);
        return Result.success(saved);
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
        LocalDateTime newEndDate = showcase.getEndDate().plusDays(request.days());
        showcase.setEndDate(newEndDate);
        showcase.setTotalCost(showcase.getTotalCost().add(additionalCost));

        showcaseRepository.save(showcase);
        showcaseRedisManagerService.registerActiveShowcase(showcase.getId(), showcase.getListing().getId(), newEndDate);
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
                    showcaseRedisManagerService.removeShowcase(showcase.getListing().getId());
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
    @Transactional
    public Result<List<Showcase>> createBulkShowcase(Long userId, com.serhat.secondhand.showcase.dto.BulkShowcasePaymentRequest request) {
        if (request.listingIds() == null || request.listingIds().isEmpty()) {
            return Result.error("Listing IDs cannot be empty");
        }

        List<Showcase> createdShowcases = new ArrayList<>();
        for (UUID listingId : request.listingIds()) {
            ShowcasePaymentRequest singleRequest = new ShowcasePaymentRequest(
                listingId,
                request.days() != null ? request.days() : 1,
                request.providerName(),
                request.verificationCode(),
                request.agreementsAccepted(),
                request.acceptedAgreementIds(),
                request.idempotencyKey()
            );

            Result<Showcase> singleResult = createShowcase(userId, singleRequest);
            if (singleResult.isError()) {
                return Result.error(singleResult.getMessage(), singleResult.getErrorCode());
            }
            createdShowcases.add(singleResult.getData());
        }

        return Result.success(createdShowcases);
    }
}
