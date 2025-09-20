package com.serhat.secondhand.favorite.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.favorite.domain.dto.FavoriteDto;
import com.serhat.secondhand.favorite.util.FavoriteErrorCodes;
import com.serhat.secondhand.favorite.domain.dto.FavoriteStatsDto;
import com.serhat.secondhand.favorite.domain.entity.Favorite;
import com.serhat.secondhand.favorite.domain.mapper.FavoriteMapper;
import com.serhat.secondhand.favorite.domain.repository.FavoriteRepository;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FavoriteService {
    
    private final FavoriteRepository favoriteRepository;
    private final ListingAccessService listingAccessService;
    private final FavoriteMapper favoriteMapper;
    private final FavoriteStatsService favoriteStatsService;
    

    @Transactional
    public FavoriteDto addToFavorites(User user, UUID listingId) {
        log.info("Adding listing {} to favorites for user {}", listingId, user.getEmail());
        
        if (favoriteRepository.existsByUserAndListingId(user, listingId)) {
            throw new BusinessException(FavoriteErrorCodes.ALREADY_FAVORITED);
        }
        
        Listing listing = listingAccessService.findById(listingId)
            .orElseThrow(() -> new BusinessException(FavoriteErrorCodes.LISTING_NOT_FOUND));

        listingAccessService.validateActive(listing);

        
        Favorite favorite = Favorite.builder()
            .user(user)
            .listing(listing)
                .createdAt(LocalDateTime.now())
            .build();

        if(favorite.getUser().getId().equals(listing.getSeller().getId())){
            throw new BusinessException(FavoriteErrorCodes.OWN_LISTING);
        }
        
        favorite = favoriteRepository.save(favorite);
        
        log.info("Successfully added listing {} to favorites for user {}", listingId, user.getEmail());
        return favoriteMapper.toDto(favorite);
    }
    

    @Transactional
    public void removeFromFavorites(User user, UUID listingId) {
        log.info("Removing listing {} from favorites for user {}", listingId, user.getEmail());
        
        if (!favoriteRepository.existsByUserAndListingId(user, listingId)) {
            throw new BusinessException(FavoriteErrorCodes.NOT_FAVORITED);
        }
        
        favoriteRepository.deleteByUserAndListingId(user, listingId);
        
        log.info("Successfully removed listing {} from favorites for user {}", listingId, user.getEmail());
    }
    

    @Transactional
    public FavoriteStatsDto toggleFavorite(User user, UUID listingId) {
        log.info("Toggling favorite status for listing {} and user {}", listingId, user.getEmail());
        
        boolean isFavorited = favoriteRepository.existsByUserAndListingId(user, listingId);
        
        if (isFavorited) {
            removeFromFavorites(user, listingId);
        } else {
            addToFavorites(user, listingId);
        }
        
        return getFavoriteStats(listingId, user.getEmail());
    }

    public Page<FavoriteDto> getUserFavorites(User user, Pageable pageable) {
        String userEmail = user.getEmail();
        log.info("Getting favorites for user {} with pagination", userEmail);

        Page<Favorite> favorites = favoriteRepository.findByUserOrderByCreatedAtDesc(user, pageable);

        Page<FavoriteDto> favoriteDtos = favorites.map(favoriteMapper::toDto);

        List<ListingDto> listings = favoriteDtos.stream()
                .map(FavoriteDto::getListing)
                .toList();

        enrichWithFavoriteStats(listings, userEmail);

        return favoriteDtos;
    }


    private void enrichWithFavoriteStats(List<ListingDto> dtos, String userEmail) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }

        List<UUID> listingIds = dtos.stream()
                .map(ListingDto::getId)
                .toList();

        Map<UUID, FavoriteStatsDto> statsMap = favoriteStatsService.getFavoriteStatsForListings(listingIds, userEmail);

        for (ListingDto dto : dtos) {
            dto.setFavoriteStats(statsMap.getOrDefault(dto.getId(),
                    FavoriteStatsDto.builder()
                            .listingId(dto.getId())
                            .favoriteCount(0L)
                            .isFavorited(false)
                            .build()
            ));
        }
    }



    public FavoriteStatsDto getFavoriteStats(UUID listingId, String userEmail) {
        return favoriteStatsService.getFavoriteStats(listingId, userEmail);
    }
    

    public Map<UUID, FavoriteStatsDto> getFavoriteStatsForListings(List<UUID> listingIds, String userEmail) {
        return favoriteStatsService.getFavoriteStatsForListings(listingIds, userEmail);
    }
    

    public boolean isFavorited(User user, UUID listingId) {
        return favoriteRepository.existsByUserAndListingId(user, listingId);
    }
    

    public long getFavoriteCount(UUID listingId) {
        return favoriteRepository.countByListingId(listingId);
    }
    


    

    public Page<Object[]> getTopFavoritedListings(Pageable pageable) {
        return favoriteRepository.findTopFavoritedListings(pageable);
    }
    

    public List<UUID> getUserFavoriteIds(User user) {
        return favoriteRepository.findListingIdsByUser(user);
    }
}