package com.serhat.secondhand.listing.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.repository.realestate.HeatingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.ListingOwnerTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateAdTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RealEstateListingResolver {
    private final RealEstateTypeRepository realEstateTypeRepository;
    private final RealEstateAdTypeRepository realEstateAdTypeRepository;
    private final HeatingTypeRepository heatingTypeRepository;
    private final ListingOwnerTypeRepository listingOwnerTypeRepository;

    public Result<RealEstateResolution> resolve(UUID adTypeId, UUID realEstateTypeId, UUID heatingTypeId, UUID ownerTypeId) {
        var adType = realEstateAdTypeRepository.findById(adTypeId).orElse(null);
        if (adType == null) return Result.error("Real estate ad type not found", "REAL_ESTATE_AD_TYPE_NOT_FOUND");

        var realEstateType = realEstateTypeRepository.findById(realEstateTypeId).orElse(null);
        if (realEstateType == null) return Result.error("Real estate type not found", "REAL_ESTATE_TYPE_NOT_FOUND");

        var heatingType = heatingTypeId != null ? heatingTypeRepository.findById(heatingTypeId).orElse(null) : null;
        var ownerType = listingOwnerTypeRepository.findById(ownerTypeId).orElse(null);
        if (ownerType == null) return Result.error("Owner type not found", "OWNER_TYPE_NOT_FOUND");

        return Result.success(new RealEstateResolution(adType, realEstateType, heatingType, ownerType));
    }

    public Result<Void> apply(
            RealEstateListing listing,
            Optional<UUID> adTypeId,
            Optional<UUID> realEstateTypeId,
            Optional<UUID> heatingTypeId,
            Optional<UUID> ownerTypeId
    ) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (adTypeId != null && adTypeId.isPresent()) {
            var adType = realEstateAdTypeRepository.findById(adTypeId.get()).orElse(null);
            if (adType == null) return Result.error("Real estate ad type not found", "REAL_ESTATE_AD_TYPE_NOT_FOUND");
            listing.setAdType(adType);
        }

        if (realEstateTypeId != null && realEstateTypeId.isPresent()) {
            var realEstateType = realEstateTypeRepository.findById(realEstateTypeId.get()).orElse(null);
            if (realEstateType == null) return Result.error("Real estate type not found", "REAL_ESTATE_TYPE_NOT_FOUND");
            listing.setRealEstateType(realEstateType);
        }

        if (heatingTypeId != null && heatingTypeId.isPresent()) {
            var heatingType = heatingTypeRepository.findById(heatingTypeId.get()).orElse(null);
            if (heatingType == null) return Result.error("Heating type not found", "HEATING_TYPE_NOT_FOUND");
            listing.setHeatingType(heatingType);
        }

        if (ownerTypeId != null && ownerTypeId.isPresent()) {
            var ownerType = listingOwnerTypeRepository.findById(ownerTypeId.get()).orElse(null);
            if (ownerType == null) return Result.error("Owner type not found", "OWNER_TYPE_NOT_FOUND");
            listing.setOwnerType(ownerType);
        }

        return Result.success();
    }
}

