package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.books.BooksListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.books.BooksListingRepository;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BooksListingService {

    private final BooksListingRepository booksRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final BooksListingFilterService booksListingFilterService;
    private final PriceHistoryService priceHistoryService;

    @Transactional
    public UUID createBooksListing(BooksCreateRequest request, User seller) {
        BooksListing books = listingMapper.toBooksEntity(request);
        if (books.getQuantity() == null || books.getQuantity() < 1) {
            throw new BusinessException(ListingErrorCodes.INVALID_QUANTITY);
        }
        books.setSeller(seller);
        BooksListing saved = booksRepository.save(books);
        log.info("Books listing created: {}", saved.getId());
        return saved.getId();
    }

    @Transactional
    public void updateBooksListing(UUID id, BooksUpdateRequest request, User currentUser) {
        listingService.validateOwnership(id, currentUser);

        BooksListing existing = booksRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "Books listing not found",
                        HttpStatus.NOT_FOUND,
                        "LISTING_NOT_FOUND"
                ));

        listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);

        var oldPrice = existing.getPrice();

        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.quantity().ifPresent(q -> {
            if (q < 1) {
                throw new BusinessException(ListingErrorCodes.INVALID_QUANTITY);
            }
            existing.setQuantity(q);
        });
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);

        request.author().ifPresent(existing::setAuthor);
        request.genre().ifPresent(existing::setGenre);
        request.language().ifPresent(existing::setLanguage);
        request.publicationYear().ifPresent(existing::setPublicationYear);
        request.pageCount().ifPresent(existing::setPageCount);
        request.format().ifPresent(existing::setFormat);
        request.condition().ifPresent(existing::setCondition);
        request.isbn().ifPresent(existing::setIsbn);

        booksRepository.save(existing);


        if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                    existing,
                    oldPrice,
                    existing.getPrice(),
                    existing.getCurrency(),
                    "Price updated via listing edit"
            );
        }
        log.info("Books listing updated: {}", id);
    }

    public BooksListingDto getBooksDetails(UUID id) {
        BooksListing books = booksRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Books listing not found"));
        return listingMapper.toBooksDto(books);
    }

    public Page<ListingDto> filterBooks(BooksListingFilterDto filters) {
        return booksListingFilterService.filterBooks(filters);
    }
}


