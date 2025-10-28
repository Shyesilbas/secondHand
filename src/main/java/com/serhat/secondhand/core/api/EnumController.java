package com.serhat.secondhand.core.api;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.*;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import com.serhat.secondhand.order.entity.enums.ShippingStatus;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.service.ListingFeeService;
import com.serhat.secondhand.showcase.ShowcaseService;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
import com.serhat.secondhand.agreements.entity.enums.AgreementGroup;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/v1/enums")
@RequiredArgsConstructor
@Tag(name = "Enum Values", description = "Endpoints for getting enum values from backend")
public class EnumController {

    private final ListingFeeService paymentService;
    private final ShowcaseService showcaseService;

    @GetMapping("/listing-types")
    @Operation(summary = "Get all listing types", description = "Returns all available listing types with labels")
    public ResponseEntity<List<Map<String, Object>>> getListingTypes() {
        List<Map<String, Object>> listingTypes = Arrays.stream(ListingType.values())
                .map(type -> {
                    Map<String, Object> typeMap = new LinkedHashMap<>();
                    typeMap.put("value", type.name());
                    typeMap.put("label", type.getLabel());
                    typeMap.put("icon", getListingTypeIcon(type));
                    return typeMap;
                })
                .toList();
        return ResponseEntity.ok(listingTypes);
    }

