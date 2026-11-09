package com.serhat.secondhand.listing.domain.entity.enums.books;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Persistable;

import java.util.UUID;

/** Catalog author: {@code name} is the seed key, {@code label} the display name. */
@Entity
@Table(name = "book_authors")
@Getter
@Setter
@NoArgsConstructor
public class BookAuthor implements Labelable, Persistable<UUID> {

    @Id
    private UUID id;

    @Transient
    private boolean isNew = true;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(nullable = false, length = 200)
    private String label;

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }
}
