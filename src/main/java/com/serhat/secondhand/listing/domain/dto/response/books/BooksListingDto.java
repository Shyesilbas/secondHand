package com.serhat.secondhand.listing.domain.dto.response.books;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class BooksListingDto extends ListingDto {
    private String author;
    private BookGenre genre;
    private BookLanguage language;
    private Integer publicationYear;
    private Integer pageCount;
    private BookFormat format;
    private BookCondition condition;
    private String isbn;
}


