package com.serhat.secondhand.listing.sports;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.AbstractListingService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
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
import com.serhat.secondhand.user.application.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class SportsListingService extends AbstractListingService<SportsListing, SportsCreateRequest> {

    private final SportsListingRepository sportsRepository;
    private final SportsListingFilterService sportsListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final List<SportsSpecValidator> sportsSpecValidators;
    private final SportsMapper sportsMapper;
    private final SportsListingResolver sportsListingResolver;
    
    public SportsListingService(
            SportsListingRepository sportsRepository,
            IListingService listingService,
            ListingMapper listingMapper,
            SportsListingFilterService sportsListingFilterService,
            PriceHistoryService priceHistoryService,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<SportsSpecValidator> sportsSpecValidators,
            SportsMapper sportsMapper,
            SportsListingResolver sportsListingResolver) {
        super(userService, listingService, listingMapper, listingValidationEngine);
        this.sportsRepository = sportsRepository;
        this.sportsListingFilterService = sportsListingFilterService;
        this.priceHistoryService = priceHistoryService;
        this.sportsSpecValidators = sportsSpecValidators;
        this.sportsMapper = sportsMapper;
        this.sportsListingResolver = sportsListingResolver;
    }

    public Result<UUID> createSportsListing(SportsCreateRequest request, Long sellerId) {
        return createListing(request, sellerId);
    }
    
    @Override
    protected String getListingType() {
        return "Sports";
    }
    
    @Override
    protected SportsListing mapRequestToEntity(SportsCreateRequest request) {
        return listingMapper.toSportsEntity(request);
    }
    
    @Override
    protected boolean requiresQuantityValidation() {
        return true;
    }
    
    @Override
    protected Result<SportsResolution> resolveEntities(SportsCreateRequest request) {
        return sportsListingResolver.resolve(
                request.disciplineId(),
                request.equipmentTypeId(),
                request.conditionId()
        );
    }
    
    @Override
    protected void applyResolution(SportsListing entity, Object resolution) {
        SportsResolution res = (SportsResolution) resolution;
        entity.setDiscipline(res.discipline());
        entity.setEquipmentType(res.equipmentType());
        entity.setCondition(res.condition());
    }
    
    @Override
    protected Result<Void> validate(SportsListing entity) {
        return listingValidationEngine.cleanupAndValidate(entity, sportsSpecValidators);
    }
    
    @Override
    protected SportsListing save(SportsListing entity) {
        return sportsRepository.save(entity);
    }

    @Transactional
    @TrackPriceChange(reason = "Price updated via listing edit")
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