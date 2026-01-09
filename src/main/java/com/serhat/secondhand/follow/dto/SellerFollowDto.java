package com.serhat.secondhand.follow.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerFollowDto {
    private Long id;
    private Long followerId;
    private String followerName;
    private String followerSurname;
    private Long followedId;
    private String followedName;
    private String followedSurname;
    private boolean notifyOnNewListing;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}

