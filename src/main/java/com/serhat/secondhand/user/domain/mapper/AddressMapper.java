package com.serhat.secondhand.user.domain.mapper;

import com.serhat.secondhand.user.domain.dto.AddressDto;
import com.serhat.secondhand.user.domain.entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AddressMapper {

    AddressDto toDto(Address address);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Address toEntity(AddressDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "mainAddress", ignore = true)
    void updateEntityFromDto(AddressDto dto, @MappingTarget Address address);
}
