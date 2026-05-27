package com.serhat.secondhand.core.api;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.core.application.EnumReadService;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.listing.application.common.ListingFeePaymentService;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCategory;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGender;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingSize;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicCondition;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.shipping.entity.enums.Carrier;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.showcase.application.ShowcaseService;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
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
@PublicEndpoint
public class EnumController {

    private final ListingFeePaymentService listingFeePaymentService;
    private final ShowcaseService showcaseService;
    private final EnumReadService enumReadService;

    private ResponseEntity<List<Map<String, Object>>> getListingTypes() {
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

    private ResponseEntity<List<Map<String, Object>>> getListingStatuses() {
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

    private ResponseEntity<List<Map<String, Object>>> getCarBrands() {
        return ResponseEntity.ok(enumReadService.getCarBrands());
    }

    private ResponseEntity<List<Map<String, Object>>> getVehicleModels() {
        return ResponseEntity.ok(enumReadService.getVehicleModels());
    }

    private ResponseEntity<List<Map<String, Object>>> getVehicleTypes() {
        return ResponseEntity.ok(enumReadService.getVehicleTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getVehicleGenerations() {
        return ResponseEntity.ok(enumReadService.getVehicleGenerations());
    }

    private ResponseEntity<List<Map<String, Object>>> getVehicleEngines() {
        return ResponseEntity.ok(enumReadService.getVehicleEngines());
    }

    private ResponseEntity<List<Map<String, Object>>> getVehicleTrims() {
        return ResponseEntity.ok(enumReadService.getVehicleTrims());
    }

    private ResponseEntity<List<Map<String, Object>>> getFuelTypes() {
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

    private ResponseEntity<List<Map<String, Object>>> getColors() {
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

    private ResponseEntity<List<Map<String, Object>>> getProcessors() {
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

    private ResponseEntity<List<Map<String, Object>>> getStorageTypes() {
        List<Map<String, Object>> storageTypes = Arrays.stream(StorageType.values())
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", t.name());
                    map.put("label", t.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(storageTypes);
    }

    private ResponseEntity<List<Map<String, Object>>> getElectronicConnectionTypes() {
        List<Map<String, Object>> connectionTypes = Arrays.stream(ElectronicConnectionType.values())
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", t.name());
                    map.put("label", t.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(connectionTypes);
    }

    private ResponseEntity<List<Map<String, Object>>> getElectronicConditions() {
        List<Map<String, Object>> conditions = Arrays.stream(ElectronicCondition.values())
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", t.name());
                    map.put("label", t.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(conditions);
    }

    private ResponseEntity<List<Map<String, Object>>> getGenders() {
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

    private ResponseEntity<List<Map<String, Object>>> getDoors() {
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

    private ResponseEntity<List<Map<String, Object>>> getCurrencies() {
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

    private ResponseEntity<List<Map<String, Object>>> getGearTypes() {
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

    private ResponseEntity<List<Map<String, Object>>> getSeatCounts() {
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

    private ResponseEntity<List<Map<String, Object>>> getElectronicTypes() {
        return ResponseEntity.ok(enumReadService.getElectronicTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getElectronicBrands() {
        return ResponseEntity.ok(enumReadService.getElectronicBrands());
    }

    private ResponseEntity<List<Map<String, Object>>> getElectronicModels() {
        return ResponseEntity.ok(enumReadService.getElectronicModels());
    }

    private ResponseEntity<List<Map<String, Object>>> getRealEstateTypes() {
        return ResponseEntity.ok(enumReadService.getRealEstateTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getRealEstateAdTypes() {
        return ResponseEntity.ok(enumReadService.getRealEstateAdTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getHeatingTypes() {
        return ResponseEntity.ok(enumReadService.getHeatingTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getOwnerTypes() {
        return ResponseEntity.ok(enumReadService.getOwnerTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getPaymentTypes() {
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

    private ResponseEntity<List<Map<String, Object>>> getShippingStatuses() {
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

    private ResponseEntity<List<Map<String, Object>>> getOrderStatuses() {
        List<Map<String, Object>> list = Arrays.stream(OrderStatus.values())
                .map(status -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", status.name());
                    map.put("label", status.getDisplayName());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    private ResponseEntity<List<Map<String, Object>>> getCarriers() {
        List<Map<String, Object>> list = Arrays.stream(Carrier.values())
                .map(carrier -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", carrier.name());
                    map.put("label", carrier.getName());
                    map.put("trackingUrlBase", carrier.getTrackingUrlBase());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    private List<String> getCancellableOrderStatuses() {
        return OrderStatus.CANCELLABLE_STATUSES.stream()
                .map(Enum::name)
                .toList();
    }

    private List<String> getRefundableOrderStatuses() {
        return OrderStatus.REFUNDABLE_STATUSES.stream()
                .map(Enum::name)
                .toList();
    }

    private List<String> getModifiableOrderStatuses() {
        return OrderStatus.MODIFIABLE_STATUSES.stream()
                .map(Enum::name)
                .toList();
    }

    private ResponseEntity<List<Map<String, Object>>> getEmailTypes() {
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

    private ResponseEntity<List<Map<String, Object>>> getClothingBrands() {
        return ResponseEntity.ok(enumReadService.getClothingBrands());
    }

    private ResponseEntity<List<Map<String, Object>>> getClothingTypes() {
        return ResponseEntity.ok(enumReadService.getClothingTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getClothingConditions() {
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

    private ResponseEntity<List<Map<String, Object>>> getClothingGenders() {
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

    private ResponseEntity<List<Map<String, Object>>> getClothingCategories() {
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

    private ResponseEntity<List<Map<String, Object>>> getClothingSizes() {
        List<Map<String, Object>> sizes = Arrays.stream(ClothingSize.values())
                .map(size -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", size.name());
                    map.put("label", size.name());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(sizes);
    }

    private ResponseEntity<List<Map<String, Object>>> getBookTypes() {
        return ResponseEntity.ok(enumReadService.getBookTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getBookGenres() {
        return ResponseEntity.ok(enumReadService.getBookGenres());
    }

    private ResponseEntity<List<Map<String, Object>>> getBookLanguages() {
        return ResponseEntity.ok(enumReadService.getBookLanguages());
    }

    private ResponseEntity<List<Map<String, Object>>> getBookFormats() {
        return ResponseEntity.ok(enumReadService.getBookFormats());
    }

    private ResponseEntity<List<Map<String, Object>>> getBookConditions() {
        return ResponseEntity.ok(enumReadService.getBookConditions());
    }

    private ResponseEntity<List<Map<String, Object>>> getSportDisciplines() {
        return ResponseEntity.ok(enumReadService.getSportDisciplines());
    }

    private ResponseEntity<List<Map<String, Object>>> getSportEquipmentTypes() {
        return ResponseEntity.ok(enumReadService.getSportEquipmentTypes());
    }

    private ResponseEntity<List<Map<String, Object>>> getSportConditions() {
        return ResponseEntity.ok(enumReadService.getSportConditions());
    }

    private ResponseEntity<List<Map<String, Object>>> getDrivetrains() {
        List<Map<String, Object>> list = Arrays.stream(Drivetrain.values())
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", v.name());
                    map.put("label", v.getLabel());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(list);
    }

    private ResponseEntity<List<Map<String, Object>>> getBodyTypes() {
        List<Map<String, Object>> list = Arrays.stream(BodyType.values())
                .map(v -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", v.name());
                    map.put("label", v.getLabel());
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

    private String getGenderLabel(Gender gender) { return gender.getLabel(); }

    private ResponseEntity<List<Map<String, Object>>> getAuditEventTypes() {
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

    private ResponseEntity<List<Map<String, Object>>> getAuditEventStatuses() {
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

    private ResponseEntity<Map<String, Object>> getListingFeeConfig() {
        var config = listingFeePaymentService.getListingFeeConfig();
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

    private ResponseEntity<Map<String, Object>> getShowcasePricingConfig() {
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


    @GetMapping("/all")
    @Operation(summary = "Get all enums", description = "Returns all enum values in a single response for efficient loading")
    public ResponseEntity<Map<String, Object>> getAllEnums() {
        Map<String, Object> allEnums = new LinkedHashMap<>();
        
        allEnums.put("listingTypes", getListingTypes().getBody());
        allEnums.put("listingStatuses", getListingStatuses().getBody());
        allEnums.put("carBrands", getCarBrands().getBody());
        allEnums.put("vehicleTypes", getVehicleTypes().getBody());
        allEnums.put("vehicleModels", getVehicleModels().getBody());
        allEnums.put("vehicleGenerations", getVehicleGenerations().getBody());
        allEnums.put("vehicleEngines", getVehicleEngines().getBody());
        allEnums.put("vehicleTrims", getVehicleTrims().getBody());
        allEnums.put("fuelTypes", getFuelTypes().getBody());
        allEnums.put("colors", getColors().getBody());
        allEnums.put("doors", getDoors().getBody());
        allEnums.put("currencies", getCurrencies().getBody());
        allEnums.put("gearTypes", getGearTypes().getBody());
        allEnums.put("seatCounts", getSeatCounts().getBody());
        allEnums.put("electronicTypes", getElectronicTypes().getBody());
        allEnums.put("electronicBrands", getElectronicBrands().getBody());
        allEnums.put("electronicModels", getElectronicModels().getBody());
        allEnums.put("processors", getProcessors().getBody());
        allEnums.put("storageTypes", getStorageTypes().getBody());
        allEnums.put("electronicConnectionTypes", getElectronicConnectionTypes().getBody());
        allEnums.put("electronicConditions", getElectronicConditions().getBody());
        allEnums.put("drivetrains", getDrivetrains().getBody());
        allEnums.put("bodyTypes", getBodyTypes().getBody());
        allEnums.put("realEstateTypes", getRealEstateTypes().getBody());
        allEnums.put("realEstateAdTypes", getRealEstateAdTypes().getBody());
        allEnums.put("heatingTypes", getHeatingTypes().getBody());
        allEnums.put("ownerTypes", getOwnerTypes().getBody());
        allEnums.put("clothingBrands", getClothingBrands().getBody());
        allEnums.put("clothingTypes", getClothingTypes().getBody());
        allEnums.put("clothingConditions", getClothingConditions().getBody());
        allEnums.put("clothingGenders", getClothingGenders().getBody());
        allEnums.put("clothingCategories", getClothingCategories().getBody());
        allEnums.put("clothingSizes", getClothingSizes().getBody());
        allEnums.put("bookTypes", getBookTypes().getBody());
        allEnums.put("bookGenres", getBookGenres().getBody());
        allEnums.put("bookLanguages", getBookLanguages().getBody());
        allEnums.put("bookFormats", getBookFormats().getBody());
        allEnums.put("bookConditions", getBookConditions().getBody());
        allEnums.put("sportDisciplines", getSportDisciplines().getBody());
        allEnums.put("sportEquipmentTypes", getSportEquipmentTypes().getBody());
        allEnums.put("sportConditions", getSportConditions().getBody());
        allEnums.put("genders", getGenders().getBody());
        allEnums.put("paymentTypes", getPaymentTypes().getBody());
        allEnums.put("shippingStatuses", getShippingStatuses().getBody());
        allEnums.put("carriers", getCarriers().getBody());
        allEnums.put("orderStatuses", getOrderStatuses().getBody());
        allEnums.put("cancellableOrderStatuses", getCancellableOrderStatuses());
        allEnums.put("refundableOrderStatuses", getRefundableOrderStatuses());
        allEnums.put("modifiableOrderStatuses", getModifiableOrderStatuses());
        allEnums.put("emailTypes", getEmailTypes().getBody());
        allEnums.put("auditEventTypes", getAuditEventTypes().getBody());
        allEnums.put("auditEventStatuses", getAuditEventStatuses().getBody());
        allEnums.put("listingFeeConfig", getListingFeeConfig().getBody());
        allEnums.put("showcasePricingConfig", getShowcasePricingConfig().getBody());
        
        return ResponseEntity.ok(allEnums);
    }
}