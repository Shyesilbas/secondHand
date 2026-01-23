package com.serhat.secondhand.favoritelist.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.favoritelist.dto.*;
import com.serhat.secondhand.favoritelist.entity.FavoriteList;
import com.serhat.secondhand.favoritelist.entity.FavoriteListItem;
import com.serhat.secondhand.favoritelist.entity.FavoriteListLike;
import com.serhat.secondhand.favoritelist.mapper.FavoriteListMapper;
import com.serhat.secondhand.favoritelist.repository.FavoriteListItemRepository;
import com.serhat.secondhand.favoritelist.repository.FavoriteListLikeRepository;
import com.serhat.secondhand.favoritelist.repository.FavoriteListRepository;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.hibernate.Hibernate;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FavoriteListService {

    private final FavoriteListRepository favoriteListRepository;
    private final FavoriteListItemRepository favoriteListItemRepository;
    private final FavoriteListLikeRepository favoriteListLikeRepository;
    private final ListingRepository listingRepository;
    private final FavoriteListMapper favoriteListMapper;

    private static final int MAX_LISTS_PER_USER = 20;
    private static final int MAX_ITEMS_PER_LIST = 100;

    public Result<FavoriteListDto> createList(User currentUser, CreateFavoriteListRequest request) {
        long userListCount = favoriteListRepository.countByOwner(currentUser);
        if (userListCount >= MAX_LISTS_PER_USER) {
            return Result.error("Maximum list limit reached (" + MAX_LISTS_PER_USER + ")", "FAVORITE_LIST_LIMIT_EXCEEDED");
        }

        if (favoriteListRepository.existsByOwnerAndName(currentUser, request.getName())) {
            return Result.error("A list with this name already exists", "FAVORITE_LIST_NAME_EXISTS");
        }

        FavoriteList favoriteList = FavoriteList.builder()
            .owner(currentUser)
            .name(request.getName())
            .description(request.getDescription())
            .isPublic(request.isPublic())
            .coverImageUrl(request.getCoverImageUrl())
            .build();

        favoriteList = favoriteListRepository.save(favoriteList);
        log.info("User {} created favorite list: {}", currentUser.getId(), favoriteList.getId());

        return Result.success(favoriteListMapper.toDto(favoriteList, currentUser));
    }

    public Result<FavoriteListDto> updateList(User currentUser, Long listId, UpdateFavoriteListRequest request) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();
        Result<Void> ownershipResult = validateOwnership(favoriteList, currentUser);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        if (request.getName() != null && !request.getName().equals(favoriteList.getName())) {
            if (favoriteListRepository.existsByOwnerAndName(currentUser, request.getName())) {
                return Result.error("A list with this name already exists", "FAVORITE_LIST_NAME_EXISTS");
            }
            favoriteList.setName(request.getName());
        }

        if (request.getDescription() != null) {
            favoriteList.setDescription(request.getDescription());
        }

        if (request.getIsPublic() != null) {
            favoriteList.setPublic(request.getIsPublic());
        }

        if (request.getCoverImageUrl() != null) {
            favoriteList.setCoverImageUrl(request.getCoverImageUrl());
        }

        favoriteList = favoriteListRepository.save(favoriteList);
        log.info("User {} updated favorite list: {}", currentUser.getId(), listId);

        return Result.success(favoriteListMapper.toDto(favoriteList, currentUser));
    }

    public Result<Void> deleteList(User currentUser, Long listId) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();
        Result<Void> ownershipResult = validateOwnership(favoriteList, currentUser);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        favoriteListRepository.delete(favoriteList);
        log.info("User {} deleted favorite list: {}", currentUser.getId(), listId);
        return Result.success();
    }

    @Transactional(readOnly = true)
    public Result<FavoriteListDto> getListById(Long listId, User currentUser) {
        FavoriteList favoriteList = favoriteListRepository.findById(listId)
            .orElse(null);

        if (favoriteList == null) {
            return Result.error("List not found", "FAVORITE_LIST_NOT_FOUND");
        }

        if (!favoriteList.isPublic() && (currentUser == null || !favoriteList.getOwner().getId().equals(currentUser.getId()))) {
            return Result.error("This list is private", "FAVORITE_LIST_PRIVATE");
        }

        // Initialize collections before mapping
        Hibernate.initialize(favoriteList.getItems());
        Hibernate.initialize(favoriteList.getLikes());

        return Result.success(favoriteListMapper.toDto(favoriteList, currentUser));
    }

    @Transactional(readOnly = true)
    public List<FavoriteListSummaryDto> getMyLists(User currentUser) {
        List<FavoriteList> lists = favoriteListRepository.findByOwnerOrderByCreatedAtDesc(currentUser);
        // Initialize collections before mapping to avoid lazy loading issues
        lists.forEach(list -> {
            Hibernate.initialize(list.getItems());
            Hibernate.initialize(list.getLikes());
        });
        return lists.stream()
            .map(favoriteListMapper::toSummaryDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FavoriteListSummaryDto> getUserPublicLists(Long userId) {
        List<FavoriteList> lists = favoriteListRepository.findPublicListsByOwnerId(userId);
        // Initialize collections before mapping to avoid lazy loading issues
        lists.forEach(list -> {
            Hibernate.initialize(list.getItems());
            Hibernate.initialize(list.getLikes());
        });
        return lists.stream()
            .map(favoriteListMapper::toSummaryDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<FavoriteListSummaryDto> getPopularLists(Pageable pageable) {
        return favoriteListRepository.findPopularPublicLists(pageable)
            .map(favoriteListMapper::toSummaryDto);
    }

    public Result<FavoriteListItemDto> addItemToList(User currentUser, Long listId, AddToListRequest request) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();
        Result<Void> ownershipResult = validateOwnership(favoriteList, currentUser);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        if (favoriteList.getItemCount() >= MAX_ITEMS_PER_LIST) {
            return Result.error("Maximum items per list reached (" + MAX_ITEMS_PER_LIST + ")", "FAVORITE_LIST_ITEM_LIMIT_EXCEEDED");
        }

        Listing listing = listingRepository.findById(request.getListingId())
            .orElse(null);

        if (listing == null) {
            return Result.error("Listing not found", "LISTING_NOT_FOUND");
        }

        if (favoriteListItemRepository.existsByFavoriteListAndListing(favoriteList, listing)) {
            return Result.error("Item already in list", "ITEM_ALREADY_IN_LIST");
        }

        FavoriteListItem item = FavoriteListItem.builder()
            .favoriteList(favoriteList)
            .listing(listing)
            .note(request.getNote())
            .build();

        item = favoriteListItemRepository.save(item);
        log.info("User {} added listing {} to list {}", currentUser.getId(), request.getListingId(), listId);

        return Result.success(favoriteListMapper.toItemDto(item));
    }

    public Result<Void> removeItemFromList(User currentUser, Long listId, UUID listingId) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();
        Result<Void> ownershipResult = validateOwnership(favoriteList, currentUser);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        FavoriteListItem item = favoriteListItemRepository.findByListIdAndListingId(listId, listingId)
            .orElse(null);

        if (item == null) {
            return Result.error("Item not in list", "ITEM_NOT_IN_LIST");
        }

        favoriteListItemRepository.delete(item);
        log.info("User {} removed listing {} from list {}", currentUser.getId(), listingId, listId);
        return Result.success();
    }

    public Result<Void> likeList(User currentUser, Long listId) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();

        if (!favoriteList.isPublic()) {
            return Result.error("Cannot like a private list", "CANNOT_LIKE_PRIVATE_LIST");
        }

        if (favoriteList.getOwner().getId().equals(currentUser.getId())) {
            return Result.error("Cannot like your own list", "CANNOT_LIKE_OWN_LIST");
        }

        if (favoriteListLikeRepository.existsByFavoriteListAndUser(favoriteList, currentUser)) {
            return Result.error("Already liked this list", "ALREADY_LIKED");
        }

        FavoriteListLike like = FavoriteListLike.builder()
            .favoriteList(favoriteList)
            .user(currentUser)
            .build();

        favoriteListLikeRepository.save(like);
        log.info("User {} liked list {}", currentUser.getId(), listId);
        return Result.success();
    }

    public Result<Void> unlikeList(User currentUser, Long listId) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();

        FavoriteListLike like = favoriteListLikeRepository.findByFavoriteListAndUser(favoriteList, currentUser)
            .orElse(null);

        if (like == null) {
            return Result.error("Not liked this list", "NOT_LIKED");
        }

        favoriteListLikeRepository.delete(like);
        log.info("User {} unliked list {}", currentUser.getId(), listId);
        return Result.success();
    }

    @Transactional(readOnly = true)
    public List<Long> getListIdsContainingListing(User currentUser, UUID listingId) {
        return favoriteListItemRepository.findListIdsByListingIdAndOwnerId(listingId, currentUser.getId());
    }

    @Transactional(readOnly = true)
    public boolean isListLikedByUser(Long listId, User user) {
        if (user == null) return false;
        return favoriteListLikeRepository.isLikedByUser(listId, user.getId());
    }

    private Result<FavoriteList> getListOrThrow(Long listId) {
        FavoriteList favoriteList = favoriteListRepository.findById(listId)
            .orElse(null);

        if (favoriteList == null) {
            return Result.error("List not found", "FAVORITE_LIST_NOT_FOUND");
        }

        return Result.success(favoriteList);
    }

    private Result<Void> validateOwnership(FavoriteList favoriteList, User currentUser) {
        if (!favoriteList.getOwner().getId().equals(currentUser.getId())) {
            return Result.error("You don't have permission to modify this list", "NOT_LIST_OWNER");
        }
        return Result.success();
    }
}

