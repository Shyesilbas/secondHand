package com.serhat.secondhand.favoritelist.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFavoriteListRequest {

    @Size(min = 1, max = 100, message = "List name must be between 1 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    private Boolean isPublic;

    private String coverImageUrl;
}

