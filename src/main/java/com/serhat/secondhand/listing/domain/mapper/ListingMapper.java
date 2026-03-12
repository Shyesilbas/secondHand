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
public abstract class ListingMapper implements BaseListingMapper {

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
