package com.serhat.secondhand.listing.domain.mapper;

import com.serhat.secondhand.listing.domain.dto.ListingDto;
import com.serhat.secondhand.listing.domain.dto.ListingResponseDto;
import com.serhat.secondhand.listing.domain.dto.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ListingMapper {
    
    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    VehicleListingDto toVehicleDto(VehicleListing vehicleListing);
    
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VehicleListing toVehicleEntity(VehicleListingDto dto);
    
    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "type", expression = "java(getListingType(listing))")
    ListingResponseDto toListingResponseDto(Listing listing);
    
    default String getListingType(Listing listing) {
        if (listing instanceof VehicleListing) {
            return "VEHICLE";
        }
        // Future listing types can be added here
        return "UNKNOWN";
    }
    
    // Dynamic DTO mapping based on instance type
    default ListingDto toDynamicDto(Listing listing) {
        if (listing instanceof VehicleListing) {
            return toVehicleDto((VehicleListing) listing);
        }
        // Future listing types can be added here
        // else if (listing instanceof ElectronicsListing) {
        //     return toElectronicsDto((ElectronicsListing) listing);
        // }
        
        // Fallback to basic response DTO
        throw new IllegalArgumentException("Unknown listing type: " + listing.getClass().getSimpleName());
    }
} 