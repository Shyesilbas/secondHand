package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.electronics.ElectronicSpecSnapshotter;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.*;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ElectronicRulesTest {

    private static ElectronicType type(String name, Map<String, SpecFieldRule> rules) {
        ElectronicType type = new ElectronicType();
        type.setId(UUID.randomUUID());
        type.setName(name);
        type.setLabel(name);
        Map<String, SpecFieldRule> all = new LinkedHashMap<>();
        ElectronicSpecFields.ALL.keySet().forEach(f -> all.put(f, rules.getOrDefault(f, SpecFieldRule.HIDDEN)));
        type.setFieldRules(all);
        return type;
    }

    private static ElectronicModel model(ElectronicType type) {
        ElectronicModel model = new ElectronicModel();
        model.setId(UUID.randomUUID());
        model.setType(type);
        return model;
    }

    private static ElectronicListing listing(ElectronicType type) {
        ElectronicListing listing = new ElectronicListing();
        listing.setElectronicType(type);
        listing.setModel(model(type));
        return listing;
    }

    @Nested
    class TypeRules {
        private final ElectronicTypeRulesValidator validator = new ElectronicTypeRulesValidator();

        @Test
        void requiredFieldMissing_failsWithFieldCode() {
            ElectronicListing l = listing(type("MOBILE_PHONE", Map.of("storage", SpecFieldRule.REQUIRED)));
            Result<Void> r = validator.validate(l);
            assertThat(r.getErrorCode()).isEqualTo("ELECTRONIC_STORAGE_REQUIRED");
        }

        @Test
        void hiddenFieldsAreCleared() {
            ElectronicListing l = listing(type("MOBILE_PHONE", Map.of("storage", SpecFieldRule.REQUIRED)));
            l.setStorage(128);
            l.setGpuModel("RTX 4060");
            l.setConnectionType(ElectronicConnectionType.WIRED);
            validator.cleanup(l);
            assertThat(l.getStorage()).isEqualTo(128);
            assertThat(l.getGpuModel()).isNull();
            assertThat(l.getConnectionType()).isNull();
            assertThat(validator.validate(l).isError()).isFalse();
        }

        @Test
        void phoneKeepsRam() {
            ElectronicListing l = listing(type("MOBILE_PHONE", Map.of("ram", SpecFieldRule.OPTIONAL)));
            l.setRam(8);
            validator.cleanup(l);
            assertThat(l.getRam()).isEqualTo(8);
        }

        @Test
        void nonPositiveNumber_fails() {
            ElectronicListing l = listing(type("LAPTOP", Map.of("ram", SpecFieldRule.OPTIONAL)));
            l.setRam(0);
            assertThat(validator.validate(l).getErrorCode()).isEqualTo("ELECTRONIC_SPEC_VALUE_INVALID");
        }

        @Test
        void wirelessFollowsConnectionType() {
            ElectronicListing l = listing(type("HEADPHONES", Map.of(
                    "connectionType", SpecFieldRule.REQUIRED, "wireless", SpecFieldRule.OPTIONAL)));
            l.setConnectionType(ElectronicConnectionType.BLUETOOTH);
            validator.cleanup(l);
            assertThat(l.getWireless()).isTrue();
        }

        @Test
        void warrantyProofNeedsOrigin() {
            ElectronicListing l = listing(type("TV", Map.of()));
            l.setWarrantyProof(true);
            assertThat(validator.validate(l).getErrorCode()).isEqualTo("ELECTRONIC_ORIGIN_REQUIRED");
        }

        @Test
        void typeWithoutRules_fails() {
            ElectronicType t = type("TV", Map.of());
            t.setFieldRules(new LinkedHashMap<>());
            assertThat(validator.validate(listing(t)).getErrorCode()).isEqualTo("ELECTRONIC_TYPE_RULES_MISSING");
        }
    }

    @Nested
    class CatalogSnapshot {
        private final ElectronicSpecSnapshotter snapshotter = new ElectronicSpecSnapshotter();
        private final ElectronicHierarchyValidator hierarchy = new ElectronicHierarchyValidator();

        @Test
        void modelSpecsAndVariantWinOverClientValues() {
            ElectronicListing l = listing(type("MOBILE_PHONE", Map.of()));
            l.getModel().setSpecs(new LinkedHashMap<>(Map.of("batteryCapacityMah", 3582, "chipset", "Apple A18 Pro",
                    "processor", "APPLE_SILICON", "screenInches", 6.3)));
            ElectronicModelVariant v = new ElectronicModelVariant();
            v.setModel(l.getModel());
            v.setStorage(256);
            v.setRam(8);
            l.setVariant(v);
            l.setStorage(64);
            l.setBatteryCapacityMah(1000);

            snapshotter.apply(l);

            assertThat(l.getStorage()).isEqualTo(256);
            assertThat(l.getRam()).isEqualTo(8);
            assertThat(l.getBatteryCapacityMah()).isEqualTo(3582);
            assertThat(l.getChipset()).isEqualTo("Apple A18 Pro");
            assertThat(l.getProcessor()).isEqualTo(Processor.APPLE_SILICON);
        }

        @Test
        void officialColorSetsGenericColor() {
            ElectronicListing l = listing(type("MOBILE_PHONE", Map.of()));
            l.getModel().setColors(List.of(new ElectronicModelColor("Çöl Titanyum", Color.BEIGE)));
            l.setElectronicBrand(new ElectronicBrand());
            l.setColorName("Çöl Titanyum");
            l.setColor(Color.RED);
            snapshotter.apply(l);
            assertThat(l.getColor()).isEqualTo(Color.BEIGE);
        }

        @Test
        void colorOfAnotherModel_fails() {
            ElectronicListing l = listing(type("MOBILE_PHONE", Map.of()));
            l.setElectronicBrand(new ElectronicBrand());
            l.getModel().setColors(List.of(new ElectronicModelColor("Siyah", Color.BLACK)));
            l.setColorName("Çöl Titanyum");
            assertThat(hierarchy.validate(l).getErrorCode()).isEqualTo("ELECTRONIC_COLOR_NOT_IN_MODEL");
        }

        @Test
        void variantOfAnotherModel_fails() {
            ElectronicListing l = listing(type("MOBILE_PHONE", Map.of()));
            l.setElectronicBrand(new ElectronicBrand());
            ElectronicModelVariant v = new ElectronicModelVariant();
            v.setModel(model(l.getElectronicType()));
            l.setVariant(v);
            assertThat(hierarchy.validate(l).getErrorCode()).isEqualTo("ELECTRONIC_VARIANT_MODEL_MISMATCH");
        }
    }
}
