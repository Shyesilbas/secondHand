package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookPublisher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BookPublisherRepository extends JpaRepository<BookPublisher, UUID> {
}
