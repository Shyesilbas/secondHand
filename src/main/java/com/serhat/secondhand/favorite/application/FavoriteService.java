package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.favorite.domain.dto.FavoriteDto;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.entity.Favorite;
import com.serhat.secondhand.favorite.domain.mapper.FavoriteMapper;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.favorite.util.FavoriteErrorCodes;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.enrich.ListingEnrichmentService;
import com.serhat.secondhand.notification.service.NotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FavoriteService {
    
    private final FavoriteRepository favoriteRepository;
    private final ListingAccessService listingAccessService;
    private final FavoriteMapper favoriteMapper;
    private final FavoriteStatsService favoriteStatsService;
    private final ListingRepository listingRepository;
    private final ListingMapper listingMapper;
    private final ListingEnrichmentService listingEnrichmentService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final NotificationTemplateCatalog notificationTemplateCatalog;
    

    @Transactional
    public Result<FavoriteDto> addToFavorites(Long userId, UUID listingId) {
        log.info("Adding listing {} to favorites for userId {}", listingId, userId);

        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();
        
        if (favoriteRepository.existsByUserAndListingId(user, listingId)) {
            return Result.error(FavoriteErrorCodes.ALREADY_FAVORITED);
        }
        
        Listing listing = listingAccessService.findById(listingId)
            .orElse(null);

        if (listing == null) {
            return Result.error(FavoriteErrorCodes.LISTING_NOT_FOUND);
        }

        Result<Void> activeResult = listingAccessService.validateActive(listing);
        if (activeResult.isError()) {
            return Result.error(activeResult.getMessage(), activeResult.getErrorCode());
        }

        
        Favorite favorite = Favorite.builder()
            .user(user)
            .listing(listing)
                .createdAt(LocalDateTime.now())
            .build();

        if(favorite.getUser().getId().equals(listing.getSeller().getId())){
            return Result.error(FavoriteErrorCodes.OWN_LISTING);
        }
        
        favorite = favoriteRepository.save(favorite);

        try {
            Long sellerId = listing.getSeller() != null ? listing.getSeller().getId() : null;
            if (sellerId != null) {
                String actorName = (user.getName() == null ? "" : user.getName()) + " " + (user.getSurname() == null ? "" : user.getSurname());
                actorName = actorName.trim();
                var notificationResult = notificationService.createAndSend(
                        notificationTemplateCatalog.listingFavorited(
                                sellerId,
                                listing.getId(),
                                listing.getTitle(),
                                userId,
                                actorName
                        )
                );
                if (notificationResult.isError()) {
                    log.error("Failed to create listing favorited notification: {}", notificationResult.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to create in-app notification for listing favorited: {}", e.getMessage());
        }
        
        log.info("Successfully added listing {} to favorites for user {}", listingId, user.getEmail());
        return Result.success(favoriteMapper.toDto(favorite));
    }
    

    @Transactional
    public Result<Void> removeFromFavorites(Long userId, UUID listingId) {
        log.info("Removing listing {} from favorites for userId {}", listingId, userId);

        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();
        
        if (!favoriteRepository.existsByUserAndListingId(user, listingId)) {
            return Result.error(FavoriteErrorCodes.NOT_FAVORITED);
        }
        
        favoriteRepository.deleteByUserAndListingId(user, listingId);
        
        log.info("Successfully removed listing {} from favorites for user {}", listingId, user.getEmail());
        return Result.success();
    }
    

    @Transactional
    public Result<FavoriteStatsDto> toggleFavorite(Long userId, UUID listingId) {
        log.info("Toggling favorite status for listing {} and userId {}", listingId, userId);

        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();
        
        boolean isFavorited = favoriteRepository.existsByUserAndListingId(user, listingId);

        if (isFavorited) {
            Result<Void> removeResult = removeFromFavorites(userId, listingId);
            if (removeResult.isError()) {
                return Result.error(removeResult.getMessage(), removeResult.getErrorCode());
            }
        } else {
            Result<FavoriteDto> addResult = addToFavorites(userId, listingId);
            if (addResult.isError()) {
                return Result.error(addResult.getMessage(), addResult.getErrorCode());
            }
        }
        
        Result<FavoriteStatsDto> statsResult = getFavoriteStats(listingId, user.getId());
        if (statsResult.isError()) {
            return Result.error(statsResult.getMessage(), statsResult.getErrorCode());
        }
        return statsResult;
    }

    public Result<Page<FavoriteDto>> getUserFavorites(Long userId, Pageable pageable) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getMessage(), userResult.getErrorCode());
        User user = userResult.getData();

        Page<Favorite> favorites = favoriteRepository.findByUserWithListing(user, pageable);
        Page<FavoriteDto> favoriteDtos = favorites.map(favoriteMapper::toDto);

        List<ListingDto> listings = favoriteDtos.getContent().stream()
                .map(FavoriteDto::getListing)
                .toList();

        listingEnrichmentService.enrich(listings, userId);

        return Result.success(favoriteDtos);
    }

    public Result<FavoriteStatsDto> getFavoriteStats(UUID listingId, Long userId) {
        return Result.success(favoriteStatsService.getFavoriteStats(listingId, userId));
    }

    public Result<Map<UUID, FavoriteStatsDto>> getFavoriteStatsForListings(List<UUID> listingIds, Long userId) {
        return Result.success(favoriteStatsService.getFavoriteStatsForListings(listingIds, userId));
    }
    

    public Result<Boolean> isFavorited(Long userId, UUID listingId) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();
        return Result.success(favoriteRepository.existsByUserAndListingId(user, listingId));
    }


    public Result<Long> getFavoriteCount(UUID listingId) {
        return Result.success(favoriteRepository.countByListingId(listingId));
    }
    


    

    public Result<Page<Object[]>> getTopFavoritedListings(Pageable pageable) {
        return Result.success(favoriteRepository.findTopFavoritedListings(pageable));
    }

    public Result<List<ListingDto>> getTopFavoritedListingsWithDetails(int size, Long userId) {
        Pageable pageable = PageRequest.of(0, size);
        List<UUID> topIds = favoriteRepository.findTopFavoritedListingIds(pageable);

        if (topIds.isEmpty()) {
            return Result.success(List.of());
        }

        List<Listing> listings = listingRepository.findAllById(topIds);

        Map<UUID, Listing> listingMap = listings.stream()
                .collect(Collectors.toMap(Listing::getId, l -> l, (a, b) -> a, LinkedHashMap::new));

        List<ListingDto> orderedDtos = topIds.stream()
                .filter(listingMap::containsKey)
                .map(listingMap::get)
                .map(listingMapper::toDynamicDto)
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        return Result.success(listingEnrichmentService.enrich(orderedDtos, userId));
    }

    public Result<List<UUID>> getUserFavoriteIds(Long userId) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User user = userResult.getData();
        return Result.success(favoriteRepository.findListingIdsByUser(user));
    }
}