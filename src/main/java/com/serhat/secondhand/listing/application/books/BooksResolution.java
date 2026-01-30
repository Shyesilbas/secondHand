package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;

public record BooksResolution(
        BookType bookType,
        BookGenre genre,
        BookLanguage language,
        BookFormat format,
        BookCondition condition
) {}

