package com.serhat.secondhand.listing.application.electronics;

import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelColor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Copies catalog facts onto the listing's spec columns: the model's specs, then the picked variant's columns and
 * specs on top. A fact the catalog does not know keeps the seller's value. A picked official color sets the
 * generic {@code color} it maps to. Fields the type hides are cleared afterwards by ElectronicTypeRulesValidator;
 * hierarchy (variant of the model, color of the model) is checked by ElectronicHierarchyValidator.
 */
@Component
public class ElectronicSpecSnapshotter {

    public void apply(ElectronicListing listing) {
        if (listing == null || listing.getModel() == null) {
            return;
        }
        ElectronicModel model = listing.getModel();
        copySpecs(listing, model.getSpecs());

        ElectronicModelVariant variant = listing.getVariant();
        if (variant != null) {
            if (variant.getRam() != null) listing.setRam(variant.getRam());
            if (variant.getStorage() != null) listing.setStorage(variant.getStorage());
            if (variant.getStorageType() != null) listing.setStorageType(variant.getStorageType());
            if (variant.getProcessor() != null) listing.setProcessor(variant.getProcessor());
            if (variant.getChipset() != null) listing.setChipset(variant.getChipset());
            if (variant.getGpuModel() != null) listing.setGpuModel(variant.getGpuModel());
            copySpecs(listing, variant.getSpecs());
        }

        if (listing.getColorName() != null && model.getColors() != null) {
            model.getColors().stream()
                    .filter(c -> listing.getColorName().equals(c.getName()))
                    .map(ElectronicModelColor::getColor)
                    .filter(java.util.Objects::nonNull)
                    .findFirst()
                    .ifPresent(listing::setColor);
        }
    }

    private static void copySpecs(ElectronicListing listing, Map<String, Object> specs) {
        if (specs == null) {
            return;
        }
        specs.forEach((key, raw) -> {
            ElectronicCatalogSpecs.CopiedSpec spec = ElectronicCatalogSpecs.COPIED.get(key);
            if (spec != null && raw != null) {
                // Values were checked by the seed; convert again because JSON gives back generic types.
                spec.setter().accept(listing, ElectronicCatalogSpecs.convert(key, spec.kind(), raw));
            }
        });
    }
}
