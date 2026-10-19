package com.serhat.secondhand.listing.domain.entity.enums.books;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import java.util.UUID;

@Entity
@Table(name = "book_languages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookLanguage implements Labelable, Persistable<UUID> {

    @Id
    private UUID id;

    @Transient
    private boolean isNew = true;

    @Override
    public UUID getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(nullable = false, length = 160)
    private String label;
}
