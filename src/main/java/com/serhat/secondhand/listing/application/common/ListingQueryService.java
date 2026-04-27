package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.dto.CachedPage;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingViewStatsDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import com.serhat.secondhand.review.application.IReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ListingQueryService {

    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final ListingEnrichmentService enrichmentService;
    private final ListingViewService listingViewService;
    private final IReviewService reviewService;
    @Qualifier("taskExecutor")
    private final Executor taskExecutor;

    @Lazy
    @Autowired
    private ListingQueryService self;

    public Optional<Listing> findById(UUID id) {
        return listingRepository.findById(id);
    }

    @Transactional
    public Optional<Listing> findByIdWithLock(UUID id) {
        return listingRepository.findByIdWithLock(id);
    }

    public Optional<ListingDto> findByIdAsDto(UUID id, Long currentUserId, Long userId) {
        return listingRepository.findByIdWithSeller(id).map(listing -> toDtoWithEnrichment(listing, currentUserId, userId));
    }

    /** İlan numarası (ör. Z4ZW3EQZ) ile; listing_no tekil. */
    public Optional<ListingDto> findByListingNoAsDto(String listingNo, Long currentUserId, Long userId) {
        if (listingNo == null || listingNo.isBlank()) {
            return Optional.empty();
        }
        return listingRepository.findByListingNoWithSeller(listingNo.trim())
                .map(listing -> toDtoWithEnrichment(listing, currentUserId, userId));
    }

    private ListingDto toDtoWithEnrichment(Listing listing, Long currentUserId, Long userId) {
        UUID id = listing.getId();
        ListingDto dto = listingMapper.toDynamicDto(listing);

        CompletableFuture<Void> enrichTask = CompletableFuture.runAsync(() ->
                enrichmentService.enrichInPlace(dto, userId), taskExecutor);

        if (currentUserId != null && listing.isOwnedBy(currentUserId)) {
            CompletableFuture<ListingViewStatsDto> statsTask = CompletableFuture.supplyAsync(() ->
                    listingViewService.getViewStatistics(id,
                            LocalDateTime.now().minusDays(ListingBusinessConstants.DEFAULT_VIEW_STATS_WINDOW_DAYS),
                            LocalDateTime.now()), taskExecutor);

            CompletableFuture.allOf(enrichTask, statsTask).join();
            dto.setViewStats(statsTask.join());
        } else {
            enrichTask.join();
        }

        if (dto.getType() != null
                && !ListingBusinessConstants.LISTING_TYPES_EXCLUDED_FROM_INLINE_REVIEWS.contains(dto.getType())) {
            var reviewsResult = reviewService.getReviewsForListing(id.toString(),
                    PageRequest.of(ListingBusinessConstants.DEFAULT_PAGE_INDEX, ListingBusinessConstants.REVIEWS_PAGE_SIZE));
            if (reviewsResult.isSuccess() && reviewsResult.getData() != null) {
                dto.setReviews(reviewsResult.getData().getContent());
            }
        }

        return dto;
    }

    public List<Listing> findAllByIds(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return listingRepository.findAllByIdIn(ids);
    }

    public List<ListingDto> findByIds(List<UUID> ids, Long userId) {
        if (ids == null || ids.isEmpty()) return List.of();
        List<Listing> listings = listingRepository.findAllByIdIn(ids);
        List<ListingDto> dtos = listings.stream()
                .map(listingMapper::toDynamicDto)
                .collect(Collectors.toList());
        return enrichList(dtos, userId);
    }

    public Page<ListingDto> getMyListings(Long userId, int page, int size) {
        return self.getCachedUserListings(userId, page, size).toPage();
    }

    @Cacheable(value = "userProfile", key = "'listings:' + #userId + ':' + #page + ':' + #size")
    public CachedPage<ListingDto> getCachedUserListings(Long userId, int page, int size) {
        log.info("[CACHE MISS] userListings::{} page={}", userId, page);
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));
        Page<Listing> listingsPage = listingRepository.findBySellerId(userId, pageable);
        return CachedPage.from(enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId));
    }

    public Page<ListingDto> getMyListings(Long userId, int page, int size, ListingType listingType) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));
        Page<Listing> listingsPage = listingRepository.findBySellerIdAndListingType(userId, listingType, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public Page<ListingDto> getMyListingsByStatus(Long userId, ListingStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, ListingBusinessConstants.LISTING_SORT_PROPERTY_CREATED_AT));
        Page<Listing> listingsPage = listingRepository.findBySellerIdAndStatus(userId, status, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), userId);
    }

    public Page<ListingDto> findByStatusAsDto(ListingStatus status, Pageable pageable) {
        Page<Listing> listingsPage = listingRepository.findByStatus(status, pageable);
        return enrichPage(listingsPage.map(listingMapper::toDynamicDto), null);
    }

    private List<ListingDto> enrichList(List<ListingDto> dtos, Long userId) {
        return enrichmentService.enrich(dtos, userId);
    }

    private Page<ListingDto> enrichPage(Page<ListingDto> page, Long userId) {
        return new PageImpl<>(enrichmentService.enrich(page.getContent(), userId), page.getPageable(), page.getTotalElements());
    }
}
