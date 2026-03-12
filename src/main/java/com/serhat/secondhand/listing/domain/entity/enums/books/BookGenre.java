package com.serhat.secondhand.listing.domain.entity.enums.books;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "book_genres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookGenre implements Labelable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 160)
    private String name;

    @Column(nullable = false, length = 200)
    private String label;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_type_id")
    private BookType bookType;
}
