package com.serhat.secondhand.listing.application.electronic;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.AbstractListingService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicListingRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.electronic.ElectronicSpecValidator;
import com.serhat.secondhand.user.application.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ElectronicListingService extends AbstractListingService<ElectronicListing, ElectronicCreateRequest> {
    private final ElectronicListingRepository repository;
    private final ElectronicListingFilterService electronicListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final List<ElectronicSpecValidator> electronicSpecValidators;
    private final ElectronicMapper electronicMapper;
    private final ElectronicListingResolver electronicListingResolver;
    
    public ElectronicListingService(
            ElectronicListingRepository repository,
            IListingService listingService,
            ListingMapper listingMapper,
            ElectronicListingFilterService electronicListingFilterService,
            PriceHistoryService priceHistoryService,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<ElectronicSpecValidator> electronicSpecValidators,
            ElectronicMapper electronicMapper,
            ElectronicListingResolver electronicListingResolver) {
        super(userService, listingService, listingMapper, listingValidationEngine);
        this.repository = repository;
        this.electronicListingFilterService = electronicListingFilterService;
        this.priceHistoryService = priceHistoryService;
        this.electronicSpecValidators = electronicSpecValidators;
        this.electronicMapper = electronicMapper;
        this.electronicListingResolver = electronicListingResolver;
    }

    public Result<UUID> createElectronicListing(ElectronicCreateRequest request, Long sellerId) {
        return createListing(request, sellerId);
    }
    
    @Override
    protected String getListingType() {
        return "Electronic";
    }
    
    @Override
    protected ElectronicListing mapRequestToEntity(ElectronicCreateRequest request) {
        return listingMapper.toElectronicEntity(request);
    }
    
    @Override
    protected Result<ElectronicResolution> resolveEntities(ElectronicCreateRequest request) {
        return electronicListingResolver.resolve(
                request.electronicTypeId(),
                request.electronicBrandId(),
                request.electronicModelId()
        );
    }
    
    @Override
    protected void applyResolution(ElectronicListing entity, Object resolution) {
        ElectronicResolution res = (ElectronicResolution) resolution;
        entity.setElectronicType(res.type());
        entity.setElectronicBrand(res.brand());
        entity.setModel(res.model());
    }
    
    @Override
    protected Result<Void> validate(ElectronicListing entity) {
        return listingValidationEngine.cleanupAndValidate(entity, electronicSpecValidators);
    }
    
    @Override
    protected ElectronicListing save(ElectronicListing entity) {
        return repository.save(entity);
    }

    @Transactional
    @TrackPriceChange(reason = "Price updated via listing edit")
    public Result<Void> updateElectronicListings(UUID id, ElectronicUpdateRequest request, Long currentUserId) {
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        ElectronicListing existing = repository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Electronic listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateEditableStatus(existing);
        if (statusResult.isError()) {
            return statusResult;
        }

        Result<Void> quantityResult = listingService.applyQuantityUpdate(existing, request.quantity());
        if (quantityResult.isError()) {
            return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
        }

        Result<Void> resolutionResult = electronicListingResolver.apply(
                existing,
                request.electronicTypeId(),
                request.electronicBrandId(),
                request.electronicModelId()
        );
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }

        electronicMapper.updateEntityFromRequest(existing, request);

        Result<Void> specResult = listingValidationEngine.cleanupAndValidate(existing, electronicSpecValidators);
        if (specResult.isError()) {
            return Result.error(specResult.getMessage(), specResult.getErrorCode());
        }

        repository.save(existing);

        log.info("Electronic listing updated: {}", id);
        return Result.success();
    }

    public List<ElectronicListingDto> findByElectronicType(UUID electronicTypeId) {
        List<ElectronicListing> electronicListings = repository.findByElectronicType_Id(electronicTypeId);
        return electronicListings.stream()
                .map(listingMapper::toElectronicDto)
                .toList();
    }

    public ElectronicListingDto getElectronicDetails(UUID id) {
        ElectronicListing electronic = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Electronic listing not found"));
        return listingMapper.toElectronicDto(electronic);
    }

    public Page<ListingDto> filterElectronics(ElectronicListingFilterDto filters) {
        log.info("Filtering electronics listings with criteria: {}", filters);
        return electronicListingFilterService.filterElectronics(filters);
    }
}