package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.sports.SportsListingRepository;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Result<UUID> createSportsListing(SportsCreateRequest request, User seller) {
        SportsListing entity = listingMapper.toSportsEntity(request);
        if (entity.getQuantity() == null || entity.getQuantity() < 1) {
            return Result.error(ListingErrorCodes.INVALID_QUANTITY);
        }
        entity.setSeller(seller);
        entity.setListingFeePaid(true);
        entity.setStatus(ListingStatus.ACTIVE);
        SportsListing saved = sportsRepository.save(entity);
        log.info("Sports listing created: {}", saved.getId());
        
        eventPublisher.publishEvent(new NewListingCreatedEvent(this, saved));
        
        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateSportsListing(UUID id, SportsUpdateRequest request, User currentUser) {
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUser);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        SportsListing existing = sportsRepository.findById(id)
                .orElse(null);

        if (existing == null) {
            return Result.error("Sports listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        if (statusResult.isError()) {
            return statusResult;
        }

        var oldPrice = existing.getPrice();

        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.quantity().ifPresent(q -> {
            if (q < 1) {
                return;
            }
            existing.setQuantity(q);
        });
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);
        request.discipline().ifPresent(existing::setDiscipline);
        request.equipmentType().ifPresent(existing::setEquipmentType);
        request.condition().ifPresent(existing::setCondition);

        if (request.quantity().isPresent() && request.quantity().get() < 1) {
            return Result.error(ListingErrorCodes.INVALID_QUANTITY);
        }

        if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                    existing,
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


