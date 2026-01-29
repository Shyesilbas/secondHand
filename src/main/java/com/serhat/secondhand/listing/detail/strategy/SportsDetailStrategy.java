package com.serhat.secondhand.listing.detail.strategy;

import com.serhat.secondhand.listing.detail.ListingDetailStrategy;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.sports.SportsListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SportsDetailStrategy implements ListingDetailStrategy {

    private final SportsListingRepository sportsListingRepository;

    @Override
    public String getDetailSummary(UUID listingId) {
        SportsListing sports = sportsListingRepository.findById(listingId).orElse(null);
        if (sports == null) {
            return "";
        }

        String discipline = sports.getDiscipline() != null ? sports.getDiscipline().getLabel().toLowerCase() : null;
        String equipmentType = sports.getEquipmentType() != null ? sports.getEquipmentType().getLabel().toLowerCase() : null;
        String condition = sports.getCondition() != null ? sports.getCondition().getLabel().toLowerCase() : null;

        StringBuilder sb = new StringBuilder("Bu spor ürünü");
        if (discipline != null && !discipline.isBlank()) {
            sb.append(" ").append(discipline).append(" için");
        }
        if (equipmentType != null && !equipmentType.isBlank()) {
            sb.append(" ").append(equipmentType);
        }
        if (condition != null && !condition.isBlank()) {
            sb.append(", ").append(condition).append(" kondisyondadır");
        }
        sb.append(".");

        return sb.toString();
    }

    @Override
    public boolean supports(ListingType type) {
        return type == ListingType.SPORTS;
    }
}

