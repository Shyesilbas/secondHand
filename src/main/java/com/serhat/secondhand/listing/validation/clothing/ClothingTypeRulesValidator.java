package com.serhat.secondhand.listing.validation.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.size.SizeSystemCatalog;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * Applies the selected clothing type's rules (data/clothing/types.json): the type must be offered for the
 * audience, the size must come from one of the systems the type allows for that audience
 * (data/common/sizes.json), REQUIRED fit/pattern/fabric must be set and HIDDEN ones are cleared. A flawed item
 * must name at least one defect.
 */
@Component
@RequiredArgsConstructor
public class ClothingTypeRulesValidator implements ClothingSpecValidator {

    private static final int MIN_PURCHASE_YEAR = 1950;
    private static final String DEFECTS = "defects";

    private record Field(String name, String label, String errorCode,
                         Function<ClothingListing, Object> getter, Consumer<ClothingListing> clearer) {
    }

    private static final List<Field> FIELDS = List.of(
            new Field("fit", "Fit", "CLOTHING_FIT_REQUIRED", ClothingListing::getFit, l -> l.setFit(null)),
            new Field("pattern", "Pattern", "CLOTHING_PATTERN_REQUIRED", ClothingListing::getPattern, l -> l.setPattern(null)),
            new Field("fabricType", "Fabric", "CLOTHING_FABRIC_REQUIRED", ClothingListing::getFabricType, l -> l.setFabricType(null)));

    private final SizeSystemCatalog sizeCatalog;

    @Override
    public Result<Void> validate(ClothingListing listing) {
        ClothingType type = listing == null ? null : listing.getClothingType();
        if (type == null) {
            return Result.success();
        }
        if (type.getSizeRules() == null || type.getSizeRules().isEmpty()) {
            return Result.error("Clothing type " + type.getName() + " has no size rules; run the clothing seed",
                    "CLOTHING_TYPE_RULES_MISSING");
        }
        if (listing.getAudience() == null) {
            return Result.error("Audience is required", "CLOTHING_AUDIENCE_REQUIRED");
        }
        List<String> systems = type.getSizeRules().get(listing.getAudience().name());
        if (systems == null) {
            return Result.error(type.getLabel() + " is not offered for " + listing.getAudience().getLabel(),
                    "CLOTHING_TYPE_NOT_FOR_AUDIENCE");
        }
        if (isBlank(listing.getSizeSystem()) || isBlank(listing.getSizeKey())) {
            return Result.error("Size is required", "CLOTHING_SIZE_REQUIRED");
        }
        if (!systems.contains(listing.getSizeSystem())) {
            return Result.error("Size system " + listing.getSizeSystem() + " is not allowed for " + type.getLabel()
                    + " (" + listing.getAudience().getLabel() + "); allowed: " + systems, "CLOTHING_SIZE_SYSTEM_INVALID");
        }
        if (sizeCatalog.label(listing.getSizeSystem(), listing.getSizeKey()) == null) {
            return Result.error("Size " + listing.getSizeKey() + " is not in " + listing.getSizeSystem(),
                    "CLOTHING_SIZE_INVALID");
        }
        Map<String, SpecFieldRule> rules = type.getFieldRules();
        for (Field field : FIELDS) {
            if (rules != null && rules.get(field.name()) == SpecFieldRule.REQUIRED && field.getter().apply(listing) == null) {
                return Result.error(field.label() + " is required for " + type.getLabel() + " listings", field.errorCode());
            }
        }
        Integer year = listing.getPurchaseYear();
        if (year != null && (year < MIN_PURCHASE_YEAR || year > Year.now().getValue())) {
            return Result.error("Purchase year must be between " + MIN_PURCHASE_YEAR + " and this year",
                    "CLOTHING_PURCHASE_YEAR_INVALID");
        }
        if (listing.getCondition() == ClothingCondition.FLAWED && !hasDefects(listing)) {
            return Result.error("Name at least one defect for a flawed item", "CLOTHING_DEFECTS_REQUIRED");
        }
        return Result.success();
    }

    @Override
    public void cleanup(ClothingListing listing) {
        ClothingType type = listing == null ? null : listing.getClothingType();
        if (type == null || type.getSizeRules() == null || type.getSizeRules().isEmpty()) {
            return;
        }
        List<String> systems = listing.getAudience() == null ? null : type.getSizeRules().get(listing.getAudience().name());
        // A single allowed system is implied; one-size items need no size from the seller.
        if (systems != null && systems.size() == 1) {
            listing.setSizeSystem(systems.get(0));
            if (SizeSystemCatalog.ONE_SIZE.equals(systems.get(0))) {
                listing.setSizeKey(SizeSystemCatalog.ONE_SIZE);
            }
        }
        Map<String, SpecFieldRule> rules = type.getFieldRules();
        for (Field field : FIELDS) {
            // A field the rules do not name counts as HIDDEN, as in the form.
            SpecFieldRule rule = rules == null ? null : rules.get(field.name());
            if (rule == null || rule == SpecFieldRule.HIDDEN) {
                field.clearer().accept(listing);
            }
        }
    }

    private boolean hasDefects(ClothingListing listing) {
        Object defects = listing.getAttributes() == null ? null : listing.getAttributes().get(DEFECTS);
        return defects instanceof Collection<?> c && !c.isEmpty();
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
