package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicListingRepository;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;

@Service
@RequiredArgsConstructor
@Slf4j
public class ElectronicListingService {
    private final ElectronicListingRepository repository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final ElectronicListingFilterService electronicListingFilterService;
    private final PriceHistoryService priceHistoryService;


    @Transactional
    public UUID createElectronicListing(ElectronicCreateRequest request, User seller) {
        ElectronicListing electronicListing = listingMapper.toElectronicEntity(request);
        if (electronicListing.getQuantity() == null || electronicListing.getQuantity() < 1) {
            throw new BusinessException(ListingErrorCodes.INVALID_QUANTITY);
        }
        if (electronicListing.getElectronicType() == ElectronicType.LAPTOP) {
            if (electronicListing.getRam() == null || electronicListing.getStorage() == null) {
                throw new BusinessException(
                        "ram and storage are required for LAPTOP",
                        HttpStatus.BAD_REQUEST,
                        "LAPTOP_SPECS_REQUIRED"
                );
            }
        } else {
            electronicListing.setRam(null);
            electronicListing.setStorage(null);
            electronicListing.setProcessor(null);
            electronicListing.setScreenSize(null);
        }
        electronicListing.setSeller(seller);
        ElectronicListing saved = repository.save(electronicListing);
        log.info("Electronic listing created: {}", saved.getId());
        return saved.getId();
    }

    @Transactional
    public void updateElectronicListings(UUID id, ElectronicUpdateRequest request, User currentUser) {
        listingService.validateOwnership(id, currentUser);

        ElectronicListing existing = repository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "Electronic listing not found",
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

        request.model().ifPresent(existing::setModel);
        request.electronicType().ifPresent(existing::setElectronicType);
        request.electronicBrand().ifPresent(existing::setElectronicBrand);
        request.origin().ifPresent(existing::setOrigin);
        request.warrantyProof().ifPresent(existing::setWarrantyProof);
        request.color().ifPresent(existing::setColor);
        request.year().ifPresent(existing::setYear);
        request.ram().ifPresent(existing::setRam);
        request.storage().ifPresent(existing::setStorage);
        request.processor().ifPresent(existing::setProcessor);
        request.screenSize().ifPresent(existing::setScreenSize);

        if (existing.getElectronicType() == ElectronicType.LAPTOP) {
            if (existing.getRam() == null || existing.getStorage() == null) {
                throw new BusinessException(
                        "ram and storage are required for LAPTOP",
                        HttpStatus.BAD_REQUEST,
                        "LAPTOP_SPECS_REQUIRED"
                );
            }
        } else {
            existing.setRam(null);
            existing.setStorage(null);
            existing.setProcessor(null);
            existing.setScreenSize(null);
        }

        repository.save(existing);

                if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                existing, 
                oldPrice, 
                existing.getPrice(), 
                existing.getCurrency(), 
                "Price updated via listing edit"
            );
        }
        log.info("electronic listing updated: {}", id);
    }

    public List<ElectronicListingDto> findByElectronicType(ElectronicType electronicType) {
        List<ElectronicListing> electronicListings = repository.findByElectronicType(electronicType);
        return electronicListings.stream()
                .map(listingMapper::toElectronicDto)
                .toList();
    }

    public ElectronicListingDto getElectronicDetails(UUID id) {
        ElectronicListing electronic = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("electronic listing not found"));
        return listingMapper.toElectronicDto(electronic);
    }


    public Page<ListingDto> filterElectronics(ElectronicListingFilterDto filters) {
        log.info("Filtering electronics listings with criteria: {}", filters);
        return electronicListingFilterService.filterElectronics(filters);
    }

}
