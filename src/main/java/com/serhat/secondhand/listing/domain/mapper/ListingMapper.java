package com.serhat.secondhand.listing.domain.mapper;

import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.books.BooksListingDto;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.response.common.BookGenreDto;
import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.common.ModelDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.*;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.serhat.secondhand.inventory.application.InventoryService;
import com.serhat.secondhand.listing.application.size.SizeSystemCatalog;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
@Slf4j
public abstract class ListingMapper {

    @Autowired
    protected InventoryService inventoryService;

    @Autowired
    protected SizeSystemCatalog sizeSystemCatalog;

    // ──────────────────────────────────────────────
    //  Shared nested mapping methods
    //  MapStruct auto-discovers these for nested fields
    // ──────────────────────────────────────────────

    public abstract LookupDto toLookupDto(Labelable entity);

    public abstract ModelDto toVehicleModelDto(VehicleModel model);

    public abstract ModelDto toElectronicModelDto(ElectronicModel model);

    public abstract BookGenreDto toBookGenreDto(BookGenre genre);

    // ──────────────────────────────────────────────
    //  Entity → Listing DTO mappings
    // ──────────────────────────────────────────────

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "model", source = "model", qualifiedByName = "vehicleModel")
    @Mapping(target = "quantity", expression = "java(inventoryService.getAvailableQuantity(vehicleListing.getId()))")
    public abstract VehicleListingDto toVehicleDto(VehicleListing vehicleListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "model", source = "model", qualifiedByName = "electronicModel")
    @Mapping(target = "quantity", expression = "java(inventoryService.getAvailableQuantity(electronicListing.getId()))")
    @Mapping(target = "electronicVariantId", source = "variant.id")
    @Mapping(target = "variantName", source = "variant.name")
    public abstract ElectronicListingDto toElectronicDto(ElectronicListing electronicListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "quantity", expression = "java(inventoryService.getAvailableQuantity(realEstateListing.getId()))")
    public abstract RealEstateListingDto toRealEstateDto(RealEstateListing realEstateListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "quantity", expression = "java(inventoryService.getAvailableQuantity(clothingListing.getId()))")
    @Mapping(target = "sizeLabel", expression = "java(sizeSystemCatalog.label(clothingListing.getSizeSystem(), clothingListing.getSizeKey()))")
    public abstract ClothingListingDto toClothingDto(ClothingListing clothingListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "quantity", expression = "java(inventoryService.getAvailableQuantity(booksListing.getId()))")
    @Mapping(target = "editionId", source = "edition.id")
    @Mapping(target = "coverUrl", source = "edition.coverUrl")
    @Mapping(target = "editionSource", source = "edition.source")
    public abstract BooksListingDto toBooksDto(BooksListing booksListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "quantity", expression = "java(inventoryService.getAvailableQuantity(sportsListing.getId()))")
    public abstract SportsListingDto toSportsDto(SportsListing sportsListing);

    // ──────────────────────────────────────────────
    //  Qualified model mappers (disambiguate VehicleModel vs ElectronicModel → ModelDto)
    // ──────────────────────────────────────────────

    @Named("vehicleModel")
    public ModelDto mapVehicleModel(VehicleModel model) {
        if (model == null) return null;
        return toVehicleModelDto(model);
    }

    @Named("electronicModel")
    public ModelDto mapElectronicModel(ElectronicModel model) {
        if (model == null) return null;
        return toElectronicModelDto(model);
    }

    // ──────────────────────────────────────────────
    //  Create request → Entity mappings
    // ──────────────────────────────────────────────

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "listingNo", ignore = true)
    @Mapping(target = "listingType", constant = "REAL_ESTATE")
    @Mapping(target = "adType", ignore = true)
    @Mapping(target = "realEstateType", ignore = true)
    @Mapping(target = "heatingType", ignore = true)
    @Mapping(target = "ownerType", ignore = true)
    @Mapping(target = "buildingCondition", ignore = true)
    @Mapping(target = "roomCount", ignore = true)
    @Mapping(target = "floorNumber", ignore = true)
    @Mapping(target = "latitude", ignore = true)
    @Mapping(target = "longitude", ignore = true)
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "cityKey", source = "base.cityKey")
    @Mapping(target = "districtKey", source = "base.districtKey")
    @Mapping(target = "neighborhoodKey", source = "base.neighborhoodKey")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
    @Mapping(target = "allowMeetup", source = "base.allowMeetup")
    @Mapping(target = "canSendMessage", expression = "java(request.base().canSendMessage() == null || request.base().canSendMessage())")
    public abstract RealEstateListing toRealEstateEntity(RealEstateCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "listingNo", ignore = true)
    @Mapping(target = "listingType", constant = "VEHICLE")
    @Mapping(target = "vehicleType", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "model", ignore = true)
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "cityKey", source = "base.cityKey")
    @Mapping(target = "districtKey", source = "base.districtKey")
    @Mapping(target = "neighborhoodKey", source = "base.neighborhoodKey")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
    @Mapping(target = "allowMeetup", source = "base.allowMeetup")
    @Mapping(target = "canSendMessage", expression = "java(request.base().canSendMessage() == null || request.base().canSendMessage())")
    public abstract VehicleListing toVehicleEntity(VehicleCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "listingNo", ignore = true)
    @Mapping(target = "listingType", constant = "ELECTRONICS")
    @Mapping(target = "electronicType", ignore = true)
    @Mapping(target = "electronicBrand", ignore = true)
    @Mapping(target = "model", ignore = true)
    @Mapping(target = "variant", ignore = true)
    @Mapping(target = "colorName", expression = "java(blankToNull(request.colorName()))")
    @Mapping(target = "chipset", expression = "java(blankToNull(request.chipset()))")
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "cityKey", source = "base.cityKey")
    @Mapping(target = "districtKey", source = "base.districtKey")
    @Mapping(target = "neighborhoodKey", source = "base.neighborhoodKey")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
    @Mapping(target = "allowMeetup", source = "base.allowMeetup")
    @Mapping(target = "canSendMessage", expression = "java(request.base().canSendMessage() == null || request.base().canSendMessage())")
    public abstract ElectronicListing toElectronicEntity(ElectronicCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "listingNo", ignore = true)
    @Mapping(target = "listingType", constant = "CLOTHING")
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "clothingType", ignore = true)
    @Mapping(target = "sizeSystem", expression = "java(blankToNull(request.sizeSystem()))")
    @Mapping(target = "sizeKey", expression = "java(blankToNull(request.sizeKey()))")
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "cityKey", source = "base.cityKey")
    @Mapping(target = "districtKey", source = "base.districtKey")
    @Mapping(target = "neighborhoodKey", source = "base.neighborhoodKey")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
    @Mapping(target = "allowMeetup", source = "base.allowMeetup")
    @Mapping(target = "canSendMessage", expression = "java(request.base().canSendMessage() == null || request.base().canSendMessage())")
    public abstract ClothingListing toClothingEntity(ClothingCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "listingNo", ignore = true)
    @Mapping(target = "listingType", constant = "BOOKS")
    @Mapping(target = "bookType", ignore = true)
    @Mapping(target = "genre", ignore = true)
    @Mapping(target = "language", ignore = true)
    @Mapping(target = "format", ignore = true)
    @Mapping(target = "condition", ignore = true)
    @Mapping(target = "edition", ignore = true)
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "cityKey", source = "base.cityKey")
    @Mapping(target = "districtKey", source = "base.districtKey")
    @Mapping(target = "neighborhoodKey", source = "base.neighborhoodKey")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
    @Mapping(target = "allowMeetup", source = "base.allowMeetup")
    @Mapping(target = "canSendMessage", expression = "java(request.base().canSendMessage() == null || request.base().canSendMessage())")
    public abstract BooksListing toBooksEntity(BooksCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "listingNo", ignore = true)
    @Mapping(target = "listingType", constant = "SPORTS")
    @Mapping(target = "discipline", ignore = true)
    @Mapping(target = "equipmentType", ignore = true)
    @Mapping(target = "condition", ignore = true)
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "cityKey", source = "base.cityKey")
    @Mapping(target = "districtKey", source = "base.districtKey")
    @Mapping(target = "neighborhoodKey", source = "base.neighborhoodKey")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
    @Mapping(target = "allowMeetup", source = "base.allowMeetup")
    @Mapping(target = "canSendMessage", expression = "java(request.base().canSendMessage() == null || request.base().canSendMessage())")
    public abstract SportsListing toSportsEntity(SportsCreateRequest request);

    // ──────────────────────────────────────────────
    //  Update request → Entity (manual Optional handling)
    // ──────────────────────────────────────────────

    public void updateBooks(BooksListing entity, BooksUpdateRequest request) {
        if (entity == null || request == null) return;
        applyBase(entity, request.base());
        if (request.author() != null) request.author().ifPresent(entity::setAuthor);
        if (request.publicationYear() != null) request.publicationYear().ifPresent(entity::setPublicationYear);
        if (request.pageCount() != null) request.pageCount().ifPresent(entity::setPageCount);
        if (request.isbn() != null) entity.setIsbn(request.isbn().map(this::blankToNull).orElse(null));
        if (request.publisher() != null) entity.setPublisher(request.publisher().map(this::blankToNull).orElse(null));
        if (request.translator() != null) entity.setTranslator(request.translator().map(this::blankToNull).orElse(null));
        if (request.attributes() != null) {
            entity.getAttributes().clear();
            request.attributes().ifPresent(entity.getAttributes()::putAll);
        }
    }

    public void updateClothing(ClothingListing entity, ClothingUpdateRequest request) {
        if (entity == null || request == null) return;
        applyBase(entity, request.base());
        if (request.color() != null) request.color().ifPresent(entity::setColor);
        if (request.purchaseYear() != null) entity.setPurchaseYear(request.purchaseYear().orElse(null));
        if (request.condition() != null) request.condition().ifPresent(entity::setCondition);
        if (request.audience() != null) request.audience().ifPresent(entity::setAudience);
        if (request.sizeSystem() != null) entity.setSizeSystem(request.sizeSystem().map(this::blankToNull).orElse(null));
        if (request.sizeKey() != null) entity.setSizeKey(request.sizeKey().map(this::blankToNull).orElse(null));
        if (request.fit() != null) entity.setFit(request.fit().orElse(null));
        if (request.pattern() != null) entity.setPattern(request.pattern().orElse(null));
        if (request.fabricType() != null) entity.setFabricType(request.fabricType().orElse(null));
        if (request.attributes() != null) {
            entity.getAttributes().clear();
            request.attributes().ifPresent(entity.getAttributes()::putAll);
        }
    }

    protected String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public void updateElectronic(ElectronicListing entity, ElectronicUpdateRequest request) {
        if (entity == null || request == null) return;
        applyBase(entity, request.base());
        if (request.origin() != null) request.origin().ifPresent(entity::setOrigin);
        if (request.warrantyProof() != null) request.warrantyProof().ifPresent(entity::setWarrantyProof);
        if (request.color() != null) request.color().ifPresent(entity::setColor);
        if (request.year() != null) request.year().ifPresent(entity::setYear);
        if (request.ram() != null) request.ram().ifPresent(entity::setRam);
        if (request.storage() != null) request.storage().ifPresent(entity::setStorage);
        if (request.storageType() != null) request.storageType().ifPresent(entity::setStorageType);
        if (request.processor() != null) request.processor().ifPresent(entity::setProcessor);
        if (request.screenSize() != null) request.screenSize().ifPresent(entity::setScreenSize);
        if (request.gpuModel() != null) request.gpuModel().ifPresent(entity::setGpuModel);
        if (request.operatingSystem() != null) request.operatingSystem().ifPresent(entity::setOperatingSystem);
        if (request.batteryCapacityMah() != null) request.batteryCapacityMah().ifPresent(entity::setBatteryCapacityMah);
        if (request.cameraMegapixels() != null) request.cameraMegapixels().ifPresent(entity::setCameraMegapixels);
        if (request.supports5g() != null) request.supports5g().ifPresent(entity::setSupports5g);
        if (request.dualSim() != null) request.dualSim().ifPresent(entity::setDualSim);
        if (request.hasNfc() != null) request.hasNfc().ifPresent(entity::setHasNfc);
        if (request.connectionType() != null) request.connectionType().ifPresent(entity::setConnectionType);
        if (request.wireless() != null) request.wireless().ifPresent(entity::setWireless);
        if (request.noiseCancelling() != null) request.noiseCancelling().ifPresent(entity::setNoiseCancelling);
        if (request.hasMicrophone() != null) request.hasMicrophone().ifPresent(entity::setHasMicrophone);
        if (request.batteryLifeHours() != null) request.batteryLifeHours().ifPresent(entity::setBatteryLifeHours);
        if (request.condition() != null) request.condition().ifPresent(entity::setCondition);
        // Sent as "" or null when the seller switches back to a generic color / clears the chip.
        if (request.colorName() != null) entity.setColorName(request.colorName().filter(v -> !v.isBlank()).orElse(null));
        if (request.chipset() != null) entity.setChipset(request.chipset().filter(v -> !v.isBlank()).orElse(null));
        if (request.attributes() != null) {
            entity.getAttributes().clear();
            request.attributes().ifPresent(entity.getAttributes()::putAll);
        }
    }

    /** Building condition is resolved by RealEstateListingResolver (unknown names are rejected there). */
    public void updateRealEstate(RealEstateListing entity, RealEstateUpdateRequest request) {
        if (entity == null || request == null) return;
        applyBase(entity, request.base());
        // Present = set (null clears); absent = keep. Toggles only change when sent.
        set(request.grossAreaM2(), entity::setGrossAreaM2);
        set(request.netAreaM2(), entity::setNetAreaM2);
        setText(request.roomConfigKey(), entity::setRoomConfigKey);
        set(request.bathroomCount(), entity::setBathroomCount);
        setText(request.floorKey(), entity::setFloorKey);
        set(request.totalFloors(), entity::setTotalFloors);
        set(request.buildingAge(), entity::setBuildingAge);
        set(request.monthlyFee(), entity::setMonthlyFee);
        setText(request.siteName(), entity::setSiteName);
        set(request.gardenAreaM2(), entity::setGardenAreaM2);
        set(request.landShareM2(), entity::setLandShareM2);
        setText(request.zoningStatusKey(), entity::setZoningStatusKey);
        setText(request.parcelNo(), entity::setParcelNo);
        setText(request.blockNo(), entity::setBlockNo);
        setText(request.sheetNo(), entity::setSheetNo);
        set(request.floorAreaRatio(), entity::setFloorAreaRatio);
        set(request.heightLimit(), entity::setHeightLimit);
        set(request.roadFrontage(), entity::setRoadFrontage);
        setText(request.infrastructureStatusKey(), entity::setInfrastructureStatusKey);
        if (request.furnished() != null) request.furnished().ifPresent(entity::setFurnished);
        if (request.hasBalcony() != null) request.hasBalcony().ifPresent(entity::setHasBalcony);
        if (request.hasElevator() != null) request.hasElevator().ifPresent(entity::setHasElevator);
        if (request.hasParking() != null) request.hasParking().ifPresent(entity::setHasParking);
        if (request.inSite() != null) request.inSite().ifPresent(entity::setInSite);
        if (request.hasPool() != null) request.hasPool().ifPresent(entity::setHasPool);
        if (request.electricityAvailable() != null) request.electricityAvailable().ifPresent(entity::setElectricityAvailable);
        if (request.roadAccess() != null) request.roadAccess().ifPresent(entity::setRoadAccess);
        if (request.exchangeable() != null) request.exchangeable().ifPresent(entity::setExchangeable);
        if (request.attributes() != null) {
            entity.getAttributes().clear();
            request.attributes().ifPresent(entity.getAttributes()::putAll);
        }
    }

    private static <T> void set(java.util.Optional<T> value, java.util.function.Consumer<T> setter) {
        if (value != null) setter.accept(value.orElse(null));
    }

    private void setText(java.util.Optional<String> value, java.util.function.Consumer<String> setter) {
        if (value != null) setter.accept(blankToNull(value.orElse(null)));
    }

    public void updateSports(SportsListing entity, SportsUpdateRequest request) {
        if (entity == null || request == null) return;
        applyBase(entity, request.base());
    }

    public void updateVehicle(VehicleListing entity, VehicleUpdateRequest request) {
        if (entity == null || request == null) return;
        applyBase(entity, request.base());
        if (request.year() != null) request.year().ifPresent(entity::setYear);
        if (request.mileage() != null) request.mileage().ifPresent(entity::setMileage);
        if (request.engineCapacity() != null) request.engineCapacity().ifPresent(entity::setEngineCapacity);
        if (request.gearbox() != null) request.gearbox().ifPresent(entity::setGearbox);
        if (request.seatCount() != null) request.seatCount().ifPresent(entity::setSeatCount);
        if (request.doors() != null) request.doors().ifPresent(entity::setDoors);
        if (request.wheels() != null) request.wheels().ifPresent(entity::setWheels);
        if (request.color() != null) request.color().ifPresent(entity::setColor);
        if (request.fuelCapacity() != null) request.fuelCapacity().ifPresent(entity::setFuelCapacity);
        if (request.fuelConsumption() != null) request.fuelConsumption().ifPresent(entity::setFuelConsumption);
        if (request.horsePower() != null) request.horsePower().ifPresent(entity::setHorsePower);
        if (request.kilometersPerLiter() != null) request.kilometersPerLiter().ifPresent(entity::setKilometersPerLiter);
        if (request.fuelType() != null) request.fuelType().ifPresent(entity::setFuelType);
        if (request.swap() != null) request.swap().ifPresent(entity::setSwap);
        if (request.accidentHistory() != null) request.accidentHistory().ifPresent(entity::setAccidentHistory);
        if (request.accidentDetails() != null) request.accidentDetails().ifPresent(entity::setAccidentDetails);
        if (request.inspectionValidUntil() != null) request.inspectionValidUntil().ifPresent(entity::setInspectionValidUntil);
        if (request.drivetrain() != null) request.drivetrain().ifPresent(entity::setDrivetrain);
        if (request.bodyType() != null) request.bodyType().ifPresent(entity::setBodyType);
        if (request.attributes() != null) {
            entity.getAttributes().clear();
            request.attributes().ifPresent(entity.getAttributes()::putAll);
        }
    }

    private void applyBase(Listing entity, BaseListingUpdateRequest base) {
        if (base == null) return;
        if (base.title() != null) base.title().ifPresent(entity::setTitle);
        if (base.description() != null) base.description().ifPresent(entity::setDescription);
        if (base.price() != null) base.price().ifPresent(entity::setPrice);
        if (base.currency() != null) base.currency().ifPresent(entity::setCurrency);
        if (base.city() != null) base.city().ifPresent(entity::setCity);
        if (base.district() != null) base.district().ifPresent(entity::setDistrict);
        if (base.cityKey() != null) base.cityKey().ifPresent(entity::setCityKey);
        if (base.districtKey() != null) base.districtKey().ifPresent(entity::setDistrictKey);
        if (base.neighborhoodKey() != null) base.neighborhoodKey().ifPresent(entity::setNeighborhoodKey);
        if (base.imageUrl() != null) base.imageUrl().ifPresent(entity::setImageUrl);
        if (base.allowMeetup() != null) entity.setAllowMeetup(base.allowMeetup());
        if (base.canSendMessage() != null) entity.setCanSendMessage(base.canSendMessage());
    }

    // ──────────────────────────────────────────────
    //  Dynamic dispatch (polymorphic Listing → DTO)
    // ──────────────────────────────────────────────

    public ListingDto toDynamicDto(Listing listing) {
        if (listing == null) {
            return null;
        }

        Listing unproxied = (Listing) Hibernate.unproxy(listing);
        if (unproxied.getListingType() == null) {
            log.warn("Listing {} has null listingType; skipping mapping (would break cache deserialization)",
                    unproxied.getId());
            return null;
        }

        return switch (unproxied.getListingType()) {
            case VEHICLE -> toVehicleDto((VehicleListing) unproxied);
            case ELECTRONICS -> toElectronicDto((ElectronicListing) unproxied);
            case REAL_ESTATE -> toRealEstateDto((RealEstateListing) unproxied);
            case CLOTHING -> toClothingDto((ClothingListing) unproxied);
            case BOOKS -> toBooksDto((BooksListing) unproxied);
            case SPORTS -> toSportsDto((SportsListing) unproxied);
            default -> throw new IllegalArgumentException("Unknown listing type: " + unproxied.getListingType());
        };
    }
}
