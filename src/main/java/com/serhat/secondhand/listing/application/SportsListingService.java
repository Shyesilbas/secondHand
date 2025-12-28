package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.sports.SportsListingRepository;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
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

    @Transactional
    public UUID createSportsListing(SportsCreateRequest request, User seller) {
        SportsListing entity = listingMapper.toSportsEntity(request);
        if (entity.getQuantity() == null || entity.getQuantity() < 1) {
            throw new BusinessException(ListingErrorCodes.INVALID_QUANTITY);
        }
        entity.setSeller(seller);
        entity.setListingFeePaid(true); // Otomatik olarak listing fee ödendi olarak işaretle
        entity.setStatus(ListingStatus.ACTIVE); // Otomatik olarak ACTIVE olarak ayarla
        SportsListing saved = sportsRepository.save(entity);
        log.info("Sports listing created: {}", saved.getId());
        return saved.getId();
    }

    @Transactional
    public void updateSportsListing(UUID id, SportsUpdateRequest request, User currentUser) {
        listingService.validateOwnership(id, currentUser);

        SportsListing existing = sportsRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "Sports listing not found",
                        HttpStatus.NOT_FOUND,
                        "LISTING_NOT_FOUND"
                ));

        listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);

        var oldPrice = existing.getPrice();

        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.quantity().ifPresent(q -> {
            if (q < 1) {
                throw new BusinessException(ListingErrorCodes.INVALID_QUANTITY);
            }
            existing.setQuantity(q);
        });
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);
        request.discipline().ifPresent(existing::setDiscipline);
        request.equipmentType().ifPresent(existing::setEquipmentType);
        request.condition().ifPresent(existing::setCondition);

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


