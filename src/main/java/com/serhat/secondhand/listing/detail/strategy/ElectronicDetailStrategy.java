package com.serhat.secondhand.listing.detail.strategy;

import com.serhat.secondhand.listing.detail.ListingDetailStrategy;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ElectronicDetailStrategy implements ListingDetailStrategy {

    private final ElectronicListingRepository electronicListingRepository;

    @Override
    public String getDetailSummary(UUID listingId) {
        ElectronicListing electronic = electronicListingRepository.findById(listingId).orElse(null);
        if (electronic == null) {
            return "";
        }

        String brand = electronic.getElectronicBrand() != null
                ? nonBlankOrNull(electronic.getElectronicBrand().getLabel(), electronic.getElectronicBrand().getName())
                : null;
        String model = electronic.getModel() != null ? electronic.getModel().getName() : null;
        String type = electronic.getElectronicType() != null
                ? nonBlankOrNull(electronic.getElectronicType().getLabel(), electronic.getElectronicType().getName())
                : null;
        String ram = electronic.getRam() != null ? electronic.getRam().toString() : null;
        String storage = electronic.getStorage() != null ? electronic.getStorage().toString() : null;
        String processor = electronic.getProcessor() != null ? electronic.getProcessor().getLabel() : null;
        String color = electronic.getColor() != null ? electronic.getColor().getLabel() : null;

        StringBuilder sb = new StringBuilder("Bu ürün bir ");
        if (brand != null && !brand.isBlank()) {
            sb.append(brand).append(" ");
        }
        if (model != null && !model.isBlank()) {
            sb.append(model);
        } else {
            sb.append("ürün");
        }
        sb.append(". Özellikler: ");
        sb.append(valueOrUnknown(type));
        sb.append(", ").append(valueOrUnknown(ram)).append("GB RAM");
        sb.append(", ").append(valueOrUnknown(storage)).append("GB depolama");
        sb.append(", ").append(valueOrUnknown(processor)).append(" işlemci");
        sb.append(" ve ").append(valueOrUnknown(color)).append(" renk.");

        return sb.toString();
    }

    @Override
    public boolean supports(ListingType type) {
        return type == ListingType.ELECTRONICS;
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

    private String valueOrUnknown(String value) {
        if (value == null || value.isBlank()) {
            return "bilinmiyor";
        }
        return value;
    }
}

