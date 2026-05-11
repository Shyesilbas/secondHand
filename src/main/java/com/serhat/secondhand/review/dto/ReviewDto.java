package com.serhat.secondhand.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {

    private Integer id;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerSurname;
    private Long reviewedUserId;
    private String reviewedUserName;
    private String reviewedUserSurname;
    private Long orderItemId;
    private UUID listingId;
    private String listingTitle;
    private String listingNo;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
