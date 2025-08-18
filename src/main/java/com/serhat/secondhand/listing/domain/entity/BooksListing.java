package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "books_listings")
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
public class BooksListing extends Listing {

    private String author;

    @Enumerated(EnumType.STRING)
    private BookGenre genre;

    @Enumerated(EnumType.STRING)
    private BookLanguage language;

    private Integer publicationYear;

    private Integer pageCount;

    @Enumerated(EnumType.STRING)
    private BookFormat format;

    @Enumerated(EnumType.STRING)
    private BookCondition condition;

    @Column(length = 20)
    private String isbn;
}


