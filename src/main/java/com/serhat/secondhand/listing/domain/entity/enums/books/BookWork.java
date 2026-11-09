package com.serhat.secondhand.listing.domain.entity.enums.books;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Persistable;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/** A book independent of its editions (e.g. "Masumiyet Müzesi"): authors in order, type, genre, original language. */
@Entity
@Table(name = "book_works")
@Getter
@Setter
@NoArgsConstructor
public class BookWork implements Persistable<UUID> {

    @Id
    private UUID id;

    @Transient
    private boolean isNew = true;

    /** Seed key. */
    @Column(nullable = false, unique = true, length = 160)
    private String name;

    @Column(nullable = false, length = 300)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_type_id")
    private BookType bookType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_genre_id")
    private BookGenre genre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_language_id")
    private BookLanguage originalLanguage;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "book_work_authors",
            joinColumns = @JoinColumn(name = "work_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id"))
    @OrderColumn(name = "sort_order")
    private List<BookAuthor> authors = new ArrayList<>();

    /** {@code claude-draft} or {@code verified}. */
    @Column(nullable = false, length = 20)
    private String source;

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }

    /** "Orhan Pamuk" or "Terry Pratchett, Neil Gaiman". */
    public String authorNames() {
        return String.join(", ", authors.stream().map(BookAuthor::getLabel).toList());
    }
}
