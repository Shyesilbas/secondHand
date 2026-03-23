package com.serhat.secondhand.listing.domain.mapper;

import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
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
import com.serhat.secondhand.listing.domain.dto.request.books.BooksUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import org.hibernate.Hibernate;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public abstract class ListingMapper {

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
    public abstract VehicleListingDto toVehicleDto(VehicleListing vehicleListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "model", source = "model", qualifiedByName = "electronicModel")
    public abstract ElectronicListingDto toElectronicDto(ElectronicListing electronicListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    public abstract RealEstateListingDto toRealEstateDto(RealEstateListing realEstateListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    public abstract ClothingListingDto toClothingDto(ClothingListing clothingListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    public abstract BooksListingDto toBooksDto(BooksListing booksListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
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
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
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
    @Mapping(target = "imageUrl", source = "base.imageUrl")
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
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
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
    @Mapping(target = "purchaseDate", ignore = true)
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
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
    @Mapping(target = "title", source = "base.title")
    @Mapping(target = "description", source = "base.description")
    @Mapping(target = "price", source = "base.price")
    @Mapping(target = "currency", source = "base.currency")
    @Mapping(target = "city", source = "base.city")
    @Mapping(target = "district", source = "base.district")
    @Mapping(target = "imageUrl", source = "base.imageUrl")
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
    @Mapping(target = "imageUrl", source = "base.imageUrl")
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
        if (request.isbn() != null) request.isbn().ifPresent(entity::setIsbn);
    }

    public void updateClothing(ClothingListing entity, ClothingUpdateRequest request) {
        if (entity == null || request == null) return;
        applyBase(entity, request.base());
        if (request.color() != null) request.color().ifPresent(entity::setColor);
        if (request.purchaseYear() != null) request.purchaseYear().ifPresent(y -> entity.setPurchaseDate(java.time.LocalDate.of(y, 1, 1)));
        if (request.condition() != null) request.condition().ifPresent(entity::setCondition);
        if (request.size() != null) request.size().ifPresent(entity::setSize);
        if (request.shoeSizeEu() != null) request.shoeSizeEu().ifPresent(entity::setShoeSizeEu);
        if (request.material() != null) request.material().ifPresent(entity::setMaterial);
        if (request.clothingGender() != null) request.clothingGender().ifPresent(entity::setClothingGender);
        if (request.clothingCategory() != null) request.clothingCategory().ifPresent(entity::setClothingCategory);
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
        if (request.batteryHealthPercent() != null) request.batteryHealthPercent().ifPresent(entity::setBatteryHealthPercent);
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
    }

    public void updateRealEstate(RealEstateListing entity, RealEstateUpdateRequest request) {
        if (entity == null || request == null) return;
        applyBase(entity, request.base());
        if (request.squareMeters() != null) request.squareMeters().ifPresent(entity::setSquareMeters);
        if (request.roomCount() != null) request.roomCount().ifPresent(entity::setRoomCount);
        if (request.bathroomCount() != null) request.bathroomCount().ifPresent(entity::setBathroomCount);
        if (request.floor() != null) request.floor().ifPresent(entity::setFloor);
        if (request.buildingAge() != null) request.buildingAge().ifPresent(entity::setBuildingAge);
        if (request.furnished() != null) request.furnished().ifPresent(entity::setFurnished);
        if (request.zoningStatus() != null) request.zoningStatus().ifPresent(entity::setZoningStatus);
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
    }

    private void applyBase(Listing entity, BaseListingUpdateRequest base) {
        if (base == null) return;
        if (base.title() != null) base.title().ifPresent(entity::setTitle);
        if (base.description() != null) base.description().ifPresent(entity::setDescription);
        if (base.price() != null) base.price().ifPresent(entity::setPrice);
        if (base.currency() != null) base.currency().ifPresent(entity::setCurrency);
        if (base.city() != null) base.city().ifPresent(entity::setCity);
        if (base.district() != null) base.district().ifPresent(entity::setDistrict);
        if (base.imageUrl() != null) base.imageUrl().ifPresent(entity::setImageUrl);
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
