package com.serhat.secondhand.core.application;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.listing.application.common.ListingFeePaymentService;
import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingAudience;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingFit;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingPattern;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.FabricType;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicCondition;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.BuildingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.BodyType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Doors;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Drivetrain;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.FuelType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.GearType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.SeatCount;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.pricing.util.DiscountEligibility;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.shipping.port.out.CargoProviderPort;
import com.serhat.secondhand.showcase.application.ShowcaseService;
import com.serhat.secondhand.user.domain.entity.enums.Gender;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Assembles the public enum/catalog dictionary for {@code GET /api/v1/enums/all}.
 * Database-backed catalog tables are served from {@link EnumReadService#getCatalogEnumBundle()} (Redis-cached).
 */
@Service
@RequiredArgsConstructor
public class EnumCatalogService {

    private final ListingFeePaymentService listingFeePaymentService;
    private final ShowcaseService showcaseService;
    private final EnumReadService enumReadService;
    private final RealEstateSpecCatalogService realEstateSpecCatalogService;
    private final List<CargoProviderPort> cargoProviders;

    public Map<String, Object> getAllEnums() {
        Map<String, Object> allEnums = new LinkedHashMap<>();

        allEnums.put("listingTypes", buildListingTypes());
        allEnums.put("listingStatuses", enumOptions(ListingStatus.values(), ListingStatus::getLabel));

        Map<String, Object> catalogBundle = enumReadService.getCatalogEnumBundle();
        putCatalogEntries(allEnums, catalogBundle,
                "carBrands", "vehicleTypes", "vehicleModels", "vehicleGenerations",
                "vehicleEngines", "vehicleTrims");

        allEnums.put("fuelTypes", enumOptions(FuelType.values(), FuelType::getLabel));
        allEnums.put("colors", enumOptions(Color.values(), Color::getLabel));
        allEnums.put("doors", enumOptions(Doors.values(), Doors::getLabel));
        allEnums.put("currencies", buildCurrencies());
        allEnums.put("gearTypes", enumOptions(GearType.values(), GearType::getLabel));
        allEnums.put("seatCounts", enumOptions(SeatCount.values(), SeatCount::getLabel));

        putCatalogEntries(allEnums, catalogBundle, "electronicTypes", "electronicBrands", "electronicModels");

        allEnums.put("processors", enumOptions(Processor.values(), Processor::getLabel));
        allEnums.put("storageTypes", enumOptions(StorageType.values(), StorageType::getLabel));
        allEnums.put("electronicConnectionTypes", enumOptions(ElectronicConnectionType.values(), ElectronicConnectionType::getLabel));
        allEnums.put("electronicConditions", enumOptions(ElectronicCondition.values(), ElectronicCondition::getLabel));
        allEnums.put("drivetrains", enumOptions(Drivetrain.values(), Drivetrain::getLabel));
        allEnums.put("bodyTypes", enumOptions(BodyType.values(), BodyType::getLabel));

        putCatalogEntries(allEnums, catalogBundle, "realEstateTypes", "realEstateAdTypes", "heatingTypes");

        allEnums.put("roomConfigs", toSpecOptions(realEstateSpecCatalogService.getRoomConfigs()));
        allEnums.put("zoningStatuses", toSpecOptions(realEstateSpecCatalogService.getZoningStatuses()));
        allEnums.put("floors", toSpecOptions(realEstateSpecCatalogService.getFloors()));
        allEnums.put("infrastructureStatuses", toSpecOptions(realEstateSpecCatalogService.getInfrastructureStatuses()));
        allEnums.put("buildingConditions", enumOptions(BuildingCondition.values(), BuildingCondition::getLabel));

        putCatalogEntries(allEnums, catalogBundle, "ownerTypes", "clothingBrands", "clothingTypes");

        allEnums.put("clothingConditions", enumOptions(ClothingCondition.values(), ClothingCondition::getLabel));
        allEnums.put("clothingAudiences", enumOptions(ClothingAudience.values(), ClothingAudience::getLabel));
        allEnums.put("clothingFits", enumOptions(ClothingFit.values(), ClothingFit::getLabel));
        allEnums.put("clothingPatterns", enumOptions(ClothingPattern.values(), ClothingPattern::getLabel));
        allEnums.put("fabricTypes", enumOptions(FabricType.values(), FabricType::getLabel));

        putCatalogEntries(allEnums, catalogBundle,
                "sizeSystems", "bookTypes", "bookGenres", "bookLanguages", "bookFormats", "bookConditions",
                "sportDisciplines", "sportEquipmentTypes", "sportConditions");

        allEnums.put("genders", enumOptions(Gender.values(), Gender::getLabel));
        allEnums.put("shippingStatuses", enumOptions(ShippingStatus.values(), ShippingStatus::getLabel));
        allEnums.put("carriers", cargoProviders.stream()
                .map(provider -> labelled(provider.providerName(), provider.providerName()))
                .collect(Collectors.toCollection(ArrayList::new)));
        allEnums.put("orderStatuses", enumOptions(OrderStatus.values(), OrderStatus::getDisplayName));
        allEnums.put("cancellableOrderStatuses", enumNames(OrderStatus.CANCELLABLE_STATUSES));
        allEnums.put("refundableOrderStatuses", enumNames(OrderStatus.REFUNDABLE_STATUSES));
        allEnums.put("modifiableOrderStatuses", enumNames(OrderStatus.MODIFIABLE_STATUSES));
        allEnums.put("emailTypes", enumOptions(EmailType.values(), t -> toTitleCase(t.name())));
        allEnums.put("auditEventTypes", enumOptions(AuditLog.AuditEventType.values(), AuditLog.AuditEventType::getDisplayName));
        allEnums.put("auditEventStatuses", enumOptions(AuditLog.AuditEventStatus.values(), AuditLog.AuditEventStatus::getDisplayName));
        allEnums.put("listingFeeConfig", buildListingFeeConfig());
        allEnums.put("showcasePricingConfig", buildShowcasePricingConfig());

        return allEnums;
    }

    private void putCatalogEntries(Map<String, Object> target, Map<String, Object> source, String... keys) {
        if (source == null) {
            return;
        }
        for (String key : keys) {
            target.put(key, source.get(key));
        }
    }

    private List<Map<String, Object>> buildListingTypes() {
        return Arrays.stream(ListingType.values())
                .map(type -> {
                    Map<String, Object> typeMap = labelled(type.name(), type.getLabel());
                    typeMap.put("discountable", DiscountEligibility.isDiscountable(type));
                    return typeMap;
                })
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private List<Map<String, Object>> buildCurrencies() {
        return Arrays.stream(Currency.values())
                .map(currency -> {
                    Map<String, Object> currencyMap = labelled(currency.name(), currency.getLabel());
                    currencyMap.put("symbol", currency.getSymbol());
                    return currencyMap;
                })
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private List<Map<String, Object>> toSpecOptions(List<RealEstateSpecCatalogService.SpecDto> specs) {
        return specs.stream()
                .map(spec -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", spec.getKey());
                    map.put("label", spec.getLabel());
                    map.put("rooms", spec.getRooms());
                    map.put("number", spec.getNumber());
                    return map;
                })
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private <E extends Enum<E>> List<Map<String, Object>> enumOptions(E[] values, Function<E, String> labelExtractor) {
        return Arrays.stream(values)
                .map(value -> labelled(value.name(), labelExtractor.apply(value)))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private <E extends Enum<E>> List<String> enumNames(Collection<E> values) {
        return values.stream()
                .map(Enum::name)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private static Map<String, Object> labelled(String value, String label) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("value", value);
        map.put("label", label);
        return map;
    }

    private Map<String, Object> buildListingFeeConfig() {
        var config = listingFeePaymentService.getListingFeeConfig();
        Map<String, Object> configMap = new LinkedHashMap<>();
        configMap.put("creationFee", config.getCreationFee());
        configMap.put("taxPercentage", config.getTaxPercentage());
        configMap.put("taxAmount", config.getTaxAmount());
        configMap.put("totalCreationFee", config.getTotalCreationFee());

        String configHash = String.valueOf(
                (config.getCreationFee().hashCode()
                        + config.getTaxPercentage().hashCode()
                        + config.getTotalCreationFee().hashCode()) % 10000
        );
        configMap.put("cacheVersion", configHash);
        return configMap;
    }

    private Map<String, Object> buildShowcasePricingConfig() {
        var config = showcaseService.getShowcasePricingConfig();
        Map<String, Object> configMap = new LinkedHashMap<>();
        configMap.put("dailyCost", config.getDailyCost());
        configMap.put("taxPercentage", config.getTaxPercentage());
        configMap.put("dailyTaxAmount", config.getDailyTaxAmount());
        configMap.put("totalDailyCost", config.getTotalDailyCost());
        configMap.put("maxDays", config.getMaxDays());

        String configHash = String.valueOf(
                (config.getDailyCost().hashCode()
                        + config.getTaxPercentage().hashCode()
                        + config.getTotalDailyCost().hashCode()) % 10000
        );
        configMap.put("cacheVersion", configHash);
        return configMap;
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
}
