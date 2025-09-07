package com.serhat.secondhand.listing.domain.mapper;

import com.serhat.secondhand.listing.domain.dto.PriceHistoryDto;
import com.serhat.secondhand.listing.domain.entity.PriceHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PriceHistoryMapper {
    PriceHistoryMapper INSTANCE = Mappers.getMapper(PriceHistoryMapper.class);

    @Mapping(source = "listing.id", target = "listingId")
    PriceHistoryDto toDto(PriceHistory priceHistory);
    
    @Mapping(target = "listing", ignore = true)
    PriceHistory toEntity(PriceHistoryDto dto);
}
