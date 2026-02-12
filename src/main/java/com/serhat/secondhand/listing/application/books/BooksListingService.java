package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.AbstractListingService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
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
import com.serhat.secondhand.user.application.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class BooksListingService extends AbstractListingService<BooksListing, BooksCreateRequest> {

    private final BooksListingRepository booksRepository;
    private final BooksListingFilterService booksListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final List<BooksSpecValidator> booksSpecValidators;
    private final BooksMapper booksMapper;
    private final BooksListingResolver booksListingResolver;
    
    public BooksListingService(
            BooksListingRepository booksRepository,
            IListingService listingService,
            ListingMapper listingMapper,
            BooksListingFilterService booksListingFilterService,
            PriceHistoryService priceHistoryService,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<BooksSpecValidator> booksSpecValidators,
            BooksMapper booksMapper,
            BooksListingResolver booksListingResolver) {
        super(userService, listingService, listingMapper, listingValidationEngine);
        this.booksRepository = booksRepository;
        this.booksListingFilterService = booksListingFilterService;
        this.priceHistoryService = priceHistoryService;
        this.booksSpecValidators = booksSpecValidators;
        this.booksMapper = booksMapper;
        this.booksListingResolver = booksListingResolver;
    }

    public Result<UUID> createBooksListing(BooksCreateRequest request, Long sellerId) {
        return createListing(request, sellerId);
    }
    
    @Override
    protected String getListingType() {
        return "Books";
    }
    
    @Override
    protected BooksListing mapRequestToEntity(BooksCreateRequest request) {
        return listingMapper.toBooksEntity(request);
    }
    
    @Override
    protected boolean requiresQuantityValidation() {
        return true;
    }
    
    @Override
    protected Result<BooksResolution> resolveEntities(BooksCreateRequest request) {
        return booksListingResolver.resolve(
                request.bookTypeId(),
                request.genreId(),
                request.languageId(),
                request.formatId(),
                request.conditionId()
        );
    }
    
    @Override
    protected void applyResolution(BooksListing entity, Object resolution) {
        BooksResolution res = (BooksResolution) resolution;
        entity.setBookType(res.bookType());
        entity.setGenre(res.genre());
        entity.setLanguage(res.language());
        entity.setFormat(res.format());
        entity.setCondition(res.condition());
    }
    
    @Override
    protected Result<Void> validate(BooksListing entity) {
        return listingValidationEngine.cleanupAndValidate(entity, booksSpecValidators);
    }
    
    @Override
    protected BooksListing save(BooksListing entity) {
        return booksRepository.save(entity);
    }

    @Transactional
    @TrackPriceChange(reason = "Price updated via listing edit")
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