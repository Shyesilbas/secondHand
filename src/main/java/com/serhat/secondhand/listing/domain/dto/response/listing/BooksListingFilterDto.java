package com.serhat.secondhand.listing.domain.dto.response.listing;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class BooksListingFilterDto extends ListingFilterDto {
    private List<UUID> bookTypeIds;
    private List<UUID> genreIds;
    private List<UUID> languageIds;
    private List<UUID> formatIds;
    private List<UUID> conditionIds;
    private Integer minYear;
    private Integer maxYear;
    private Integer minPageCount;
    private Integer maxPageCount;
}


