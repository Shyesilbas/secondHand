package com.serhat.secondhand.favoritelist.api;

import com.serhat.secondhand.favoritelist.dto.*;
import com.serhat.secondhand.favoritelist.service.FavoriteListService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorite-lists")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Favorite Lists", description = "Operations for managing favorite listing collections")
public class FavoriteListController {

    private final FavoriteListService favoriteListService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new favorite list")
    public ResponseEntity<FavoriteListDto> createList(
            Authentication authentication,
            @Valid @RequestBody CreateFavoriteListRequest request) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        FavoriteListDto list = favoriteListService.createList(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(list);
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's favorite lists")
    public ResponseEntity<List<FavoriteListSummaryDto>> getMyLists(Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        List<FavoriteListSummaryDto> lists = favoriteListService.getMyLists(currentUser);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get a user's public favorite lists")
    public ResponseEntity<List<FavoriteListSummaryDto>> getUserPublicLists(@PathVariable Long userId) {
        List<FavoriteListSummaryDto> lists = favoriteListService.getUserPublicLists(userId);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular public favorite lists")
    public ResponseEntity<Page<FavoriteListSummaryDto>> getPopularLists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FavoriteListSummaryDto> lists = favoriteListService.getPopularLists(pageable);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/{listId}")
    @Operation(summary = "Get a favorite list by ID")
    public ResponseEntity<FavoriteListDto> getListById(
            @PathVariable Long listId,
            Authentication authentication) {
        User currentUser = authentication != null ? userService.getAuthenticatedUser(authentication) : null;
        FavoriteListDto list = favoriteListService.getListById(listId, currentUser);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{listId}")
    @Operation(summary = "Update a favorite list")
    public ResponseEntity<FavoriteListDto> updateList(
            @PathVariable Long listId,
            Authentication authentication,
            @Valid @RequestBody UpdateFavoriteListRequest request) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        FavoriteListDto list = favoriteListService.updateList(currentUser, listId, request);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{listId}")
    @Operation(summary = "Delete a favorite list")
    public ResponseEntity<Void> deleteList(
            @PathVariable Long listId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        favoriteListService.deleteList(currentUser, listId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{listId}/items")
    @Operation(summary = "Add an item to a favorite list")
    public ResponseEntity<FavoriteListItemDto> addItemToList(
            @PathVariable Long listId,
            Authentication authentication,
            @Valid @RequestBody AddToListRequest request) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        FavoriteListItemDto item = favoriteListService.addItemToList(currentUser, listId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @DeleteMapping("/{listId}/items/{listingId}")
    @Operation(summary = "Remove an item from a favorite list")
    public ResponseEntity<Void> removeItemFromList(
            @PathVariable Long listId,
            @PathVariable UUID listingId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        favoriteListService.removeItemFromList(currentUser, listId, listingId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{listId}/like")
    @Operation(summary = "Like a favorite list")
    public ResponseEntity<Void> likeList(
            @PathVariable Long listId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        favoriteListService.likeList(currentUser, listId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{listId}/like")
    @Operation(summary = "Unlike a favorite list")
    public ResponseEntity<Void> unlikeList(
            @PathVariable Long listId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        favoriteListService.unlikeList(currentUser, listId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/listing/{listingId}/lists")
    @Operation(summary = "Get list IDs containing a specific listing for current user")
    public ResponseEntity<Map<String, List<Long>>> getListsContainingListing(
            @PathVariable UUID listingId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        List<Long> listIds = favoriteListService.getListIdsContainingListing(currentUser, listingId);
        return ResponseEntity.ok(Map.of("listIds", listIds));
    }
}

