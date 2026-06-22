package com.serhat.secondhand.favoritelist.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.favoritelist.application.FavoriteListService;
import com.serhat.secondhand.favoritelist.config.FavoriteListConfig;
import com.serhat.secondhand.favoritelist.dto.AddToListRequest;
import com.serhat.secondhand.favoritelist.dto.CreateFavoriteListRequest;
import com.serhat.secondhand.favoritelist.dto.FavoriteListSummaryDto;
import com.serhat.secondhand.favoritelist.dto.UpdateFavoriteListRequest;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/favorite-lists")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Favorite Lists", description = "Operations for managing favorite listing collections")
public class FavoriteListController {

    private final FavoriteListService favoriteListService;
    private final FavoriteListConfig favoriteListConfig;

    @PostMapping
    @Operation(summary = "Create a new favorite list")
    public ResponseEntity<?> createList(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateFavoriteListRequest request) {
        return ResultResponses.created(favoriteListService.createList(currentUser.getId(), request));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's favorite lists")
    public ResponseEntity<Page<FavoriteListSummaryDto>> getMyLists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size,
            @AuthenticationPrincipal User currentUser) {
        int resolvedSize = resolveSize(size, favoriteListConfig.getMyListsDefaultSize());
        Pageable pageable = PageRequest.of(page, resolvedSize, Sort.by("createdAt").descending());
        Page<FavoriteListSummaryDto> lists = favoriteListService.getMyLists(currentUser.getId(), pageable);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/user/{user-id}")
    @Operation(summary = "Get a user's public favorite lists")
    public ResponseEntity<Page<FavoriteListSummaryDto>> getUserPublicLists(
            @PathVariable("user-id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size) {
        int resolvedSize = resolveSize(size, favoriteListConfig.getUserPublicListsDefaultSize());
        Pageable pageable = PageRequest.of(page, resolvedSize, Sort.by("createdAt").descending());
        Page<FavoriteListSummaryDto> lists = favoriteListService.getUserPublicLists(userId, pageable);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular public favorite lists")
    public ResponseEntity<Page<FavoriteListSummaryDto>> getPopularLists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size) {
        int resolvedSize = resolveSize(size, favoriteListConfig.getPopularDefaultSize());
        Pageable pageable = PageRequest.of(page, resolvedSize);
        Page<FavoriteListSummaryDto> lists = favoriteListService.getPopularLists(pageable);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/{list-id}")
    @Operation(summary = "Get a favorite list by ID")
    public ResponseEntity<?> getListById(
            @PathVariable("list-id") Long listId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(favoriteListService.getListById(listId, currentUser));
    }

    @PutMapping("/{list-id}")
    @Operation(summary = "Update a favorite list")
    public ResponseEntity<?> updateList(
            @PathVariable("list-id") Long listId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateFavoriteListRequest request) {
        return ResultResponses.ok(favoriteListService.updateList(currentUser.getId(), listId, request));
    }

    @DeleteMapping("/{list-id}")
    @Operation(summary = "Delete a favorite list")
    public ResponseEntity<?> deleteList(
            @PathVariable("list-id") Long listId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(favoriteListService.deleteList(currentUser.getId(), listId));
    }

    @PostMapping("/{list-id}/items")
    @Operation(summary = "Add an item to a favorite list")
    public ResponseEntity<?> addItemToList(
            @PathVariable("list-id") Long listId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AddToListRequest request) {
        return ResultResponses.created(favoriteListService.addItemToList(currentUser.getId(), listId, request));
    }

    @DeleteMapping("/{list-id}/items/{listing-id}")
    @Operation(summary = "Remove an item from a favorite list")
    public ResponseEntity<?> removeItemFromList(
            @PathVariable("list-id") Long listId,
            @PathVariable("listing-id") UUID listingId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(favoriteListService.removeItemFromList(currentUser.getId(), listId, listingId));
    }

    @PostMapping("/{list-id}/like")
    @Operation(summary = "Like a favorite list")
    public ResponseEntity<?> likeList(
            @PathVariable("list-id") Long listId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.ok(favoriteListService.likeList(currentUser.getId(), listId));
    }

    @DeleteMapping("/{list-id}/like")
    @Operation(summary = "Unlike a favorite list")
    public ResponseEntity<?> unlikeList(
            @PathVariable("list-id") Long listId,
            @AuthenticationPrincipal User currentUser) {
        return ResultResponses.noContent(favoriteListService.unlikeList(currentUser.getId(), listId));
    }

    @GetMapping("/listing/{listing-id}/lists")
    @Operation(summary = "Get list IDs containing a specific listing for current user")
    public ResponseEntity<Map<String, List<Long>>> getListsContainingListing(
            @PathVariable("listing-id") UUID listingId,
            @AuthenticationPrincipal User currentUser) {
        List<Long> listIds = favoriteListService.getListIdsContainingListing(currentUser.getId(), listingId);
        return ResponseEntity.ok(Map.of("listIds", listIds));
    }

    private int resolveSize(Integer requestedSize, int defaultSize) {
        if (requestedSize == null || requestedSize < 1) {
            return defaultSize;
        }
        return requestedSize;
    }
}
