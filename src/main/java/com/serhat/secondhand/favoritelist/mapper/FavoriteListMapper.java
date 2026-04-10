package com.serhat.secondhand.favoritelist.mapper;

import com.serhat.secondhand.favoritelist.dto.FavoriteListDto;
import com.serhat.secondhand.favoritelist.dto.FavoriteListItemDto;
import com.serhat.secondhand.favoritelist.dto.FavoriteListSummaryDto;
import com.serhat.secondhand.favoritelist.entity.FavoriteList;
import com.serhat.secondhand.favoritelist.entity.FavoriteListItem;
import com.serhat.secondhand.favoritelist.entity.FavoriteListLike;
import com.serhat.secondhand.favoritelist.repository.projection.FavoriteListSummaryProjection;
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
    private static final String DEFAULT_CURRENCY = "TRY";

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

        int itemCount = 0;
        int likeCount = 0;
        BigDecimal totalPrice = BigDecimal.ZERO;
        String currency = DEFAULT_CURRENCY;
        String previewImage = entity.getCoverImageUrl();

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

        Set<FavoriteListLike> likes = entity.getLikes();
        if (likes != null && Hibernate.isInitialized(likes)) {
            likeCount = likes.size();
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

    public FavoriteListSummaryDto toSummaryDto(FavoriteListSummaryProjection projection) {
        if (projection == null) return null;
        return FavoriteListSummaryDto.builder()
            .id(projection.getId())
            .name(projection.getName())
            .description(projection.getDescription())
            .isPublic(projection.getIsPublic())
            .coverImageUrl(projection.getCoverImageUrl())
            .ownerId(projection.getOwnerId())
            .ownerName(projection.getOwnerName())
            .itemCount((int) projection.getItemCount())
            .likeCount((int) projection.getLikeCount())
            .totalPrice(projection.getTotalPrice() != null ? projection.getTotalPrice() : BigDecimal.ZERO)
            .currency(projection.getCurrency() != null ? projection.getCurrency() : DEFAULT_CURRENCY)
            .previewImageUrl(projection.getPreviewImageUrl())
            .createdAt(projection.getCreatedAt())
            .build();
    }

    private List<FavoriteListItem> safeGetItems(FavoriteList entity) {
        Set<FavoriteListItem> items = entity.getItems();
        if (items == null || !Hibernate.isInitialized(items)) {
            return Collections.emptyList();
        }
        return new ArrayList<>(items);
    }

    private List<FavoriteListLike> safeGetLikes(FavoriteList entity) {
        Set<FavoriteListLike> likes = entity.getLikes();
        if (likes == null || !Hibernate.isInitialized(likes)) {
            return Collections.emptyList();
        }
        return new ArrayList<>(likes);
    }

    public FavoriteListItemDto toItemDto(FavoriteListItem item) {
        if (item == null) return null;

        Listing listing = item.getListing();

        return FavoriteListItemDto.builder()
            .id(item.getId())
            .listingId(listing.getId())
            .listingTitle(listing.getTitle())
            .listingPrice(listing.getPrice())
            .listingCurrency(listing.getCurrency() != null ? listing.getCurrency().name() : DEFAULT_CURRENCY)
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
            return DEFAULT_CURRENCY;
        }
        return items.stream()
            .map(item -> item.getListing().getCurrency())
            .filter(currency -> currency != null)
            .map(Enum::name)
            .findFirst()
            .orElse(DEFAULT_CURRENCY);
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

