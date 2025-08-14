package com.serhat.secondhand.core.api;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/enums")
@RequiredArgsConstructor
@Tag(name = "Enum Values", description = "Endpoints for getting enum values from backend")
public class EnumController {

    @GetMapping("/listing-types")
    @Operation(summary = "Get all listing types", description = "Returns all available listing types with labels")
    public ResponseEntity<List<Map<String, Object>>> getListingTypes() {
        List<Map<String, Object>> listingTypes = Arrays.stream(ListingType.values())
                .map(type -> {
                    Map<String, Object> typeMap = new LinkedHashMap<>();
                    typeMap.put("value", type.name());
                    typeMap.put("label", getListingTypeLabel(type));
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
                    statusMap.put("label", getListingStatusLabel(status));
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
                    brandMap.put("label", getCarBrandLabel(brand));
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
                    fuelMap.put("label", getFuelTypeLabel(fuel));
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
                    colorMap.put("label", getColorLabel(color));
                    return colorMap;
                })
                .toList();
        return ResponseEntity.ok(colors);
    }

    @GetMapping("/doors")
    @Operation(summary = "Get all door options")
    public ResponseEntity<List<Map<String, Object>>> getDoors() {
        List<Map<String, Object>> doors = Arrays.stream(Doors.values())
                .map(door -> {
                    Map<String, Object> doorMap = new LinkedHashMap<>();
                    doorMap.put("value", door.name());
                    doorMap.put("label", getDoorsLabel(door));
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
                    currencyMap.put("label", getCurrencyLabel(currency));
                    currencyMap.put("symbol", getCurrencySymbol(currency));
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
                    gearTypeMap.put("label", getGearTypeLabel(gearType));
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
                    seatCountMap.put("label", getSeatCountLabel(seatCount));
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
                    map.put("label", getElectronicTypeLabel(type));
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
                    map.put("label", getElectronicBrandLabel(brand));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(brands);
    }

    // Label helper methods
    private String getListingTypeLabel(ListingType type) {
        return switch (type) {
            case VEHICLE -> "Vehicle";
            case ELECTRONICS -> "Electronics";
            case HOUSE -> "House";
            case CLOTHING -> "Clothing";
            case BOOKS -> "Books";
            case SPORTS -> "Sports";
            case OTHER -> "Other";
        };
    }

    private String getListingTypeIcon(ListingType type) {
        return switch (type) {
            case VEHICLE -> "🚗";
            case ELECTRONICS -> "📱";
            case HOUSE -> "🏠";
            case CLOTHING -> "👕";
            case BOOKS -> "📚";
            case SPORTS -> "⚽";
            case OTHER -> "📦";
        };
    }

    private String getListingStatusLabel(ListingStatus status) {
        return switch (status) {
            case ACTIVE -> "Active";
            case RESERVED -> "Reserved";
            case INACTIVE -> "Inactive";
            case DRAFT -> "Draft";
            case SOLD -> "Sold";
        };
    }

    private String getCarBrandLabel(CarBrand brand) {
        return switch (brand) {
            case AUDI -> "Audi";
            case BMW -> "BMW";
            case MERCEDES -> "Mercedes-Benz";
            case TOYOTA -> "Toyota";
            case VOLKSWAGEN -> "Volkswagen";
            case HYUNDAI -> "Hyundai";
            case PEUGEOT -> "Peugeot";
            case NISSAN -> "Nissan";
            case KIA -> "Kia";
            case FORD -> "Ford";
            case SUZUKI -> "Suzuki";
            case TOGG -> "TOGG";
            case RENAULT -> "Renault";
            case SKODA -> "Škoda";
            case SEAT -> "SEAT";
            case CUPRA -> "Cupra";
            case HONDA -> "Honda";
            case OPEL -> "Opel";
        };
    }

    private String getFuelTypeLabel(FuelType fuel) {
        return switch (fuel) {
            case GASOLINE -> "Gasoline";
            case DIESEL -> "Diesel";
            case HYBRID -> "Hybrid";
            case ELECTRIC -> "Electric";
            case LPG -> "LPG";
        };
    }

    private String getColorLabel(Color color) {
        return switch (color) {
            case WHITE -> "White";
            case BLACK -> "Black";
            case SILVER -> "Silver";
            case GRAY -> "Gray";
            case NARDO_GRAY -> "Nardo Gray";
            case GUNMETAL -> "Metal Gray";
            case RED -> "Red";
            case ROSSO_CORSA -> "Rosso Corsa";
            case DEEP_BLACK -> "Deep Black";
            case PEARL_WHITE -> "Pearl White";
            case METALLIC_GRAY -> "Metallic Gray";
            case CANDY_RED -> "Candy Red";
            case FOREST_GREEN -> "Forest Green";
            case SUNSET_ORANGE -> "Sunset Orange";
            case ROYAL_PURPLE -> "Royal Purple";
            case CHAMPAGNE_GOLD -> "Champagne Gold";
            case BLUE -> "Blue";
            case MIDNIGHT_BLUE -> "Midnight Blue";
            case ATLANTIC_BLUE -> "Atlantic Blue";
            case BRITISH_RACING_GREEN -> "British Racing Green";
            case GREEN -> "Green";
            case YELLOW -> "Yellow";
            case SUNBURST_YELLOW -> "Sunset Yellow";
            case ORANGE -> "Orange";
            case LAVA_ORANGE -> "Lava Orange";
            case BROWN -> "Brown";
            case BEIGE -> "Beige";
            case PURPLE_AMETHYST -> "Purple Amethyst";
            case MATTE_BLACK -> "Matte Black";
        };
    }

    private String getDoorsLabel(Doors door) {
        return switch (door) {
            case TWO -> "2 Doors";
            case FOUR -> "4 Doors";
        };
    }

    private String getCurrencyLabel(Currency currency) {
        return switch (currency) {
            case TRY -> "Turkish Lira";
            case EUR -> "Euro";
            case USD -> "United States Dollar";
        };
    }

    private String getCurrencySymbol(Currency currency) {
        return switch (currency) {
            case TRY -> "₺";
            case EUR -> "€";
            case USD -> "$";
        };
    }

    private String getGearTypeLabel(GearType gearType) {
        return switch (gearType) {
            case MANUAL -> "Manuel";
            case AUTOMATIC -> "Otomatik";
            case SEMI_AUTOMATIC -> "Yarı Otomatik";
            case CVT -> "CVT";
        };
    }

    private String getSeatCountLabel(SeatCount seatCount) {
        return switch (seatCount) {
            case TWO -> "2";
            case FOUR -> "4";
            case FIVE -> "5";
            case SEVEN -> "7";
            case EIGHT -> "8";
            case NINE -> "9";
            case TEN -> "10";
            case MORE_THAN_TEN -> "10+";
        };
    }

    private String getElectronicTypeLabel(ElectronicType type) {
        return switch (type) {
            case MOBILE_PHONE -> "Mobile Phone";
            case LAPTOP -> "Laptop";
            case TV -> "TV";
            case AIR_CONDITIONER -> "Air Conditioner";
            case WASHING_MACHINE -> "Washing Machine";
            case KITCHENARY -> "Kitchen Appliances";
            case GAMES_CONSOLE -> "Game Console";
            case HEADPHONES -> "Headphones";
            case MICROPHONE -> "Microphone";
            case SPEAKER -> "Speaker";
            case TV_STB -> "TV Set-Top Box";
            case VIDEO_PLAYER -> "Video Player";
        };
    }

    private String getElectronicBrandLabel(ElectronicBrand brand) {
        return switch (brand) {
            case APPLE -> "Apple";
            case SAMSUNG -> "Samsung";
            case MICROSOFT -> "Microsoft";
            case GOOGLE -> "Google";
            case SONY -> "Sony";
            case LG -> "LG";
            case ASUS -> "ASUS";
            case XIAOMI -> "Xiaomi";
            case HUAWEI -> "Huawei";
            case FUJITSU -> "Fujitsu";
            case OKI -> "OKI";
            case BENQ -> "BenQ";
            case KODAK -> "Kodak";
            case NIKON -> "Nikon";
            case PHILLIPS -> "Phillips";
        };
    }
}