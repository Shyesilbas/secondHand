package com.serhat.secondhand.listing.domain.dto.response.books;

import com.serhat.secondhand.listing.domain.dto.response.common.BookGenreDto;
import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class BooksListingDto extends ListingDto {
    private String author;
    private LookupDto bookType;
    private BookGenreDto genre;
    private LookupDto language;
    private Integer publicationYear;
    private Integer pageCount;
    private LookupDto format;
    private LookupDto condition;
    private String isbn;
}
