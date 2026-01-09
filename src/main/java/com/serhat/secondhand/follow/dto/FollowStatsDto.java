package com.serhat.secondhand.follow.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowStatsDto {
    private Long userId;
    private long followersCount;
    private long followingCount;
    
    @JsonProperty("isFollowing")
    private boolean following;
    
    @JsonProperty("notifyOnNewListing")
    private boolean notifyOnNewListing;
}

