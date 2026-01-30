package com.serhat.secondhand.listing.sports;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.sports.SportsListingRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.sports.SportsSpecValidator;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SportsListingService {

    private final SportsListingRepository sportsRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final SportsListingFilterService sportsListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final UserService userService;
    private final ListingValidationEngine listingValidationEngine;
    private final List<SportsSpecValidator> sportsSpecValidators;
    private final SportsMapper sportsMapper;
    private final SportsListingResolver sportsListingResolver;

    @Transactional
    public Result<UUID> createSportsListing(SportsCreateRequest request, Long sellerId) {
        log.info("Creating sports listing for sellerId: {}", sellerId);

        var userResult = userService.findById(sellerId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User seller = userResult.getData();

        SportsListing entity = listingMapper.toSportsEntity(request);
        if (entity.getQuantity() == null || entity.getQuantity() < 1) {
            return Result.error("Invalid quantity for sports listing", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        var resolutionResult = sportsListingResolver.resolve(request.disciplineId(), request.equipmentTypeId(), request.conditionId());
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }
        SportsResolution res = resolutionResult.getData();
        entity.setDiscipline(res.discipline());
        entity.setEquipmentType(res.equipmentType());
        entity.setCondition(res.condition());

        entity.setSeller(seller);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(entity, sportsSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        SportsListing saved = sportsRepository.save(entity);
        log.info("Sports listing created: {}", saved.getId());

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateSportsListing(UUID id, SportsUpdateRequest request, Long currentUserId) {
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        SportsListing existing = sportsRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Sports listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateEditableStatus(existing);
        if (statusResult.isError()) {
            return statusResult;
        }

        var oldPrice = existing.getPrice();

        Result<Void> quantityResult = listingService.applyQuantityUpdate(existing, request.quantity());
        if (quantityResult.isError()) {
            return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
        }
        Result<Void> applyResult = sportsListingResolver.apply(existing, request.disciplineId(), request.equipmentTypeId(), request.conditionId());
        if (applyResult.isError()) {
            return Result.error(applyResult.getMessage(), applyResult.getErrorCode());
        }
        sportsMapper.updateEntityFromRequest(existing, request);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(existing, sportsSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        sportsRepository.save(existing);

        priceHistoryService.recordPriceChangeIfUpdated(
                existing,
                oldPrice,
                request.base() != null ? request.base().price() : null,
                "Price updated via listing edit"
        );
        log.info("Sports listing updated: {}", id);
        return Result.success();
    }

    public SportsListingDto getSportsDetails(UUID id) {
        SportsListing entity = sportsRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sports listing not found"));
        return listingMapper.toSportsDto(entity);
    }

    public Page<ListingDto> filterSports(SportsListingFilterDto filters) {
        return sportsListingFilterService.filterSports(filters);
    }
}