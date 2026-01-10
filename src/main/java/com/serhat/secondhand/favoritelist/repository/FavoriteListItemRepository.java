package com.serhat.secondhand.favoritelist.repository;

import com.serhat.secondhand.favoritelist.entity.FavoriteList;
import com.serhat.secondhand.favoritelist.entity.FavoriteListItem;
import com.serhat.secondhand.listing.domain.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteListItemRepository extends JpaRepository<FavoriteListItem, Long> {

    List<FavoriteListItem> findByFavoriteListOrderByAddedAtDesc(FavoriteList favoriteList);

    Optional<FavoriteListItem> findByFavoriteListAndListing(FavoriteList favoriteList, Listing listing);

    boolean existsByFavoriteListAndListing(FavoriteList favoriteList, Listing listing);

    @Query("SELECT fli FROM FavoriteListItem fli WHERE fli.favoriteList.id = :listId AND fli.listing.id = :listingId")
    Optional<FavoriteListItem> findByListIdAndListingId(@Param("listId") Long listId, @Param("listingId") UUID listingId);

    @Query("SELECT fli.favoriteList.id FROM FavoriteListItem fli WHERE fli.listing.id = :listingId AND fli.favoriteList.owner.id = :ownerId")
    List<Long> findListIdsByListingIdAndOwnerId(@Param("listingId") UUID listingId, @Param("ownerId") Long ownerId);

    void deleteByFavoriteListAndListing(FavoriteList favoriteList, Listing listing);

    @Query("SELECT COUNT(fli) FROM FavoriteListItem fli WHERE fli.favoriteList = :list")
    long countByFavoriteList(@Param("list") FavoriteList list);
}

