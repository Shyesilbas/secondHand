package com.serhat.secondhand.listing.domain.dto.response.listing;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class BooksListingFilterDto extends ListingFilterDto {
    private List<BookGenre> genres;
    private List<BookLanguage> languages;
    private List<BookFormat> formats;
    private List<BookCondition> conditions;
    private Integer minYear;
    private Integer maxYear;
    private Integer minPageCount;
    private Integer maxPageCount;
}


