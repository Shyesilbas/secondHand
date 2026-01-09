package com.serhat.secondhand.follow.mapper;

import com.serhat.secondhand.follow.dto.SellerFollowDto;
import com.serhat.secondhand.follow.entity.SellerFollow;
import org.springframework.stereotype.Component;

@Component
public class SellerFollowMapper {

    public SellerFollowDto toDto(SellerFollow entity) {
        if (entity == null) {
            return null;
        }

        return SellerFollowDto.builder()
                .id(entity.getId())
                .followerId(entity.getFollower().getId())
                .followerName(entity.getFollower().getName())
                .followerSurname(entity.getFollower().getSurname())
                .followedId(entity.getFollowed().getId())
                .followedName(entity.getFollowed().getName())
                .followedSurname(entity.getFollowed().getSurname())
                .notifyOnNewListing(entity.isNotifyOnNewListing())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

