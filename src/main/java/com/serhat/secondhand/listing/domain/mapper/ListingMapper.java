package com.serhat.secondhand.listing.domain.mapper;

import com.serhat.secondhand.listing.domain.dto.ListingDto;
import com.serhat.secondhand.listing.domain.dto.ListingResponseDto;
import com.serhat.secondhand.listing.domain.dto.VehicleListingDto;
import com.serhat.secondhand.listing.domain.dto.request.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import org.mapstruct.*;

import java.util.Optional;

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

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "listingType", constant = "VEHICLE")
    VehicleListing toVehicleEntity(VehicleCreateRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "listingType", ignore = true)
    void updateVehicleFromRequest(VehicleUpdateRequest request, @MappingTarget VehicleListing existing);

    @Mapping(target = "sellerName", source = "seller.name")
    @Mapping(target = "sellerSurname", source = "seller.surname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "type", source = "listingType")
    ListingResponseDto toListingResponseDto(Listing listing);

    default ListingDto toDynamicDto(Listing listing) {
        if (listing instanceof VehicleListing) {
            return toVehicleDto((VehicleListing) listing);
        }

        throw new IllegalArgumentException("Unknown listing type: " + listing.getClass().getSimpleName());
    }
    
    default <T> T unwrapOptional(Optional<T> optional) {
        return optional.orElse(null);
    }
}
