package com.serhat.secondhand.listing.domain.entity.enums.books;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Persistable;

import java.util.UUID;

/**
 * One physical edition of a work. {@code isbn} is ISBN-13 (null when no source confirmed it); {@code examYear} is
 * set for exam preparation books (e.g. 2026 for a 2026 YKS book).
 */
@Entity
@Table(name = "book_editions")
@Getter
@Setter
@NoArgsConstructor
public class BookEdition implements Persistable<UUID> {

    @Id
    private UUID id;

    @Transient
    private boolean isNew = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_id")
    private BookWork work;

    @Column(length = 13, unique = true)
    private String isbn;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "publisher_id")
    private BookPublisher publisher;

    private Integer publicationYear;

    private Integer pageCount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_format_id")
    private BookFormat format;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_language_id")
    private BookLanguage language;

    @Column(length = 200)
    private String translator;

    @Column(length = 500)
    private String coverUrl;

    private Integer examYear;

    @Column(nullable = false, length = 20)
    private String source;

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }
}
