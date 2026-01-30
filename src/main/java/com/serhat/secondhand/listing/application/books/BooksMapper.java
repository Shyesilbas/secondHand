package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.listing.domain.dto.request.books.BooksUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import org.springframework.stereotype.Component;

@Component
public class BooksMapper {
    public void updateEntityFromRequest(BooksListing entity, BooksUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }

        if (request.base() != null) {
            if (request.base().title() != null) request.base().title().ifPresent(entity::setTitle);
            if (request.base().description() != null) request.base().description().ifPresent(entity::setDescription);
            if (request.base().price() != null) request.base().price().ifPresent(entity::setPrice);
            if (request.base().currency() != null) request.base().currency().ifPresent(entity::setCurrency);
            if (request.base().city() != null) request.base().city().ifPresent(entity::setCity);
            if (request.base().district() != null) request.base().district().ifPresent(entity::setDistrict);
            if (request.base().imageUrl() != null) request.base().imageUrl().ifPresent(entity::setImageUrl);
        }

        if (request.author() != null) request.author().ifPresent(entity::setAuthor);
        if (request.publicationYear() != null) request.publicationYear().ifPresent(entity::setPublicationYear);
        if (request.pageCount() != null) request.pageCount().ifPresent(entity::setPageCount);
        if (request.isbn() != null) request.isbn().ifPresent(entity::setIsbn);

        
    }
}

