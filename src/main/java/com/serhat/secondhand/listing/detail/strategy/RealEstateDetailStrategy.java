package com.serhat.secondhand.listing.detail.strategy;

import com.serhat.secondhand.listing.detail.ListingDetailStrategy;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RealEstateDetailStrategy implements ListingDetailStrategy {

    private final RealEstateRepository realEstateRepository;

    @Override
    public String getDetailSummary(UUID listingId) {
        RealEstateListing realEstate = realEstateRepository.findById(listingId).orElse(null);
        if (realEstate == null) {
            return "";
        }

        String type = realEstate.getRealEstateType() != null ? realEstate.getRealEstateType().getLabel().toLowerCase() : null;
        String adType = realEstate.getAdType() != null ? realEstate.getAdType().getLabel().toLowerCase() : null;
        String ownerType = realEstate.getOwnerType() != null ? realEstate.getOwnerType().getLabel().toLowerCase() : null;
        String heating = realEstate.getHeatingType() != null ? realEstate.getHeatingType().getLabel().toLowerCase() : null;

        Integer squareMeters = realEstate.getSquareMeters();
        Integer roomCount = realEstate.getRoomCount();
        Integer bathroomCount = realEstate.getBathroomCount();
        boolean furnished = realEstate.isFurnished();

        StringBuilder sb = new StringBuilder("Bu gayrimenkul");
        if (squareMeters != null) {
            sb.append(" ").append(squareMeters).append(" m²");
        }
        if (roomCount != null) {
            sb.append(", ").append(roomCount).append(" odalı");
        }
        if (bathroomCount != null) {
            sb.append(", ").append(bathroomCount).append(" banyolu");
        }
        if (heating != null && !heating.isBlank()) {
            sb.append(", ").append(heating).append(" ısıtmalı");
        }
        sb.append(", ").append(furnished ? "eşyalı" : "eşyasız");
        if (type != null && !type.isBlank()) {
            sb.append(" bir ").append(type);
        } else {
            sb.append(" bir mülktür");
        }
        if (adType != null && !adType.isBlank()) {
            sb.append(" (").append(adType).append(")");
        }
        if (ownerType != null && !ownerType.isBlank()) {
            sb.append(", ilan sahibi: ").append(ownerType);
        }
        sb.append(".");

        return sb.toString();
    }

    @Override
    public boolean supports(ListingType type) {
        return type == ListingType.REAL_ESTATE;
    }
}

