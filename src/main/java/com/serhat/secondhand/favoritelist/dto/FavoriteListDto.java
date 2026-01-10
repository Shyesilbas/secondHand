package com.serhat.secondhand.favoritelist.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteListDto {

    private Long id;
    private String name;
    private String description;
    
    @JsonProperty("isPublic")
    private boolean isPublic;
    
    private String coverImageUrl;
    
    private Long ownerId;
    private String ownerName;
    private String ownerAvatar;
    
    private int itemCount;
    private int likeCount;
    
    private BigDecimal totalPrice;
    private String currency;
    
    @JsonProperty("isLikedByCurrentUser")
    private boolean isLikedByCurrentUser;
    
    @JsonProperty("isOwner")
    private boolean isOwner;
    
    private List<FavoriteListItemDto> items;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

