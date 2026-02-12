package com.serhat.secondhand.listing.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.AbstractListingService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateRepository;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.realestate.RealEstateSpecValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;

@Service
@Slf4j
public class RealEstateListingService extends AbstractListingService<RealEstateListing, RealEstateCreateRequest> {

    private final RealEstateRepository realEstateRepository;
    private final RealEstateListingFilterService realEstateListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final List<RealEstateSpecValidator> realEstateSpecValidators;
    private final RealEstateMapper realEstateMapper;
    private final RealEstateListingResolver realEstateListingResolver;
    
    public RealEstateListingService(
            RealEstateRepository realEstateRepository,
            IListingService listingService,
            ListingMapper listingMapper,
            RealEstateListingFilterService realEstateListingFilterService,
            PriceHistoryService priceHistoryService,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<RealEstateSpecValidator> realEstateSpecValidators,
            RealEstateMapper realEstateMapper,
            RealEstateListingResolver realEstateListingResolver) {
        super(userService, listingService, listingMapper, listingValidationEngine);
        this.realEstateRepository = realEstateRepository;
        this.realEstateListingFilterService = realEstateListingFilterService;
        this.priceHistoryService = priceHistoryService;
        this.realEstateSpecValidators = realEstateSpecValidators;
        this.realEstateMapper = realEstateMapper;
        this.realEstateListingResolver = realEstateListingResolver;
    }

    public Result<UUID> createRealEstateListing(RealEstateCreateRequest request, Long sellerId) {
        return createListing(request, sellerId);
    }
    
    @Override
    protected String getListingType() {
        return "RealEstate";
    }
    
    @Override
    protected RealEstateListing mapRequestToEntity(RealEstateCreateRequest request) {
        return listingMapper.toRealEstateEntity(request);
    }
    
    @Override
    protected Result<RealEstateResolution> resolveEntities(RealEstateCreateRequest request) {
        return realEstateListingResolver.resolve(
                request.adTypeId(),
                request.realEstateTypeId(),
                request.heatingTypeId(),
                request.ownerTypeId()
        );
    }
    
    @Override
    protected void applyResolution(RealEstateListing entity, Object resolution) {
        RealEstateResolution res = (RealEstateResolution) resolution;
        entity.setAdType(res.adType());
        entity.setRealEstateType(res.realEstateType());
        entity.setHeatingType(res.heatingType());
        entity.setOwnerType(res.ownerType());
    }
    
    @Override
    protected Result<Void> validate(RealEstateListing entity) {
        return listingValidationEngine.cleanupAndValidate(entity, realEstateSpecValidators);
    }
    
    @Override
    protected RealEstateListing save(RealEstateListing entity) {
        return realEstateRepository.save(entity);
    }

    @Transactional
    @TrackPriceChange(reason = "Price updated via listing edit")
    public Result<Void> updateRealEstateListing(UUID id, RealEstateUpdateRequest request, Long currentUserId) {
        log.info("Updating real estate listing: {} by user: {}", id, currentUserId);

        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        RealEstateListing existing = realEstateRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Real Estate listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateEditableStatus(existing);
        if (statusResult.isError()) {
            return statusResult;
        }

        Result<Void> applyResult = realEstateListingResolver.apply(
                existing,
                request.adTypeId(),
                request.realEstateTypeId(),
                request.heatingTypeId(),
                request.ownerTypeId()
        );
        if (applyResult.isError()) {
            return Result.error(applyResult.getMessage(), applyResult.getErrorCode());
        }
        realEstateMapper.updateEntityFromRequest(existing, request);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(existing, realEstateSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        realEstateRepository.save(existing);

        log.info("Real estate listing updated: {}", id);
        return Result.success();
    }

    public Page<ListingDto> filterRealEstate(RealEstateFilterDto filters) {
        log.info("Filtering real estate listings with criteria: {}", filters);
        return realEstateListingFilterService.filterRealEstates(filters);
    }

    public RealEstateListingDto getRealEstateDetails(UUID id) {
        RealEstateListing realEstateListing = realEstateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Real Estate listing not found"));
        return listingMapper.toRealEstateDto(realEstateListing);
    }

}