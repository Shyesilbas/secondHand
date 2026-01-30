package com.serhat.secondhand.listing.application.electronic;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicListingRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.electronic.ElectronicSpecValidator;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ElectronicListingService {
    private final ElectronicListingRepository repository;
    private final ElectronicBrandRepository brandRepository;
    private final ElectronicTypeRepository typeRepository;
    private final ElectronicModelRepository modelRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final ElectronicListingFilterService electronicListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final ListingValidationEngine listingValidationEngine;
    private final List<ElectronicSpecValidator> electronicSpecValidators;

    @Transactional
    public Result<UUID> createElectronicListing(ElectronicCreateRequest request, Long sellerId) {
        log.info("Creating electronic listing for sellerId: {}", sellerId);

        // 1. Resolve Seller
        var userResult = userService.findById(sellerId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User seller = userResult.getData();

        // 2. Map and Initial Validation
        ElectronicListing electronicListing = listingMapper.toElectronicEntity(request);
        if (electronicListing.getQuantity() == null || electronicListing.getQuantity() < 1) {
            return Result.error("Invalid quantity for electronic listing", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        ElectronicType electronicType = resolveType(request.electronicTypeId());
        if (electronicType == null) {
            return Result.error("Electronic type not found", "ELECTRONIC_TYPE_NOT_FOUND");
        }
        ElectronicBrand electronicBrand = resolveBrand(request.electronicBrandId());
        if (electronicBrand == null) {
            return Result.error("Electronic brand not found", "ELECTRONIC_BRAND_NOT_FOUND");
        }
        ElectronicModel electronicModel = resolveModel(request.electronicModelId());
        if (electronicModel == null) {
            return Result.error("Electronic model not found", "ELECTRONIC_MODEL_NOT_FOUND");
        }
        if (electronicModel.getBrand() != null && electronicModel.getBrand().getId() != null
                && !electronicModel.getBrand().getId().equals(electronicBrand.getId())) {
            return Result.error("Electronic model does not match brand", "ELECTRONIC_MODEL_BRAND_MISMATCH");
        }
        if (electronicModel.getType() != null && electronicModel.getType().getId() != null
                && !electronicModel.getType().getId().equals(electronicType.getId())) {
            return Result.error("Electronic model does not match type", "ELECTRONIC_MODEL_TYPE_MISMATCH");
        }

        electronicListing.setElectronicType(electronicType);
        electronicListing.setElectronicBrand(electronicBrand);
        electronicListing.setModel(electronicModel);
        Result<Void> specResult = listingValidationEngine.cleanupAndValidate(electronicListing, electronicSpecValidators);
        if (specResult.isError()) {
            return Result.error(specResult.getMessage(), specResult.getErrorCode());
        }

        electronicListing.setSeller(seller);
        electronicListing.setListingFeePaid(true);
        electronicListing.setStatus(ListingStatus.ACTIVE);

        ElectronicListing saved = repository.save(electronicListing);
        log.info("Electronic listing created: {}", saved.getId());

        eventPublisher.publishEvent(new NewListingCreatedEvent(this, saved));

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateElectronicListings(UUID id, ElectronicUpdateRequest request, Long currentUserId) {
        // 1. Ownership Check (Updated to Long userId)
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        ElectronicListing existing = repository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Electronic listing not found", "LISTING_NOT_FOUND");
        }

        // 2. Status Validation
        Result<Void> statusResult = listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        if (statusResult.isError()) {
            return Result.error(statusResult.getMessage(), statusResult.getErrorCode());
        }

        var oldPrice = existing.getPrice();

        // 3. Mapping Updates
        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.quantity().ifPresent(q -> {
            if (q >= 1) existing.setQuantity(q);
        });
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);

        request.electronicTypeId().ifPresent(typeId -> {
            ElectronicType type = resolveType(typeId);
            if (type != null) {
                existing.setElectronicType(type);
            }
        });
        request.electronicBrandId().ifPresent(brandId -> {
            ElectronicBrand brand = resolveBrand(brandId);
            if (brand != null) {
                existing.setElectronicBrand(brand);
            }
        });
        request.electronicModelId().ifPresent(modelId -> {
            ElectronicModel model = resolveModel(modelId);
            if (model != null) {
                existing.setModel(model);
            }
        });
        request.origin().ifPresent(existing::setOrigin);
        request.warrantyProof().ifPresent(existing::setWarrantyProof);
        request.color().ifPresent(existing::setColor);
        request.year().ifPresent(existing::setYear);
        request.ram().ifPresent(existing::setRam);
        request.storage().ifPresent(existing::setStorage);
        request.storageType().ifPresent(existing::setStorageType);
        request.processor().ifPresent(existing::setProcessor);
        request.screenSize().ifPresent(existing::setScreenSize);
        request.gpuModel().ifPresent(existing::setGpuModel);
        request.operatingSystem().ifPresent(existing::setOperatingSystem);
        request.batteryHealthPercent().ifPresent(existing::setBatteryHealthPercent);
        request.batteryCapacityMah().ifPresent(existing::setBatteryCapacityMah);
        request.cameraMegapixels().ifPresent(existing::setCameraMegapixels);
        request.supports5g().ifPresent(existing::setSupports5g);
        request.dualSim().ifPresent(existing::setDualSim);
        request.hasNfc().ifPresent(existing::setHasNfc);
        request.connectionType().ifPresent(existing::setConnectionType);
        request.wireless().ifPresent(existing::setWireless);
        request.noiseCancelling().ifPresent(existing::setNoiseCancelling);
        request.hasMicrophone().ifPresent(existing::setHasMicrophone);
        request.batteryLifeHours().ifPresent(existing::setBatteryLifeHours);

        if (request.quantity().isPresent() && request.quantity().get() < 1) {
            return Result.error("Quantity must be at least 1", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        if (existing.getElectronicBrand() != null && existing.getModel() != null
                && existing.getElectronicBrand().getId() != null
                && existing.getModel().getBrand() != null
                && existing.getModel().getBrand().getId() != null
                && !existing.getElectronicBrand().getId().equals(existing.getModel().getBrand().getId())) {
            return Result.error("Electronic model does not match brand", "ELECTRONIC_MODEL_BRAND_MISMATCH");
        }
        if (existing.getElectronicType() != null && existing.getModel() != null
                && existing.getElectronicType().getId() != null
                && existing.getModel().getType() != null
                && existing.getModel().getType().getId() != null
                && !existing.getElectronicType().getId().equals(existing.getModel().getType().getId())) {
            return Result.error("Electronic model does not match type", "ELECTRONIC_MODEL_TYPE_MISMATCH");
        }

        Result<Void> specResult = listingValidationEngine.cleanupAndValidate(existing, electronicSpecValidators);
        if (specResult.isError()) {
            return Result.error(specResult.getMessage(), specResult.getErrorCode());
        }

        repository.save(existing);

        // 5. Price History
        if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                    existing.getId(),
                    existing.getTitle(),
                    oldPrice,
                    existing.getPrice(),
                    existing.getCurrency(),
                    "Price updated via listing edit"
            );
        }

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

    private ElectronicBrand resolveBrand(UUID id) {
        if (id == null) {
            return null;
        }
        return brandRepository.findById(id).orElse(null);
    }

    private ElectronicType resolveType(UUID id) {
        if (id == null) {
            return null;
        }
        return typeRepository.findById(id).orElse(null);
    }

    private ElectronicModel resolveModel(UUID id) {
        if (id == null) {
            return null;
        }
        return modelRepository.findById(id).orElse(null);
    }
}