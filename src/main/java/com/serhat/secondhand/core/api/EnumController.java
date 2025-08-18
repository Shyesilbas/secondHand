package com.serhat.secondhand.core.api;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingCondition;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.*;
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

    @GetMapping("/real-estate-types")
    @Operation(summary = "Get all real estate types")
    public ResponseEntity<List<Map<String, Object>>> getRealEstateTypes() {
        List<Map<String, Object>> types = Arrays.stream(RealEstateType.values())
                .map(type -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", type.name());
                    map.put("label", getRealEstateTypeLabel(type));
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
                    map.put("label", getRealEstateAdTypeLabel(adType));
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
                    map.put("label", getHeatingTypeLabel(heatingType));
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
                    map.put("label", getOwnerTypeLabel(ownerType));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(ownerTypes);
    }

    @GetMapping("/clothing-brands")
    @Operation(summary = "Get all clothing brands")
    public ResponseEntity<List<Map<String, Object>>> getClothingBrands() {
        List<Map<String, Object>> brands = Arrays.stream(ClothingBrand.values())
                .map(brand -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", brand.name());
                    map.put("label", getClothingBrandLabel(brand));
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
                    map.put("label", getClothingTypeLabel(type));
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
                    map.put("label", getClothingConditionLabel(condition));
                    return map;
                })
                .toList();
        return ResponseEntity.ok(conditions);
    }

    @GetMapping("/book-genres")
    @Operation(summary = "Get all book genres")
    public ResponseEntity<List<Map<String, Object>>> getBookGenres() {
        List<Map<String, Object>> genres = Arrays.stream(BookGenre.values())
                .map(genre -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("value", genre.name());
                    map.put("label", genre.name());
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
                    map.put("label", lang.name());
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
                    map.put("label", fmt.name());
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
                    map.put("label", cond.name());
                    return map;
                })
                .toList();
        return ResponseEntity.ok(conditions);
    }

    // Label helper methods
    private String getListingTypeLabel(ListingType type) {
        return switch (type) {
            case VEHICLE -> "Vehicle";
            case ELECTRONICS -> "Electronics";
            case REAL_ESTATE -> "Real Estate";
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
            case REAL_ESTATE -> "🏠";
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
            case AUTOMATIC -> "Automatic";
            case SEMI_AUTOMATIC -> "Semi Automatic";
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

    private String getRealEstateTypeLabel(RealEstateType type) {
        return switch (type) {
            case APARTMENT -> "Apartment";
            case HOUSE -> "House";
            case VILLA -> "Villa";
            case LAND -> "Land";
            case COMMERCIAL -> "Commercial";
            case INDUSTRIAL -> "Industrial";
            case FARM -> "Farm";
            case RESIDENCE -> "Residence";
            case SUMMER_HOUSE -> "Summer House";
        };
    }

    private String getRealEstateAdTypeLabel(RealEstateAdType adType) {
        return switch (adType) {
            case FOR_SALE -> "For Sale";
            case FOR_RENT -> "For Rent";
        };
    }

    private String getHeatingTypeLabel(HeatingType heatingType) {
        return switch (heatingType) {
            case NONE -> "None";
            case STOVE -> "Stove";
            case NATURAL_GAS -> "Natural Gas";
            case CENTRAL_SYSTEM -> "Central System";
            case COMBI_BOILER -> "Combi Boiler";
            case AIR_CONDITIONER -> "Air Conditioner";
            case GEOTHERMAL -> "Geothermal";
            case FLOOR_HEATING -> "Floor Heating";
            case OTHER -> "Other";
        };
    }

    private String getOwnerTypeLabel(ListingOwnerType ownerType) {
        return switch (ownerType) {
            case OWNER -> "Owner";
            case AGENCY -> "Agency";
        };
    }

    private String getClothingBrandLabel(ClothingBrand brand) {
        return switch (brand) {
            case NIKE -> "Nike";
            case ADIDAS -> "Adidas";
            case PUMA -> "Puma";
            case UNDER_ARMOUR -> "Under Armour";
            case ZARA -> "Zara";
            case H_M -> "H&M";
            case UNIQLO -> "Uniqlo";
            case GAP -> "Gap";
            case TOMMY_HILFIGER -> "Tommy Hilfiger";
            case CALVIN_KLEIN -> "Calvin Klein";
            case LACOSTE -> "Lacoste";
            case RALPH_LAUREN -> "Ralph Lauren";
            case LEVI_S -> "Levi's";
            case DIESEL -> "Diesel";
            case ARMANI -> "Armani";
            case GUCCI -> "Gucci";
            case PRADA -> "Prada";
            case LOUIS_VUITTON -> "Louis Vuitton";
            case CHANEL -> "Chanel";
            case HERMES -> "Hermès";
            case OTHER -> "Other";
        };
    }

    private String getClothingTypeLabel(ClothingType type) {
        return switch (type) {
            case TSHIRT -> "T-Shirt";
            case SHIRT -> "Shirt";
            case PANTS -> "Pants";
            case JEANS -> "Jeans";
            case SHORTS -> "Shorts";
            case DRESS -> "Dress";
            case SKIRT -> "Skirt";
            case JACKET -> "Jacket";
            case COAT -> "Coat";
            case SWEATER -> "Sweater";
            case HOODIE -> "Hoodie";
            case SWEATSHIRT -> "Sweatshirt";
            case SUIT -> "Suit";
            case BLAZER -> "Blazer";
            case VEST -> "Vest";
            case UNDERWEAR -> "Underwear";
            case SOCKS -> "Socks";
            case HAT -> "Hat";
            case CAP -> "Cap";
            case SCARF -> "Scarf";
            case GLOVES -> "Gloves";
            case BELT -> "Belt";
            case TIE -> "Tie";
            case BAG -> "Bag";
            case SHOES -> "Shoes";
            case SNEAKERS -> "Sneakers";
            case BOOTS -> "Boots";
            case SANDALS -> "Sandals";
            case HEELS -> "Heels";
            case FLATS -> "Flats";
            case OTHER -> "Other";
        };
    }

    private String getClothingConditionLabel(ClothingCondition condition) {
        return switch (condition) {
            case EXCELLENT -> "Excellent";
            case GOOD -> "Good";
            case FAIR -> "Fair";
            case WORN -> "Worn";
            case DAMAGED -> "Damaged";
        };
    }
}