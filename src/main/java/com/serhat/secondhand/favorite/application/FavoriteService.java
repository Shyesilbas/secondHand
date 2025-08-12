package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.favorite.domain.dto.FavoriteDto;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.entity.Favorite;
import com.serhat.secondhand.favorite.domain.mapper.FavoriteMapper;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ListingService listingService;
    private final FavoriteMapper favoriteMapper;
    
    /**
     * Add a listing to user's favorites
     */
    @Transactional
    public FavoriteDto addToFavorites(User user, UUID listingId) {
        log.info("Adding listing {} to favorites for user {}", listingId, user.getEmail());
        
        if (favoriteRepository.existsByUserAndListingId(user, listingId)) {
            throw new BusinessException("Listing is already in favorites", HttpStatus.BAD_REQUEST, "ALREADY_FAVORITED");
        }
        
        // Verify listing exists and is active
        Listing listing = listingService.findById(listingId)
            .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));

        if (!listing.getStatus().equals(ListingStatus.ACTIVE)) {
            throw new BusinessException("Cannot favorite inactive listing", HttpStatus.BAD_REQUEST, "INACTIVE_LISTING");
        }

        
        // Create and save favorite
        Favorite favorite = Favorite.builder()
            .user(user)
            .listing(listing)
            .build();

        if(favorite.getUser().getId().equals(listing.getSeller().getId())){
            throw new BusinessException("Cannot favorite own listing", HttpStatus.BAD_REQUEST, "OWN_LISTING");
        }
        
        favorite = favoriteRepository.save(favorite);
        
        log.info("Successfully added listing {} to favorites for user {}", listingId, user.getEmail());
        return favoriteMapper.toDto(favorite);
    }
    
    /**
     * Remove a listing from user's favorites
     */
    @Transactional
    public void removeFromFavorites(User user, UUID listingId) {
        log.info("Removing listing {} from favorites for user {}", listingId, user.getEmail());
        
        if (!favoriteRepository.existsByUserAndListingId(user, listingId)) {
            throw new BusinessException("Listing is not in favorites", HttpStatus.BAD_REQUEST, "NOT_FAVORITED");
        }
        
        favoriteRepository.deleteByUserAndListingId(user, listingId);
        
        log.info("Successfully removed listing {} from favorites for user {}", listingId, user.getEmail());
    }
    
    /**
     * Toggle favorite status (add if not exists, remove if exists)
     */
    @Transactional
    public FavoriteStatsDto toggleFavorite(User user, UUID listingId) {
        log.info("Toggling favorite status for listing {} and user {}", listingId, user.getEmail());
        
        boolean isFavorited = favoriteRepository.existsByUserAndListingId(user, listingId);
        
        if (isFavorited) {
            removeFromFavorites(user, listingId);
        } else {
            addToFavorites(user, listingId);
        }
        
        // Return updated stats
        return getFavoriteStats(listingId, user.getEmail());
    }
    
    /**
     * Get user's favorite listings with pagination
     */
    public Page<FavoriteDto> getUserFavorites(User user, Pageable pageable) {
        String userEmail = user.getEmail();
        log.info("Getting favorites for user {} with pagination", userEmail);
        
        Page<Favorite> favorites = favoriteRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return favorites.map(favoriteMapper::toDto);
    }
    
    /**
     * Get favorite statistics for a listing
     */
    public FavoriteStatsDto getFavoriteStats(UUID listingId, String userEmail) {
        long favoriteCount = favoriteRepository.countByListingId(listingId);
        boolean isFavorited = userEmail != null && favoriteRepository.existsByUserEmailAndListingId(userEmail, listingId);
        
        return FavoriteStatsDto.builder()
            .listingId(listingId)
            .favoriteCount(favoriteCount)
            .isFavorited(isFavorited)
            .build();
    }
    

    public Map<UUID, FavoriteStatsDto> getFavoriteStatsForListings(List<UUID> listingIds, String userEmail) {
        log.info("Getting favorite stats for {} listings", listingIds.size());
        
        List<Object[]> countResults = favoriteRepository.countByListingIds(listingIds);
        Map<UUID, Long> favoriteCounts = countResults.stream()
            .collect(Collectors.toMap(
                result -> (UUID) result[0], 
                result -> (Long) result[1]
            ));
        
        List<UUID> userFavoriteIds = userEmail != null ?
            favoriteRepository.findListingIdsByUserEmail(userEmail) : List.of();
        
        return listingIds.stream()
            .collect(Collectors.toMap(
                listingId -> listingId,
                listingId -> FavoriteStatsDto.builder()
                    .listingId(listingId)
                    .favoriteCount(favoriteCounts.getOrDefault(listingId, 0L))
                    .isFavorited(userFavoriteIds.contains(listingId))
                    .build()
            ));
    }
    

    public boolean isFavorited(User user, UUID listingId) {
        return favoriteRepository.existsByUserAndListingId(user, listingId);
    }
    

    public long getFavoriteCount(UUID listingId) {
        return favoriteRepository.countByListingId(listingId);
    }
    

    public List<Long> getUsersWhoFavorited(UUID listingId) {
        return favoriteRepository.findUserIdsByListingId(listingId);
    }
    

    public Page<Object[]> getTopFavoritedListings(Pageable pageable) {
        return favoriteRepository.findTopFavoritedListings(pageable);
    }
    
    /**
     * Get user's favorite listing IDs for quick lookup
     */
    public List<UUID> getUserFavoriteIds(User user) {
        return favoriteRepository.findListingIdsByUser(user);
    }
}