package com.serhat.secondhand.listing.domain.dto.request.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.util.Optional;
import java.math.BigDecimal;

public record BooksUpdateRequest(
        Optional<String> title,
        Optional<String> description,
        Optional<BigDecimal> price,
        Optional<Currency> currency,
        Optional<String> city,
        Optional<String> district,
        Optional<String> author,
        Optional<BookGenre> genre,
        Optional<BookLanguage> language,
        Optional<Integer> publicationYear,
        Optional<Integer> pageCount,
        Optional<BookFormat> format,
        Optional<BookCondition> condition,
        Optional<String> isbn,
        Optional<String> imageUrl
) {}


