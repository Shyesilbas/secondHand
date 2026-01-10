package com.serhat.secondhand.favoritelist.mapper;

import com.serhat.secondhand.favoritelist.dto.FavoriteListDto;
import com.serhat.secondhand.favoritelist.dto.FavoriteListItemDto;
import com.serhat.secondhand.favoritelist.dto.FavoriteListSummaryDto;
import com.serhat.secondhand.favoritelist.entity.FavoriteList;
import com.serhat.secondhand.favoritelist.entity.FavoriteListItem;
import com.serhat.secondhand.favoritelist.entity.FavoriteListLike;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class FavoriteListMapper {

    public FavoriteListDto toDto(FavoriteList entity, User currentUser) {
        if (entity == null) return null;

        // Safely get items and likes - avoid ConcurrentModificationException
        List<FavoriteListItem> itemsCopy = safeGetItems(entity);
        List<FavoriteListLike> likesCopy = safeGetLikes(entity);

        boolean isOwner = currentUser != null && entity.getOwner().getId().equals(currentUser.getId());
        boolean isLiked = currentUser != null && likesCopy.stream()
            .anyMatch(like -> like.getUser().getId().equals(currentUser.getId()));

        BigDecimal totalPrice = calculateTotalPrice(itemsCopy);
        String currency = getFirstCurrency(itemsCopy);

        return FavoriteListDto.builder()
            .id(entity.getId())
            .name(entity.getName())
            .description(entity.getDescription())
            .isPublic(entity.isPublic())
            .coverImageUrl(entity.getCoverImageUrl())
            .ownerId(entity.getOwner().getId())
            .ownerName(entity.getOwner().getName() + " " + entity.getOwner().getSurname())
            .ownerAvatar(null)
            .itemCount(itemsCopy.size())
            .likeCount(likesCopy.size())
            .totalPrice(totalPrice)
            .currency(currency)
            .isLikedByCurrentUser(isLiked)
            .isOwner(isOwner)
            .items(toItemDtoList(itemsCopy))
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public FavoriteListSummaryDto toSummaryDto(FavoriteList entity) {
        if (entity == null) return null;

        // For summary, we don't need all items/likes - just counts
        // Try to get counts without fully loading collections if possible
        int itemCount = 0;
        int likeCount = 0;
        BigDecimal totalPrice = BigDecimal.ZERO;
        String currency = "TRY";
        String previewImage = entity.getCoverImageUrl();

        try {
            Set<FavoriteListItem> items = entity.getItems();
            if (items != null && Hibernate.isInitialized(items)) {
                List<FavoriteListItem> itemsList = new ArrayList<>(items);
                itemCount = itemsList.size();
                totalPrice = calculateTotalPrice(itemsList);
                currency = getFirstCurrency(itemsList);
                if (previewImage == null || previewImage.isEmpty()) {
                    previewImage = getPreviewImage(null, itemsList);
                }
            }
        } catch (Exception e) {
            // Collection not initialized, use defaults
        }

        try {
            Set<FavoriteListLike> likes = entity.getLikes();
            if (likes != null && Hibernate.isInitialized(likes)) {
                likeCount = likes.size();
            }
        } catch (Exception e) {
            // Collection not initialized, use default
        }

        return FavoriteListSummaryDto.builder()
            .id(entity.getId())
            .name(entity.getName())
            .description(entity.getDescription())
            .isPublic(entity.isPublic())
            .coverImageUrl(entity.getCoverImageUrl())
            .ownerId(entity.getOwner().getId())
            .ownerName(entity.getOwner().getName() + " " + entity.getOwner().getSurname())
            .itemCount(itemCount)
            .likeCount(likeCount)
            .totalPrice(totalPrice)
            .currency(currency)
            .previewImageUrl(previewImage)
            .createdAt(entity.getCreatedAt())
            .build();
    }

    private List<FavoriteListItem> safeGetItems(FavoriteList entity) {
        try {
            Set<FavoriteListItem> items = entity.getItems();
            if (items == null) return Collections.emptyList();
            // Force initialization and create copy
            Hibernate.initialize(items);
            return new ArrayList<>(items);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<FavoriteListLike> safeGetLikes(FavoriteList entity) {
        try {
            Set<FavoriteListLike> likes = entity.getLikes();
            if (likes == null) return Collections.emptyList();
            // Force initialization and create copy
            Hibernate.initialize(likes);
            return new ArrayList<>(likes);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public FavoriteListItemDto toItemDto(FavoriteListItem item) {
        if (item == null) return null;

        Listing listing = item.getListing();

        return FavoriteListItemDto.builder()
            .id(item.getId())
            .listingId(listing.getId())
            .listingTitle(listing.getTitle())
            .listingPrice(listing.getPrice())
            .listingCurrency(listing.getCurrency() != null ? listing.getCurrency().name() : "TRY")
            .listingImageUrl(listing.getImageUrl())
            .listingStatus(listing.getStatus() != null ? listing.getStatus().name() : null)
            .note(item.getNote())
            .addedAt(item.getAddedAt())
            .build();
    }

    public List<FavoriteListItemDto> toItemDtoList(Collection<FavoriteListItem> items) {
        if (items == null || items.isEmpty()) return List.of();
        return items.stream()
            .map(this::toItemDto)
            .collect(Collectors.toList());
    }

    private BigDecimal calculateTotalPrice(List<FavoriteListItem> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return items.stream()
            .map(item -> item.getListing().getPrice())
            .filter(price -> price != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String getFirstCurrency(List<FavoriteListItem> items) {
        if (items == null || items.isEmpty()) {
            return "TRY";
        }
        return items.stream()
            .map(item -> item.getListing().getCurrency())
            .filter(currency -> currency != null)
            .map(Enum::name)
            .findFirst()
            .orElse("TRY");
    }

    private String getPreviewImage(String coverImageUrl, List<FavoriteListItem> items) {
        if (coverImageUrl != null && !coverImageUrl.isEmpty()) {
            return coverImageUrl;
        }
        if (items == null || items.isEmpty()) {
            return null;
        }
        return items.stream()
            .map(item -> item.getListing().getImageUrl())
            .filter(imageUrl -> imageUrl != null && !imageUrl.isEmpty())
            .findFirst()
            .orElse(null);
    }
}

