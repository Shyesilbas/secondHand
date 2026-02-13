package com.serhat.secondhand.cart.mapper;

import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Mapper(componentModel = "spring", uses = ListingMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "listing", source = "listing")
    @Mapping(target = "reservedAt", source = "reservedAt", qualifiedByName = "toInstant")
    @Mapping(target = "reservationEndTime", source = "reservationEndTime", qualifiedByName = "toInstant")
    CartDto toDto(Cart cart);

    @Named("toInstant")
    default Instant toInstant(LocalDateTime ldt) {
        return ldt == null ? null : ldt.atZone(ZoneId.of("Europe/Istanbul")).toInstant();
    }

    List<CartDto> toDtoList(List<Cart> carts);
}
