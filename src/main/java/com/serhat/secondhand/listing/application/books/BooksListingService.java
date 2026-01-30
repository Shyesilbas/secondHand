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
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.books.BooksListingRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.books.BooksSpecValidator;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
    private final UserService userService;
    private final ListingValidationEngine listingValidationEngine;
    private final List<BooksSpecValidator> booksSpecValidators;
    private final BooksMapper booksMapper;
    private final BooksListingResolver booksListingResolver;

    @Transactional
    public Result<UUID> createBooksListing(BooksCreateRequest request, Long sellerId) {
        log.info("Creating books listing for sellerId: {}", sellerId);

        var userResult = userService.findById(sellerId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User seller = userResult.getData();

        BooksListing books = listingMapper.toBooksEntity(request);
        if (books.getQuantity() == null || books.getQuantity() < 1) {
            return Result.error("Invalid quantity for books listing", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        var resolutionResult = booksListingResolver.resolve(
                request.bookTypeId(),
                request.genreId(),
                request.languageId(),
                request.formatId(),
                request.conditionId()
        );
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }

        BooksResolution res = resolutionResult.getData();
        books.setBookType(res.bookType());
        books.setGenre(res.genre());
        books.setLanguage(res.language());
        books.setFormat(res.format());
        books.setCondition(res.condition());

        books.setSeller(seller);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(books, booksSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        BooksListing saved = booksRepository.save(books);
        log.info("Books listing created: {}", saved.getId());

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateBooksListing(UUID id, BooksUpdateRequest request, Long currentUserId) {
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        BooksListing existing = booksRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Books listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateEditableStatus(existing);
        if (statusResult.isError()) {
            return statusResult;
        }

        var oldPrice = existing.getPrice();

        Result<Void> quantityResult = listingService.applyQuantityUpdate(existing, request.quantity());
        if (quantityResult.isError()) {
            return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
        }
        Result<Void> applyResult = booksListingResolver.apply(
                existing,
                request.bookTypeId(),
                request.genreId(),
                request.languageId(),
                request.formatId(),
                request.conditionId()
        );
        if (applyResult.isError()) {
            return Result.error(applyResult.getMessage(), applyResult.getErrorCode());
        }
        booksMapper.updateEntityFromRequest(existing, request);


        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(existing, booksSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        booksRepository.save(existing);

        priceHistoryService.recordPriceChangeIfUpdated(
                existing,
                oldPrice,
                request.base() != null ? request.base().price() : null,
                "Price updated via listing edit"
        );

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