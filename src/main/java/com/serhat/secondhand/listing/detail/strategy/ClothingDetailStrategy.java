package com.serhat.secondhand.listing.detail.strategy;

import com.serhat.secondhand.listing.detail.ListingDetailStrategy;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClothingDetailStrategy implements ListingDetailStrategy {

    private final ClothingListingRepository clothingListingRepository;

    @Override
    public String getDetailSummary(UUID listingId) {
        ClothingListing clothing = clothingListingRepository.findById(listingId).orElse(null);
        if (clothing == null) {
            return "";
        }

        String brand = clothing.getBrand() != null
                ? nonBlankOrNull(clothing.getBrand().getLabel(), clothing.getBrand().getName())
                : null;
        String type = clothing.getClothingType() != null
                ? nonBlankOrNull(clothing.getClothingType().getLabel(), clothing.getClothingType().getName())
                : null;
        if (type != null) {
            type = type.toLowerCase();
        }
        String color = clothing.getColor() != null ? clothing.getColor().getLabel().toLowerCase() : null;
        String condition = clothing.getCondition() != null ? clothing.getCondition().getLabel().toLowerCase() : null;
        String gender = clothing.getClothingGender() != null ? clothing.getClothingGender().getLabel().toLowerCase() : null;
        String category = clothing.getClothingCategory() != null ? clothing.getClothingCategory().getLabel().toLowerCase() : null;

        StringBuilder sb = new StringBuilder("Bu ürün");
        if (brand != null && !brand.isBlank()) {
            sb.append(" ").append(brand).append(" marka");
        }
        if (type != null && !type.isBlank()) {
            sb.append(", ").append(type);
        }
        if (color != null && !color.isBlank()) {
            sb.append(", ").append(color).append(" renkli");
        }
        if (condition != null && !condition.isBlank()) {
            sb.append(", ").append(condition).append(" durumda");
        }
        if (gender != null && !gender.isBlank()) {
            sb.append(", ").append(gender).append(" için");
        }
        if (category != null && !category.isBlank()) {
            sb.append(" ").append(category);
        }
        sb.append(" bir giyim ürünüdür.");

        return sb.toString();
    }

    @Override
    public boolean supports(ListingType type) {
        return type == ListingType.CLOTHING;
    }

    private String nonBlankOrNull(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        return null;
    }
}

