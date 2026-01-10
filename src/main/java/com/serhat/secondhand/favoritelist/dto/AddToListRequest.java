package com.serhat.secondhand.favoritelist.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddToListRequest {

    @NotNull(message = "Listing ID is required")
    private UUID listingId;

    @Size(max = 200, message = "Note must be at most 200 characters")
    private String note;
}

