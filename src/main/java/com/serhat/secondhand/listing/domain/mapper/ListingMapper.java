package com.serhat.secondhand.listing.domain.mapper;

import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingResponseDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import org.mapstruct.*;


@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ListingMapper {

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "type", source = "listingType")
    VehicleListingDto toVehicleDto(VehicleListing vehicleListing);


    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "type", source = "listingType")
    ElectronicListingDto toElectronicDto(ElectronicListing electronicListing);


    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "type", source = "listingType")
    RealEstateListingDto toRealEstateDto(RealEstateListing realEstateListing);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "listingType", constant = "REAL_ESTATE")
    RealEstateListing toRealEstateEntity(RealEstateCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "listingType", constant = "VEHICLE")
    VehicleListing toVehicleEntity(VehicleCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "listingType", constant = "ELECTRONICS")
    ElectronicListing toElectronicEntity(ElectronicCreateRequest request);


    default ListingDto toDynamicDto(Listing listing) {
        if (listing instanceof VehicleListing) {
            return toVehicleDto((VehicleListing) listing);
        }
        if(listing instanceof ElectronicListing) {
            return toElectronicDto((ElectronicListing) listing);
        }
        if(listing instanceof RealEstateListing) {
            return toRealEstateDto((RealEstateListing) listing);
        }

        throw new IllegalArgumentException("Unknown listing type: " + listing.getClass().getSimpleName());
    }
    
    // no-op
}
