package com.serhat.secondhand.favoritelist.service;

import com.serhat.secondhand.core.exception.BusinessException;
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
import org.springframework.http.HttpStatus;
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

    public FavoriteListDto createList(User currentUser, CreateFavoriteListRequest request) {
        long userListCount = favoriteListRepository.countByOwner(currentUser);
        if (userListCount >= MAX_LISTS_PER_USER) {
            throw new BusinessException(
                "Maximum list limit reached (" + MAX_LISTS_PER_USER + ")",
                HttpStatus.BAD_REQUEST,
                "FAVORITE_LIST_LIMIT_EXCEEDED"
            );
        }

        if (favoriteListRepository.existsByOwnerAndName(currentUser, request.getName())) {
            throw new BusinessException(
                "A list with this name already exists",
                HttpStatus.BAD_REQUEST,
                "FAVORITE_LIST_NAME_EXISTS"
            );
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

        return favoriteListMapper.toDto(favoriteList, currentUser);
    }

    public FavoriteListDto updateList(User currentUser, Long listId, UpdateFavoriteListRequest request) {
        FavoriteList favoriteList = getListOrThrow(listId);
        validateOwnership(favoriteList, currentUser);

        if (request.getName() != null && !request.getName().equals(favoriteList.getName())) {
            if (favoriteListRepository.existsByOwnerAndName(currentUser, request.getName())) {
                throw new BusinessException(
                    "A list with this name already exists",
                    HttpStatus.BAD_REQUEST,
                    "FAVORITE_LIST_NAME_EXISTS"
                );
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

        return favoriteListMapper.toDto(favoriteList, currentUser);
    }

    public void deleteList(User currentUser, Long listId) {
        FavoriteList favoriteList = getListOrThrow(listId);
        validateOwnership(favoriteList, currentUser);

        favoriteListRepository.delete(favoriteList);
        log.info("User {} deleted favorite list: {}", currentUser.getId(), listId);
    }

    @Transactional(readOnly = true)
    public FavoriteListDto getListById(Long listId, User currentUser) {
        FavoriteList favoriteList = favoriteListRepository.findById(listId)
            .orElseThrow(() -> new BusinessException(
                "List not found",
                HttpStatus.NOT_FOUND,
                "FAVORITE_LIST_NOT_FOUND"
            ));

        if (!favoriteList.isPublic() && (currentUser == null || !favoriteList.getOwner().getId().equals(currentUser.getId()))) {
            throw new BusinessException(
                "This list is private",
                HttpStatus.FORBIDDEN,
                "FAVORITE_LIST_PRIVATE"
            );
        }

        // Initialize collections before mapping
        Hibernate.initialize(favoriteList.getItems());
        Hibernate.initialize(favoriteList.getLikes());

        return favoriteListMapper.toDto(favoriteList, currentUser);
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

    public FavoriteListItemDto addItemToList(User currentUser, Long listId, AddToListRequest request) {
        FavoriteList favoriteList = getListOrThrow(listId);
        validateOwnership(favoriteList, currentUser);

        if (favoriteList.getItemCount() >= MAX_ITEMS_PER_LIST) {
            throw new BusinessException(
                "Maximum items per list reached (" + MAX_ITEMS_PER_LIST + ")",
                HttpStatus.BAD_REQUEST,
                "FAVORITE_LIST_ITEM_LIMIT_EXCEEDED"
            );
        }

        Listing listing = listingRepository.findById(request.getListingId())
            .orElseThrow(() -> new BusinessException(
                "Listing not found",
                HttpStatus.NOT_FOUND,
                "LISTING_NOT_FOUND"
            ));

        if (favoriteListItemRepository.existsByFavoriteListAndListing(favoriteList, listing)) {
            throw new BusinessException(
                "Item already in list",
                HttpStatus.BAD_REQUEST,
                "ITEM_ALREADY_IN_LIST"
            );
        }

        FavoriteListItem item = FavoriteListItem.builder()
            .favoriteList(favoriteList)
            .listing(listing)
            .note(request.getNote())
            .build();

        item = favoriteListItemRepository.save(item);
        log.info("User {} added listing {} to list {}", currentUser.getId(), request.getListingId(), listId);

        return favoriteListMapper.toItemDto(item);
    }

    public void removeItemFromList(User currentUser, Long listId, UUID listingId) {
        FavoriteList favoriteList = getListOrThrow(listId);
        validateOwnership(favoriteList, currentUser);

        FavoriteListItem item = favoriteListItemRepository.findByListIdAndListingId(listId, listingId)
            .orElseThrow(() -> new BusinessException(
                "Item not in list",
                HttpStatus.NOT_FOUND,
                "ITEM_NOT_IN_LIST"
            ));

        favoriteListItemRepository.delete(item);
        log.info("User {} removed listing {} from list {}", currentUser.getId(), listingId, listId);
    }

    public void likeList(User currentUser, Long listId) {
        FavoriteList favoriteList = getListOrThrow(listId);

        if (!favoriteList.isPublic()) {
            throw new BusinessException(
                "Cannot like a private list",
                HttpStatus.BAD_REQUEST,
                "CANNOT_LIKE_PRIVATE_LIST"
            );
        }

        if (favoriteList.getOwner().getId().equals(currentUser.getId())) {
            throw new BusinessException(
                "Cannot like your own list",
                HttpStatus.BAD_REQUEST,
                "CANNOT_LIKE_OWN_LIST"
            );
        }

        if (favoriteListLikeRepository.existsByFavoriteListAndUser(favoriteList, currentUser)) {
            throw new BusinessException(
                "Already liked this list",
                HttpStatus.BAD_REQUEST,
                "ALREADY_LIKED"
            );
        }

        FavoriteListLike like = FavoriteListLike.builder()
            .favoriteList(favoriteList)
            .user(currentUser)
            .build();

        favoriteListLikeRepository.save(like);
        log.info("User {} liked list {}", currentUser.getId(), listId);
    }

    public void unlikeList(User currentUser, Long listId) {
        FavoriteList favoriteList = getListOrThrow(listId);

        FavoriteListLike like = favoriteListLikeRepository.findByFavoriteListAndUser(favoriteList, currentUser)
            .orElseThrow(() -> new BusinessException(
                "Not liked this list",
                HttpStatus.BAD_REQUEST,
                "NOT_LIKED"
            ));

        favoriteListLikeRepository.delete(like);
        log.info("User {} unliked list {}", currentUser.getId(), listId);
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

    private FavoriteList getListOrThrow(Long listId) {
        return favoriteListRepository.findById(listId)
            .orElseThrow(() -> new BusinessException(
                "List not found",
                HttpStatus.NOT_FOUND,
                "FAVORITE_LIST_NOT_FOUND"
            ));
    }

    private void validateOwnership(FavoriteList favoriteList, User currentUser) {
        if (!favoriteList.getOwner().getId().equals(currentUser.getId())) {
            throw new BusinessException(
                "You don't have permission to modify this list",
                HttpStatus.FORBIDDEN,
                "NOT_LIST_OWNER"
            );
        }
    }
}

