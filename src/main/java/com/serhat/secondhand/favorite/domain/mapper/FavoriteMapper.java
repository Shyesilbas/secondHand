package com.serhat.secondhand.favorite.domain.mapper;

import com.serhat.secondhand.favorite.domain.dto.FavoriteDto;
import com.serhat.secondhand.favorite.domain.entity.Favorite;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {ListingMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FavoriteMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "listing", source = "listing")
    FavoriteDto toDto(Favorite favorite);
}