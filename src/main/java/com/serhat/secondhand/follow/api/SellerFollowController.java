package com.serhat.secondhand.follow.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.follow.application.SellerFollowService;
import com.serhat.secondhand.follow.dto.FollowStatsDto;
import com.serhat.secondhand.follow.dto.SellerFollowDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/follows")
@RequiredArgsConstructor
@Tag(name = "Seller Follow", description = "Seller Follow operations")
public class SellerFollowController {

    private final SellerFollowService sellerFollowService;

    @PostMapping("/{user-id}")
    public ResponseEntity<?> follow(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("user-id") Long userId) {
        return ResultResponses.ok(sellerFollowService.follow(currentUser, userId));
    }

    @DeleteMapping("/{user-id}")
    public ResponseEntity<?> unfollow(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("user-id") Long userId) {
        return ResultResponses.noContent(sellerFollowService.unfollow(currentUser, userId));
    }

    @PatchMapping("/{user-id}/notifications")
    public ResponseEntity<?> toggleNotifications(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("user-id") Long userId) {
        return ResultResponses.ok(sellerFollowService.toggleNotifications(currentUser, userId));
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

    @GetMapping("/stats/{user-id}")
    public ResponseEntity<FollowStatsDto> getFollowStats(
            @PathVariable("user-id") Long userId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(sellerFollowService.getFollowStats(userId, currentUser));
    }

    @GetMapping("/check/{user-id}")
    public ResponseEntity<Boolean> checkFollowing(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("user-id") Long userId) {
        return ResponseEntity.ok(sellerFollowService.isFollowing(currentUser, userId));
    }

    @GetMapping("/user/{user-id}/followers")
    public ResponseEntity<Page<SellerFollowDto>> getUserFollowers(
            @PathVariable("user-id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(sellerFollowService.getFollowersOfUser(userId, pageable));
    }

    @GetMapping("/user/{user-id}/following")
    public ResponseEntity<Page<SellerFollowDto>> getUserFollowing(
            @PathVariable("user-id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(sellerFollowService.getFollowingOfUser(userId, pageable));
    }
}