    @GetMapping("/listing-statuses")
    @Operation(summary = "Get all listing statuses")
    public ResponseEntity<List<Map<String, Object>>> getListingStatuses() {
        List<Map<String, Object>> statuses = Arrays.stream(ListingStatus.values())
                .map(status -> {
                    Map<String, Object> statusMap = new LinkedHashMap<>();
                    statusMap.put("value", status.name());
                    statusMap.put("label", status.getLabel());
                    return statusMap;
                })
                .toList();
        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/car-brands")
    @Operation(summary = "Get all car brands")
    public ResponseEntity<List<Map<String, Object>>> getCarBrands() {
        List<Map<String, Object>> brands = Arrays.stream(CarBrand.values())
                .map(brand -> {
                    Map<String, Object> brandMap = new LinkedHashMap<>();
                    brandMap.put("value", brand.name());
                    brandMap.put("label", brand.getLabel());
                    return brandMap;
                })
                .toList();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/fuel-types")
    @Operation(summary = "Get all fuel types")
    public ResponseEntity<List<Map<String, Object>>> getFuelTypes() {
        List<Map<String, Object>> fuelTypes = Arrays.stream(FuelType.values())
                .map(fuel -> {
                    Map<String, Object> fuelMap = new LinkedHashMap<>();
                    fuelMap.put("value", fuel.name());
                    fuelMap.put("label", fuel.getLabel());
                    return fuelMap;
                })
                .toList();
        return ResponseEntity.ok(fuelTypes);
    }

    @GetMapping("/colors")
    @Operation(summary = "Get all colors")
    public ResponseEntity<List<Map<String, Object>>> getColors() {
        List<Map<String, Object>> colors = Arrays.stream(Color.values())
                .map(color -> {
                    Map<String, Object> colorMap = new LinkedHashMap<>();
                    colorMap.put("value", color.name());
                    colorMap.put("label", color.getLabel());
                    return colorMap;
                })
                .toList();
        return ResponseEntity.ok(colors);
    }

    @GetMapping("/processors")
    @Operation(summary = "Get all processors")
    public ResponseEntity<List<Map<String, Object>>> getProcessors() {
        List<Map<String, Object>> processors = Arrays.stream(Processor.values())
                .map(proc -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", proc.name());
                    map.put("label", proc.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(processors);
    }

    @GetMapping("/genders")
    @Operation(summary = "Get all genders")
    public ResponseEntity<List<Map<String, Object>>> getGenders() {
        List<Map<String, Object>> genders = Arrays.stream(Gender.values())
                .map(gender -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", gender.name());
                    map.put("label", getGenderLabel(gender));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(genders);
    }

    @GetMapping("/doors")
    @Operation(summary = "Get all door options")
    public ResponseEntity<List<Map<String, Object>>> getDoors() {
        List<Map<String, Object>> doors = Arrays.stream(Doors.values())
                .map(door -> {
                    Map<String, Object> doorMap = new LinkedHashMap<>();
                    doorMap.put("value", door.name());
                    doorMap.put("label", door.getLabel());
                    return doorMap;
                })
                .toList();
        return ResponseEntity.ok(doors);
    }

    @GetMapping("/currencies")
    @Operation(summary = "Get all currencies")
    public ResponseEntity<List<Map<String, Object>>> getCurrencies() {
        List<Map<String, Object>> currencies = Arrays.stream(Currency.values())
                .map(currency -> {
                    Map<String, Object> currencyMap = new LinkedHashMap<>();
                    currencyMap.put("value", currency.name());
                    currencyMap.put("label", currency.getLabel());
                    currencyMap.put("symbol", currency.getSymbol());
                    return currencyMap;
                })
                .toList();
        return ResponseEntity.ok(currencies);
    }

    @GetMapping("/gear-types")
    @Operation(summary = "Get all gear types")
    public ResponseEntity<List<Map<String, Object>>> getGearTypes() {
        List<Map<String, Object>> gearTypes = Arrays.stream(GearType.values())
                .map(gearType -> {
                    Map<String, Object> gearTypeMap = new LinkedHashMap<>();
                    gearTypeMap.put("value", gearType.name());
                    gearTypeMap.put("label", gearType.getLabel());
                    return gearTypeMap;
                })
                .toList();
        return ResponseEntity.ok(gearTypes);
    }

    @GetMapping("/seat-counts")
    @Operation(summary = "Get all seat count options")
    public ResponseEntity<List<Map<String, Object>>> getSeatCounts() {
        List<Map<String, Object>> seatCounts = Arrays.stream(SeatCount.values())
                .map(seatCount -> {
                    Map<String, Object> seatCountMap = new LinkedHashMap<>();
                    seatCountMap.put("value", seatCount.name());
                    seatCountMap.put("label", seatCount.getLabel());
                    return seatCountMap;
                })
                .toList();
        return ResponseEntity.ok(seatCounts);
    }

    @GetMapping("/electronic-types")
    @Operation(summary = "Get all electronic types")
    public ResponseEntity<List<Map<String, Object>>> getElectronicTypes() {
        List<Map<String, Object>> types = Arrays.stream(ElectronicType.values())
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", type.name());
                    map.put("label", type.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/electronic-brands")
    @Operation(summary = "Get all electronic brands")
    public ResponseEntity<List<Map<String, Object>>> getElectronicBrands() {
        List<Map<String, Object>> brands = Arrays.stream(ElectronicBrand.values())
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", brand.name());
                    map.put("label", brand.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/real-estate-types")
    @Operation(summary = "Get all real estate types")
    public ResponseEntity<List<Map<String, Object>>> getRealEstateTypes() {
        List<Map<String, Object>> types = Arrays.stream(RealEstateType.values())
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", type.name());
                    map.put("label", type.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/real-estate-ad-types")
    @Operation(summary = "Get all real estate ad types")
    public ResponseEntity<List<Map<String, Object>>> getRealEstateAdTypes() {
        List<Map<String, Object>> adTypes = Arrays.stream(RealEstateAdType.values())
                .map(adType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", adType.name());
                    map.put("label", adType.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(adTypes);
    }

    @GetMapping("/heating-types")
    @Operation(summary = "Get all heating types")
    public ResponseEntity<List<Map<String, Object>>> getHeatingTypes() {
        List<Map<String, Object>> heatingTypes = Arrays.stream(HeatingType.values())
                .map(heatingType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", heatingType.name());
                    map.put("label", heatingType.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(heatingTypes);
    }

    @GetMapping("/owner-types")
    @Operation(summary = "Get all owner types")
    public ResponseEntity<List<Map<String, Object>>> getOwnerTypes() {
        List<Map<String, Object>> ownerTypes = Arrays.stream(ListingOwnerType.values())
                .map(ownerType -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", ownerType.name());
                    map.put("label", ownerType.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(ownerTypes);
    }

    @GetMapping("/payment-types")
    @Operation(summary = "Get all payment types")
    public ResponseEntity<List<Map<String, Object>>> getPaymentTypes() {
        List<Map<String, Object>> types = Arrays.stream(PaymentType.values())
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", type.name());
                    map.put("label", type.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/shipping-statuses")
    @Operation(summary = "Get all shipping statuses")
    public ResponseEntity<List<Map<String, Object>>> getShippingStatuses() {
        List<Map<String, Object>> list = Arrays.stream(ShippingStatus.values())
                .map(status -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", status.name());
                    map.put("label", status.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/email-types")
    @Operation(summary = "Get all email types")
    public ResponseEntity<List<Map<String, Object>>> getEmailTypes() {
        List<Map<String, Object>> list = Arrays.stream(EmailType.values())
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", type.name());
                    map.put("label", getEmailTypeLabel(type));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/clothing-brands")
    @Operation(summary = "Get all clothing brands")
    public ResponseEntity<List<Map<String, Object>>> getClothingBrands() {
        List<Map<String, Object>> brands = Arrays.stream(ClothingBrand.values())
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", brand.name());
                    map.put("label", brand.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/clothing-types")
    @Operation(summary = "Get all clothing types")
    public ResponseEntity<List<Map<String, Object>>> getClothingTypes() {
        List<Map<String, Object>> types = Arrays.stream(ClothingType.values())
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", type.name());
                    map.put("label", type.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/clothing-conditions")
    @Operation(summary = "Get all clothing conditions")
    public ResponseEntity<List<Map<String, Object>>> getClothingConditions() {
        List<Map<String, Object>> conditions = Arrays.stream(ClothingCondition.values())
                .map(condition -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", condition.name());
                    map.put("label", condition.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(conditions);
    }

    @GetMapping("/clothing-genders")
    @Operation(summary = "Get all clothing genders")
    public ResponseEntity<List<Map<String, Object>>> getClothingGenders() {
        List<Map<String, Object>> genders = Arrays.stream(ClothingGender.values())
                .map(gender -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", gender.name());
                    map.put("label", gender.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(genders);
    }

    @GetMapping("/clothing-categories")
    @Operation(summary = "Get all clothing categories")
    public ResponseEntity<List<Map<String, Object>>> getClothingCategories() {
        List<Map<String, Object>> categories = Arrays.stream(ClothingCategory.values())
                .map(category -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", category.name());
                    map.put("label", category.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/book-genres")
    @Operation(summary = "Get all book genres")
    public ResponseEntity<List<Map<String, Object>>> getBookGenres() {
        List<Map<String, Object>> genres = Arrays.stream(BookGenre.values())
                .map(genre -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", genre.name());
                    map.put("label", getBookGenreLabel(genre));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(genres);
    }

    @GetMapping("/book-languages")
    @Operation(summary = "Get all book languages")
    public ResponseEntity<List<Map<String, Object>>> getBookLanguages() {
        List<Map<String, Object>> langs = Arrays.stream(BookLanguage.values())
                .map(lang -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", lang.name());
                    map.put("label", getBookLanguageLabel(lang));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(langs);
    }

    @GetMapping("/book-formats")
    @Operation(summary = "Get all book formats")
    public ResponseEntity<List<Map<String, Object>>> getBookFormats() {
        List<Map<String, Object>> formats = Arrays.stream(BookFormat.values())
                .map(fmt -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", fmt.name());
                    map.put("label", getBookFormatLabel(fmt));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(formats);
    }

    @GetMapping("/book-conditions")
    @Operation(summary = "Get all book conditions")
    public ResponseEntity<List<Map<String, Object>>> getBookConditions() {
        List<Map<String, Object>> conditions = Arrays.stream(BookCondition.values())
                .map(cond -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", cond.name());
                    map.put("label", getBookConditionLabel(cond));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(conditions);
    }

    @GetMapping("/sport-disciplines")
    @Operation(summary = "Get all sport disciplines")
    public ResponseEntity<List<Map<String, Object>>> getSportDisciplines() {
        List<Map<String, Object>> list = Arrays.stream(SportDiscipline.values())
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", v.name());
                    map.put("label", getSportDisciplineLabel(v));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/sport-equipment-types")
    @Operation(summary = "Get all sport equipment types")
    public ResponseEntity<List<Map<String, Object>>> getSportEquipmentTypes() {
        List<Map<String, Object>> list = Arrays.stream(SportEquipmentType.values())
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", v.name());
                    map.put("label", getSportEquipmentTypeLabel(v));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/sport-conditions")
    @Operation(summary = "Get all sport conditions")
    public ResponseEntity<List<Map<String, Object>>> getSportConditions() {
        List<Map<String, Object>> list = Arrays.stream(SportCondition.values())
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", v.name());
                    map.put("label", getSportConditionLabel(v));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    

    private String getListingTypeIcon(ListingType type) {
        return switch (type) {
            case VEHICLE -> "🚗";
            case ELECTRONICS -> "📱";
            case REAL_ESTATE -> "🏠";
            case CLOTHING -> "👕";
            case BOOKS -> "📚";
            case SPORTS -> "⚽";
            case OTHER -> "📦";
        };
    }

    private String getEmailTypeLabel(EmailType type) {
        return toTitleCase(type.name());
    }

    private String getBookGenreLabel(BookGenre genre) {
        return toTitleCase(genre.name());
    }

    private String getBookLanguageLabel(BookLanguage language) {
        return toTitleCase(language.name());
    }

    private String getBookFormatLabel(BookFormat format) {
        return toTitleCase(format.name());
    }

    private String getBookConditionLabel(BookCondition condition) {
        return toTitleCase(condition.name());
    }

        private String toTitleCase(String enumName) {
        String lower = enumName.replace('_', ' ').toLowerCase(Locale.ROOT);
        String[] parts = lower.split(" ");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].isEmpty()) continue;
            sb.append(Character.toUpperCase(parts[i].charAt(0)));
            if (parts[i].length() > 1) sb.append(parts[i].substring(1));
            if (i < parts.length - 1) sb.append(' ');
        }
        return sb.toString();
    }

    private String getSportDisciplineLabel(SportDiscipline discipline) { return discipline.getLabel(); }

    private String getSportEquipmentTypeLabel(SportEquipmentType equipmentType) { return equipmentType.getLabel(); }

    private String getSportConditionLabel(SportCondition condition) { return condition.getLabel(); }

    private String getGenderLabel(Gender gender) { return gender.getLabel(); }

    private String getClothingGenderLabel(ClothingGender gender) { return gender.getLabel(); }

    private String getClothingCategoryLabel(ClothingCategory category) { return category.getLabel(); }

    @GetMapping("/audit-event-types")
    @Operation(summary = "Get audit event types", description = "Returns all available audit event types with display names")
    public ResponseEntity<List<Map<String, Object>>> getAuditEventTypes() {
        List<Map<String, Object>> eventTypes = Arrays.stream(AuditLog.AuditEventType.values())
                .map(eventType -> {
                    Map<String, Object> typeMap = new LinkedHashMap<>();
                    typeMap.put("value", eventType.name());
                    typeMap.put("label", eventType.getDisplayName());
                    return typeMap;
                })
                .toList();
        return ResponseEntity.ok(eventTypes);
    }

    @GetMapping("/audit-event-statuses")
    @Operation(summary = "Get audit event statuses", description = "Returns all available audit event statuses with display names")
    public ResponseEntity<List<Map<String, Object>>> getAuditEventStatuses() {
        List<Map<String, Object>> eventStatuses = Arrays.stream(AuditLog.AuditEventStatus.values())
                .map(eventStatus -> {
                    Map<String, Object> statusMap = new LinkedHashMap<>();
                    statusMap.put("value", eventStatus.name());
                    statusMap.put("label", eventStatus.getDisplayName());
                    return statusMap;
                })
                .toList();
        return ResponseEntity.ok(eventStatuses);
    }

    @GetMapping("/listing-fee-config")
    @Operation(summary = "Get listing fee configuration", description = "Returns listing fee configuration for caching")
    public ResponseEntity<Map<String, Object>> getListingFeeConfig() {
        var config = paymentService.getListingFeeConfig();
        Map<String, Object> configMap = new LinkedHashMap<>();
        configMap.put("creationFee", config.getCreationFee());
        configMap.put("taxPercentage", config.getTaxPercentage());
        configMap.put("totalCreationFee", config.getTotalCreationFee());
        
        // Add cache version based on config hash
        String configHash = String.valueOf(
            (config.getCreationFee().hashCode() + 
             config.getTaxPercentage().hashCode() + 
             config.getTotalCreationFee().hashCode()) % 10000
        );
        configMap.put("cacheVersion", configHash);
        
        return ResponseEntity.ok(configMap);
    }

    @GetMapping("/showcase-pricing-config")
    @Operation(summary = "Get showcase pricing configuration", description = "Returns showcase pricing configuration for caching")
    public ResponseEntity<Map<String, Object>> getShowcasePricingConfig() {
        var config = showcaseService.getShowcasePricingConfig();
        Map<String, Object> configMap = new LinkedHashMap<>();
        configMap.put("dailyCost", config.getDailyCost());
        configMap.put("taxPercentage", config.getTaxPercentage());
        configMap.put("totalDailyCost", config.getTotalDailyCost());
        
        // Add cache version based on config hash
        String configHash = String.valueOf(
            (config.getDailyCost().hashCode() + 
             config.getTaxPercentage().hashCode() + 
             config.getTotalDailyCost().hashCode()) % 10000
        );
        configMap.put("cacheVersion", configHash);
        
        return ResponseEntity.ok(configMap);
    }

    @GetMapping("/agreement-groups")
    @Operation(summary = "Get agreement groups", description = "Returns all available agreement groups")
    public ResponseEntity<List<Map<String, Object>>> getAgreementGroups() {
        List<Map<String, Object>> agreementGroups = Arrays.stream(AgreementGroup.values())
                .map(group -> {
                    Map<String, Object> groupMap = new LinkedHashMap<>();
                    groupMap.put("value", group.name());
                    groupMap.put("label", group.name().replace("_", " "));
                    return groupMap;
                })
                .toList();
        return ResponseEntity.ok(agreementGroups);
    }

    @GetMapping("/agreement-types")
    @Operation(summary = "Get agreement types", description = "Returns all available agreement types")
    public ResponseEntity<List<Map<String, Object>>> getAgreementTypes() {
        List<Map<String, Object>> agreementTypes = Arrays.stream(AgreementType.values())
                .map(type -> {
                    Map<String, Object> typeMap = new LinkedHashMap<>();
                    typeMap.put("value", type.name());
                    typeMap.put("label", type.name().replace("_", " "));
                    return typeMap;
                })
                .toList();
        return ResponseEntity.ok(agreementTypes);
    }
}