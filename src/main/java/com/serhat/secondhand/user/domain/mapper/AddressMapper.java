package com.serhat.secondhand.user.domain.mapper;

import com.serhat.secondhand.user.domain.dto.AddressDto;
import com.serhat.secondhand.user.domain.entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressMapper INSTANCE = Mappers.getMapper(AddressMapper.class);

    AddressDto toDto(Address address);
    Address toEntity(AddressDto dto);
}
