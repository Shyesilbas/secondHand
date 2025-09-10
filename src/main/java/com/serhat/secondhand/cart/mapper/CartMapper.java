package com.serhat.secondhand.cart.mapper;

import com.serhat.secondhand.cart.dto.CartDto;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CartMapper {

    private final ListingMapper listingMapper;

    public CartDto toDto(Cart cart) {
        if (cart == null) {
            return null;
        }

        return CartDto.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .listing(listingMapper.toDynamicDto(cart.getListing()))
                .quantity(cart.getQuantity())
                .notes(cart.getNotes())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    public List<CartDto> toDtoList(List<Cart> carts) {
        if (carts == null) {
            return null;
        }

        return carts.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
