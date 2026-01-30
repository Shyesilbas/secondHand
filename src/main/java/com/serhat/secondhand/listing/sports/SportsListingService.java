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
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.sports.SportConditionRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportDisciplineRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportEquipmentTypeRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportsListingRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.sports.SportsSpecValidator;
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
public class SportsListingService {

    private final SportsListingRepository sportsRepository;
    private final SportDisciplineRepository sportDisciplineRepository;
    private final SportEquipmentTypeRepository sportEquipmentTypeRepository;
    private final SportConditionRepository sportConditionRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final SportsListingFilterService sportsListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final ListingValidationEngine listingValidationEngine;
    private final List<SportsSpecValidator> sportsSpecValidators;

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

        var discipline = sportDisciplineRepository.findById(request.disciplineId()).orElse(null);
        if (discipline == null) {
            return Result.error("Sport discipline not found", "SPORT_DISCIPLINE_NOT_FOUND");
        }
        var equipmentType = sportEquipmentTypeRepository.findById(request.equipmentTypeId()).orElse(null);
        if (equipmentType == null) {
            return Result.error("Sport equipment type not found", "SPORT_EQUIPMENT_TYPE_NOT_FOUND");
        }
        var condition = sportConditionRepository.findById(request.conditionId()).orElse(null);
        if (condition == null) {
            return Result.error("Sport condition not found", "SPORT_CONDITION_NOT_FOUND");
        }

        entity.setDiscipline(discipline);
        entity.setEquipmentType(equipmentType);
        entity.setCondition(condition);

        entity.setSeller(seller);
        entity.setListingFeePaid(true);
        entity.setStatus(ListingStatus.ACTIVE);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(entity, sportsSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        SportsListing saved = sportsRepository.save(entity);
        log.info("Sports listing created: {}", saved.getId());

        eventPublisher.publishEvent(new NewListingCreatedEvent(this, saved));

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateSportsListing(UUID id, SportsUpdateRequest request, Long currentUserId) {
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        SportsListing existing = sportsRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Sports listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        if (statusResult.isError()) {
            return Result.error(statusResult.getMessage(), statusResult.getErrorCode());
        }

        var oldPrice = existing.getPrice();

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

        request.disciplineId().ifPresent(disciplineId -> {
            var discipline = sportDisciplineRepository.findById(disciplineId).orElse(null);
            if (discipline != null) {
                existing.setDiscipline(discipline);
            }
        });
        request.equipmentTypeId().ifPresent(equipmentTypeId -> {
            var equipmentType = sportEquipmentTypeRepository.findById(equipmentTypeId).orElse(null);
            if (equipmentType != null) {
                existing.setEquipmentType(equipmentType);
            }
        });
        request.conditionId().ifPresent(conditionId -> {
            var condition = sportConditionRepository.findById(conditionId).orElse(null);
            if (condition != null) {
                existing.setCondition(condition);
            }
        });

        if (request.quantity().isPresent() && request.quantity().get() < 1) {
            return Result.error("Quantity must be at least 1", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(existing, sportsSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

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