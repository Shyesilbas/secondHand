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
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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
    private final IUserService userService;

    private static final int MAX_LISTS_PER_USER = 20;
    private static final int MAX_ITEMS_PER_LIST = 100;

    public Result<FavoriteListDto> createList(Long userId, CreateFavoriteListRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User currentUser = userResult.getData();

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

    public Result<FavoriteListDto> updateList(Long userId, Long listId, UpdateFavoriteListRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User currentUser = userResult.getData();
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();
        Result<Void> ownershipResult = validateOwnership(favoriteList, currentUser.getId());
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

    public Result<Void> deleteList(Long userId, Long listId) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();
        Result<Void> ownershipResult = validateOwnership(favoriteList, userId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        favoriteListRepository.delete(favoriteList);
        log.info("User {} deleted favorite list: {}", userId, listId);
        return Result.success();
    }

    @Transactional(readOnly = true)
    public Result<FavoriteListDto> getListById(Long listId, User currentUser) {
        FavoriteList favoriteList = favoriteListRepository.findByIdWithDetails(listId)
                .orElse(null);

        if (favoriteList == null) {
            return Result.error("List not found", "FAVORITE_LIST_NOT_FOUND");
        }

        if (!favoriteList.isPublic() && (currentUser == null || !favoriteList.getOwner().getId().equals(currentUser.getId()))) {
            return Result.error("This list is private", "FAVORITE_LIST_PRIVATE");
        }

        return Result.success(favoriteListMapper.toDto(favoriteList, currentUser));
    }

    @Transactional(readOnly = true)
    public Page<FavoriteListSummaryDto> getMyLists(Long userId, Pageable pageable) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Page.empty(pageable);
        }
        User currentUser = userResult.getData();

        Page<FavoriteList> lists = favoriteListRepository.findByOwnerWithDetails(currentUser, pageable);

        return lists.map(favoriteListMapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public Page<FavoriteListSummaryDto> getUserPublicLists(Long userId, Pageable pageable) {
        Page<FavoriteList> lists = favoriteListRepository.findPublicByOwnerIdWithDetails(userId, pageable);
        return lists.map(favoriteListMapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public Page<FavoriteListSummaryDto> getPopularLists(Pageable pageable) {
        return favoriteListRepository.findPopularPublicLists(pageable)
            .map(favoriteListMapper::toSummaryDto);
    }

    public Result<FavoriteListItemDto> addItemToList(Long userId, Long listId, AddToListRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User currentUser = userResult.getData();
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();
        Result<Void> ownershipResult = validateOwnership(favoriteList, currentUser.getId());
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

    public Result<Void> removeItemFromList(Long userId, Long listId, UUID listingId) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();
        Result<Void> ownershipResult = validateOwnership(favoriteList, userId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        FavoriteListItem item = favoriteListItemRepository.findByListIdAndListingId(listId, listingId)
            .orElse(null);

        if (item == null) {
            return Result.error("Item not in list", "ITEM_NOT_IN_LIST");
        }

        favoriteListItemRepository.delete(item);
        log.info("User {} removed listing {} from list {}", userId, listingId, listId);
        return Result.success();
    }

    public Result<Void> likeList(Long userId, Long listId) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();

        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User currentUser = userResult.getData();

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

    public Result<Void> unlikeList(Long userId, Long listId) {
        Result<FavoriteList> listResult = getListOrThrow(listId);
        if (listResult.isError()) {
            return Result.error(listResult.getMessage(), listResult.getErrorCode());
        }

        FavoriteList favoriteList = listResult.getData();

        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User currentUser = userResult.getData();

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
    public List<Long> getListIdsContainingListing(Long userId, UUID listingId) {
        return favoriteListItemRepository.findListIdsByListingIdAndOwnerId(listingId, userId);
    }


    private Result<FavoriteList> getListOrThrow(Long listId) {
        FavoriteList favoriteList = favoriteListRepository.findById(listId)
            .orElse(null);

        if (favoriteList == null) {
            return Result.error("List not found", "FAVORITE_LIST_NOT_FOUND");
        }

        return Result.success(favoriteList);
    }

    private Result<Void> validateOwnership(FavoriteList favoriteList, Long userId) {
        if (!favoriteList.getOwner().getId().equals(userId)) {
            return Result.error("You don't have permission to modify this list", "NOT_LIST_OWNER");
        }
        return Result.success();
    }
}

