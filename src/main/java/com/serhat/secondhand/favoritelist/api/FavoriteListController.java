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
    public ResponseEntity<?> createList(
            Authentication authentication,
            @Valid @RequestBody CreateFavoriteListRequest request) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        var result = favoriteListService.createList(currentUser, request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result.getData());
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
    public ResponseEntity<?> getListById(
            @PathVariable Long listId,
            Authentication authentication) {
        User currentUser = authentication != null ? userService.getAuthenticatedUser(authentication) : null;
        var result = favoriteListService.getListById(listId, currentUser);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @PutMapping("/{listId}")
    @Operation(summary = "Update a favorite list")
    public ResponseEntity<?> updateList(
            @PathVariable Long listId,
            Authentication authentication,
            @Valid @RequestBody UpdateFavoriteListRequest request) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        var result = favoriteListService.updateList(currentUser, listId, request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @DeleteMapping("/{listId}")
    @Operation(summary = "Delete a favorite list")
    public ResponseEntity<?> deleteList(
            @PathVariable Long listId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        var result = favoriteListService.deleteList(currentUser, listId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{listId}/items")
    @Operation(summary = "Add an item to a favorite list")
    public ResponseEntity<?> addItemToList(
            @PathVariable Long listId,
            Authentication authentication,
            @Valid @RequestBody AddToListRequest request) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        var result = favoriteListService.addItemToList(currentUser, listId, request);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result.getData());
    }

    @DeleteMapping("/{listId}/items/{listingId}")
    @Operation(summary = "Remove an item from a favorite list")
    public ResponseEntity<?> removeItemFromList(
            @PathVariable Long listId,
            @PathVariable UUID listingId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        var result = favoriteListService.removeItemFromList(currentUser, listId, listingId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{listId}/like")
    @Operation(summary = "Like a favorite list")
    public ResponseEntity<?> likeList(
            @PathVariable Long listId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        var result = favoriteListService.likeList(currentUser, listId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{listId}/like")
    @Operation(summary = "Unlike a favorite list")
    public ResponseEntity<?> unlikeList(
            @PathVariable Long listId,
            Authentication authentication) {
        User currentUser = userService.getAuthenticatedUser(authentication);
        var result = favoriteListService.unlikeList(currentUser, listId);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
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

