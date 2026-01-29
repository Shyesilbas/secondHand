package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.books.BooksListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.repository.books.BookConditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookFormatRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookGenreRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookLanguageRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.books.BooksListingRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BooksListingService {

    private final BooksListingRepository booksRepository;
    private final BookTypeRepository bookTypeRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookLanguageRepository bookLanguageRepository;
    private final BookFormatRepository bookFormatRepository;
    private final BookConditionRepository bookConditionRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final BooksListingFilterService booksListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;

    @Transactional
    public Result<UUID> createBooksListing(BooksCreateRequest request, Long sellerId) {
        log.info("Creating books listing for sellerId: {}", sellerId);

        // 1. Resolve Seller
        var userResult = userService.findById(sellerId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User seller = userResult.getData();

        // 2. Map and Validate
        BooksListing books = listingMapper.toBooksEntity(request);
        if (books.getQuantity() == null || books.getQuantity() < 1) {
            // Your Result structure: error(message, errorCode)
            return Result.error("Invalid quantity for books listing", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        var bookType = bookTypeRepository.findById(request.bookTypeId()).orElse(null);
        if (bookType == null) {
            return Result.error("Book type not found", "BOOK_TYPE_NOT_FOUND");
        }
        var genre = bookGenreRepository.findById(request.genreId()).orElse(null);
        if (genre == null) {
            return Result.error("Book genre not found", "BOOK_GENRE_NOT_FOUND");
        }
        var language = bookLanguageRepository.findById(request.languageId()).orElse(null);
        if (language == null) {
            return Result.error("Book language not found", "BOOK_LANGUAGE_NOT_FOUND");
        }
        var format = bookFormatRepository.findById(request.formatId()).orElse(null);
        if (format == null) {
            return Result.error("Book format not found", "BOOK_FORMAT_NOT_FOUND");
        }
        var condition = bookConditionRepository.findById(request.conditionId()).orElse(null);
        if (condition == null) {
            return Result.error("Book condition not found", "BOOK_CONDITION_NOT_FOUND");
        }

        if (genre.getBookType() != null && genre.getBookType().getId() != null && !genre.getBookType().getId().equals(bookType.getId())) {
            return Result.error("Book genre does not belong to selected book type", "BOOK_GENRE_TYPE_MISMATCH");
        }

        books.setBookType(bookType);
        books.setGenre(genre);
        books.setLanguage(language);
        books.setFormat(format);
        books.setCondition(condition);

        books.setSeller(seller);
        books.setListingFeePaid(true);
        books.setStatus(ListingStatus.ACTIVE);

        BooksListing saved = booksRepository.save(books);
        log.info("Books listing created: {}", saved.getId());

        eventPublisher.publishEvent(new NewListingCreatedEvent(this, saved));

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateBooksListing(UUID id, BooksUpdateRequest request, Long currentUserId) {
        // 1. Ownership Check (Long userId based)
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        BooksListing existing = booksRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Books listing not found", "LISTING_NOT_FOUND");
        }

        // 2. Status Validation
        Result<Void> statusResult = listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        if (statusResult.isError()) {
            return Result.error(statusResult.getMessage(), statusResult.getErrorCode());
        }

        var oldPrice = existing.getPrice();

        // 3. Optional Updates
        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.quantity().ifPresent(q -> {
            if (q >= 1) existing.setQuantity(q);
        });
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);

        request.author().ifPresent(existing::setAuthor);
        request.publicationYear().ifPresent(existing::setPublicationYear);
        request.pageCount().ifPresent(existing::setPageCount);
        request.isbn().ifPresent(existing::setIsbn);

        request.bookTypeId().ifPresent(bookTypeId -> {
            var bookType = bookTypeRepository.findById(bookTypeId).orElse(null);
            if (bookType != null) {
                existing.setBookType(bookType);
            }
        });
        request.genreId().ifPresent(genreId -> {
            var genre = bookGenreRepository.findById(genreId).orElse(null);
            if (genre != null) {
                existing.setGenre(genre);
            }
        });
        request.languageId().ifPresent(languageId -> {
            var language = bookLanguageRepository.findById(languageId).orElse(null);
            if (language != null) {
                existing.setLanguage(language);
            }
        });
        request.formatId().ifPresent(formatId -> {
            var format = bookFormatRepository.findById(formatId).orElse(null);
            if (format != null) {
                existing.setFormat(format);
            }
        });
        request.conditionId().ifPresent(conditionId -> {
            var condition = bookConditionRepository.findById(conditionId).orElse(null);
            if (condition != null) {
                existing.setCondition(condition);
            }
        });

        if (existing.getBookType() != null && existing.getGenre() != null && existing.getGenre().getBookType() != null &&
                existing.getGenre().getBookType().getId() != null && existing.getBookType().getId() != null &&
                !existing.getGenre().getBookType().getId().equals(existing.getBookType().getId())) {
            return Result.error("Book genre does not belong to selected book type", "BOOK_GENRE_TYPE_MISMATCH");
        }

        if (request.quantity().isPresent() && request.quantity().get() < 1) {
            return Result.error("Quantity must be at least 1", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        // 4. Save and Price History Record
        booksRepository.save(existing);

        if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                    existing.getId(),
                    existing.getTitle(),
                    oldPrice,
                    existing.getPrice(),
                    existing.getCurrency(),
                    "Price updated via listing edit"
            );
        }

        log.info("Books listing updated: {}", id);
        return Result.success();
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