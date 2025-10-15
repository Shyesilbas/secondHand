package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateRepository;
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
public class RealEstateListingService {

    private final RealEstateRepository realEstateRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final RealEstateListingFilterService realEstateListingFilterService;
    private final PriceHistoryService priceHistoryService;

    @Transactional
    public UUID createRealEstateListing(RealEstateCreateRequest request, User seller) {

        RealEstateListing realEstateListing = listingMapper.toRealEstateEntity(request);
        realEstateListing.setSeller(seller);

        RealEstateListing saved =  realEstateRepository.save(realEstateListing);
        log.info("Real estate listing created: {}", realEstateListing.getId());

        return saved.getId();

    }

    @Transactional
    public void updateRealEstateListing(UUID id, RealEstateUpdateRequest request, User currentUser) {
        listingService.validateOwnership(id, currentUser);

        RealEstateListing existing = realEstateRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "Real Estate listing not found",
                        HttpStatus.NOT_FOUND,
                        "LISTING_NOT_FOUND"
                ));

        listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        var oldPrice = existing.getPrice();
        var oldCurrency = existing.getCurrency();

        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);

        request.adType().ifPresent(existing::setAdType);
        request.realEstateType().ifPresent(existing::setRealEstateType);
        request.heatingType().ifPresent(existing::setHeatingType);
        request.ownerType().ifPresent(existing::setOwnerType);
        request.squareMeters().ifPresent(existing::setSquareMeters);
        request.roomCount().ifPresent(existing::setRoomCount);
        request.bathroomCount().ifPresent(existing::setBathroomCount);
        request.floor().ifPresent(existing::setFloor);
        request.buildingAge().ifPresent(existing::setBuildingAge);
        request.furnished().ifPresent(existing::setFurnished);

        realEstateRepository.save(existing);

        if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                    existing,
                    oldPrice,
                    existing.getPrice(),
                    existing.getCurrency(),
                    "Price updated via listing edit"
            );
        }

        log.info("Real estate listing updated: {}", id);
    }

    public Page<ListingDto> filterRealEstate(RealEstateFilterDto filters) {
        log.info("Filtering vehicle listings with criteria: {}", filters);
        return realEstateListingFilterService.filterRealEstates(filters);
    }

    public RealEstateListingDto getRealEstateDetails(UUID id) {
        RealEstateListing realEstateListing = realEstateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Real Estate listing not found"));
        return listingMapper.toRealEstateDto(realEstateListing);
    }


}
