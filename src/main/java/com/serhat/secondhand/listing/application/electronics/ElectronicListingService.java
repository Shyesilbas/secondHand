package com.serhat.secondhand.listing.application.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.category.AbstractListingService;
import com.serhat.secondhand.listing.application.common.ListingValidationService;
import com.serhat.secondhand.listing.application.filter.GenericListingFilterService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicListingRepository;
import com.serhat.secondhand.listing.validation.common.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.electronics.ElectronicSpecValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.inventory.application.InventoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ElectronicListingService extends AbstractListingService<ElectronicListing, ElectronicCreateRequest> {

    private final ElectronicListingRepository repository;
    private final GenericListingFilterService<ElectronicListing, ElectronicListingFilterDto> genericFilterService;
    private final ElectronicsFilterPredicateBuilder predicateBuilder;
    private final List<ElectronicSpecValidator> electronicSpecValidators;
    private final ElectronicListingResolver electronicListingResolver;

    public ElectronicListingService(
            ElectronicListingRepository repository,
            ListingValidationService listingValidationService,
            ListingMapper listingMapper,
            GenericListingFilterService<ElectronicListing, ElectronicListingFilterDto> genericFilterService,
            ElectronicsFilterPredicateBuilder predicateBuilder,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<ElectronicSpecValidator> electronicSpecValidators,
            ElectronicListingResolver electronicListingResolver,
            InventoryService inventoryService) {
        super(userService, listingValidationService, listingMapper, listingValidationEngine, inventoryService);
        this.repository = repository;
        this.genericFilterService = genericFilterService;
        this.predicateBuilder = predicateBuilder;
        this.electronicSpecValidators = electronicSpecValidators;
        this.electronicListingResolver = electronicListingResolver;
    }

    @org.springframework.cache.annotation.CacheEvict(value = "userProfile", allEntries = true)
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

    @Override
    protected Integer extractQuantity(ElectronicCreateRequest request) {
        return request.quantity();
    }

    @Transactional
    @TrackPriceChange(reason = "Price updated via listing edit")
    @org.springframework.cache.annotation.CacheEvict(value = "userProfile", allEntries = true)
    public Result<Void> updateElectronicListings(UUID id, ElectronicUpdateRequest request, Long currentUserId) {
        return standardUpdate(
                id, request, currentUserId,
                request.quantity(),
                repository::findById,
                existing -> electronicListingResolver.apply(
                        existing,
                        request.electronicTypeId(),
                        request.electronicBrandId(),
                        request.electronicModelId()),
                (existing, req) -> listingMapper.updateElectronic(existing, req),
                existing -> listingValidationEngine.cleanupAndValidate(existing, electronicSpecValidators)
        );
    }

    public Page<ElectronicListingDto> findByElectronicType(UUID electronicTypeId, Pageable pageable) {
        return repository.findByElectronicType_Id(electronicTypeId, pageable)
                .map(listingMapper::toElectronicDto);
    }

    public ElectronicListingDto getElectronicDetails(UUID id) {
        ElectronicListing electronic = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Electronic listing not found"));
        return listingMapper.toElectronicDto(electronic);
    }

    public Page<ListingDto> filterElectronics(ElectronicListingFilterDto filters) {
        return genericFilterService.filter(filters, ElectronicListing.class, predicateBuilder);
    }
}
