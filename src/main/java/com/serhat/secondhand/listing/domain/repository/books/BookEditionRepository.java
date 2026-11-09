package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookEdition;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookEditionRepository extends JpaRepository<BookEdition, UUID> {

    @EntityGraph(attributePaths = {"work", "work.bookType", "work.genre", "publisher", "format", "language"})
    Optional<BookEdition> findByIsbn(String isbn);

    @EntityGraph(attributePaths = {"work", "work.bookType", "work.genre", "publisher", "format", "language"})
    @Query("SELECT e FROM BookEdition e WHERE e.id = :id")
    Optional<BookEdition> findWithCatalogById(@Param("id") UUID id);

    /** Editions whose work title or an author's name contains {@code q} (lower-cased by the caller). */
    @EntityGraph(attributePaths = {"work", "work.bookType", "work.genre", "publisher", "format", "language"})
    @Query("""
            SELECT e FROM BookEdition e JOIN e.work w
            WHERE lower(w.title) LIKE concat('%', :q, '%')
               OR EXISTS (SELECT 1 FROM BookWork w2 JOIN w2.authors a WHERE w2 = w AND lower(a.label) LIKE concat('%', :q, '%'))
            ORDER BY w.title, e.publicationYear DESC
            """)
    List<BookEdition> search(@Param("q") String q, Pageable pageable);

    List<BookEdition> findByWork_Id(UUID workId);
}
