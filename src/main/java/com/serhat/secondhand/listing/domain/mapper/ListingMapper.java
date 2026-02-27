package com.serhat.secondhand.listing.domain.mapper;

import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.sports.SportsCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.response.books.BooksListingDto;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.*;
import org.hibernate.Hibernate;
import org.mapstruct.*;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public abstract class ListingMapper implements BaseListingMapper {

    @BeforeMapping
    protected void initVehicleLazy(VehicleListing vl, @MappingTarget VehicleListingDto dto) {
        initializeVehicleAssociations(vl);
    }

    @BeforeMapping
    protected void initElectronicLazy(ElectronicListing el, @MappingTarget ElectronicListingDto dto) {
        initializeElectronicAssociations(el);
    }

    @BeforeMapping
    protected void initRealEstateLazy(RealEstateListing rl, @MappingTarget RealEstateListingDto dto) {
        initializeRealEstateAssociations(rl);
    }

    @BeforeMapping
    protected void initClothingLazy(ClothingListing cl, @MappingTarget ClothingListingDto dto) {
        initializeClothingAssociations(cl);
    }

    @BeforeMapping
    protected void initBooksLazy(BooksListing bl, @MappingTarget BooksListingDto dto) {
        initializeBooksAssociations(bl);
    }

    @BeforeMapping
    protected void initSportsLazy(SportsListing sl, @MappingTarget SportsListingDto dto) {
        initializeSportsAssociations(sl);
    }

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "imageUrl", source = "imageUrl")
    public abstract VehicleListingDto toVehicleDto(VehicleListing vehicleListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "imageUrl", source = "imageUrl")
    public abstract ElectronicListingDto toElectronicDto(ElectronicListing electronicListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "imageUrl", source = "imageUrl")
    public abstract RealEstateListingDto toRealEstateDto(RealEstateListing realEstateListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "imageUrl", source = "imageUrl")
    public abstract ClothingListingDto toClothingDto(ClothingListing clothingListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "imageUrl", source = "imageUrl")
    public abstract BooksListingDto toBooksDto(BooksListing booksListing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerAccountCreationDate", source = "seller.accountCreationDate")
    @Mapping(target = "type", source = "listingType")
    @Mapping(target = "imageUrl", source = "imageUrl")
    public abstract SportsListingDto toSportsDto(SportsListing sportsListing);

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

    private void initializeVehicleAssociations(VehicleListing vl) {
        if (vl.getVehicleType() != null) Hibernate.initialize(vl.getVehicleType());
        if (vl.getBrand() != null) Hibernate.initialize(vl.getBrand());
        if (vl.getModel() != null) {
            Hibernate.initialize(vl.getModel());
            // VehicleModel has nested lazy associations
            if (vl.getModel().getBrand() != null) Hibernate.initialize(vl.getModel().getBrand());
            if (vl.getModel().getType() != null) Hibernate.initialize(vl.getModel().getType());
        }
    }

    private void initializeElectronicAssociations(ElectronicListing el) {
        if (el.getElectronicType() != null) Hibernate.initialize(el.getElectronicType());
        if (el.getElectronicBrand() != null) Hibernate.initialize(el.getElectronicBrand());
        if (el.getModel() != null) {
            Hibernate.initialize(el.getModel());
            // ElectronicModel has nested lazy associations
            if (el.getModel().getBrand() != null) Hibernate.initialize(el.getModel().getBrand());
            if (el.getModel().getType() != null) Hibernate.initialize(el.getModel().getType());
        }
    }

    private void initializeRealEstateAssociations(RealEstateListing rl) {
        if (rl.getAdType() != null) Hibernate.initialize(rl.getAdType());
        if (rl.getRealEstateType() != null) Hibernate.initialize(rl.getRealEstateType());
        if (rl.getHeatingType() != null) Hibernate.initialize(rl.getHeatingType());
        if (rl.getOwnerType() != null) Hibernate.initialize(rl.getOwnerType());
    }

    private void initializeClothingAssociations(ClothingListing cl) {
        if (cl.getBrand() != null) Hibernate.initialize(cl.getBrand());
        if (cl.getClothingType() != null) Hibernate.initialize(cl.getClothingType());
    }

    private void initializeBooksAssociations(BooksListing bl) {
        if (bl.getBookType() != null) Hibernate.initialize(bl.getBookType());
        if (bl.getGenre() != null) Hibernate.initialize(bl.getGenre());
        if (bl.getLanguage() != null) Hibernate.initialize(bl.getLanguage());
        if (bl.getFormat() != null) Hibernate.initialize(bl.getFormat());
        if (bl.getCondition() != null) Hibernate.initialize(bl.getCondition());
    }

    private void initializeSportsAssociations(SportsListing sl) {
        if (sl.getDiscipline() != null) Hibernate.initialize(sl.getDiscipline());
        if (sl.getEquipmentType() != null) Hibernate.initialize(sl.getEquipmentType());
        if (sl.getCondition() != null) Hibernate.initialize(sl.getCondition());
    }
}
