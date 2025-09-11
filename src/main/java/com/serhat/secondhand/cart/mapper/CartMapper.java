package com.serhat.secondhand.cart.mapper;

import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", uses = ListingMapper.class, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "listing", source = "listing")
    CartDto toDto(Cart cart);

    List<CartDto> toDtoList(List<Cart> carts);
}
