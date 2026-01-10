package com.serhat.secondhand.favoritelist.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteListSummaryDto {

    private Long id;
    private String name;
    private String description;
    
    @JsonProperty("isPublic")
    private boolean isPublic;
    
    private String coverImageUrl;
    
    private Long ownerId;
    private String ownerName;
    
    private int itemCount;
    private int likeCount;
    
    private BigDecimal totalPrice;
    private String currency;
    
    private String previewImageUrl;
    
    private LocalDateTime createdAt;
}

