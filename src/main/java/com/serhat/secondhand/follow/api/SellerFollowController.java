package com.serhat.secondhand.follow.api;

import com.serhat.secondhand.follow.dto.FollowStatsDto;
import com.serhat.secondhand.follow.dto.SellerFollowDto;
import com.serhat.secondhand.follow.service.SellerFollowService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class SellerFollowController {

    private final SellerFollowService sellerFollowService;

    @PostMapping("/{userId}")
    public ResponseEntity<?> follow(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId) {
        var result = sellerFollowService.follow(currentUser, userId);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> unfollow(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId) {
        var result = sellerFollowService.unfollow(currentUser, userId);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/notifications")
    public ResponseEntity<?> toggleNotifications(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId) {
        var result = sellerFollowService.toggleNotifications(currentUser, userId);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/following")
    public ResponseEntity<Page<SellerFollowDto>> getFollowing(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(sellerFollowService.getFollowing(currentUser, pageable));
    }

    @GetMapping("/followers")
    public ResponseEntity<Page<SellerFollowDto>> getFollowers(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(sellerFollowService.getFollowers(currentUser, pageable));
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<FollowStatsDto> getFollowStats(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(sellerFollowService.getFollowStats(userId, currentUser));
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<Boolean> checkFollowing(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId) {
        return ResponseEntity.ok(sellerFollowService.isFollowing(currentUser, userId));
    }

    @GetMapping("/user/{userId}/followers")
    public ResponseEntity<Page<SellerFollowDto>> getUserFollowers(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(sellerFollowService.getFollowersOfUser(userId, pageable));
    }

    @GetMapping("/user/{userId}/following")
    public ResponseEntity<Page<SellerFollowDto>> getUserFollowing(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(sellerFollowService.getFollowingOfUser(userId, pageable));
    }
}

