package com.serhat.secondhand.listing.detail.strategy;

import com.serhat.secondhand.listing.detail.ListingDetailStrategy;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.application.size.SizeSystemCatalog;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClothingDetailStrategy implements ListingDetailStrategy {

    private final SizeSystemCatalog sizeCatalog;

    @Override
    public String getDetailSummary(Listing listing) {
        if (!(listing instanceof ClothingListing clothing)) {
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
        ClothingAudience audience = clothing.getAudience();
        String size = SizeSystemCatalog.ONE_SIZE.equals(clothing.getSizeSystem())
                ? null : sizeCatalog.label(clothing.getSizeSystem(), clothing.getSizeKey());

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
        if (size != null) {
            sb.append(", ").append(size).append(" beden");
        }
        if (audience != null && audience != ClothingAudience.UNISEX) {
            sb.append(", ").append(audience.getLabel().toLowerCase()).append(" için");
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

