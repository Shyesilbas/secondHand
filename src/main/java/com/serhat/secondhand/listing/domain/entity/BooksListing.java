package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_type_id")
    private BookType bookType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_genre_id")
    private BookGenre genre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_language_id")
    private BookLanguage language;

    private Integer publicationYear;

    private Integer pageCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_format_id")
    private BookFormat format;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_condition_id")
    private BookCondition condition;

    @Column(length = 20)
    private String isbn;
}


