package com.serhat.secondhand.user.api;

import com.serhat.secondhand.complaint.ComplaintDto;
import com.serhat.secondhand.complaint.application.IComplaintService;
import com.serhat.secondhand.core.audit.dto.AuditLogDto;
import com.serhat.secondhand.core.audit.service.AuditLogService;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.core.verification.VerificationService;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.offer.application.IOfferService;
import com.serhat.secondhand.offer.dto.OfferDto;
import com.serhat.secondhand.review.application.IReviewService;
import com.serhat.secondhand.review.dto.ReviewDto;
import com.serhat.secondhand.review.dto.UserReviewStatsDto;
import com.serhat.secondhand.user.application.GreatSellerService;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.dto.BlockStatusDto;
import com.serhat.secondhand.user.domain.dto.BlockedUserDto;
import com.serhat.secondhand.user.domain.dto.GreatSellerPublicProfileDto;
import com.serhat.secondhand.user.domain.dto.GreatSellerStatusDto;
import com.serhat.secondhand.user.domain.dto.PublicUserProfileDto;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.UpdateUserSettingsRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.dto.UserSettingsDto;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.dto.RestrictionStatusDto;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.util.UserErrorCodes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "User profile and verification operations")
public class UserController {

    private final IUserService userService;
    private final AuditLogService auditLogService;
    private final VerificationService verificationService;
    private final IReviewService reviewService;
    private final ListingQueryService listingService;
    private final IComplaintService complaintService;
    private final IOfferService offerService;
    private final GreatSellerService greatSellerService;
    private final com.serhat.secondhand.user.application.UserRestrictionService userRestrictionService;
    private final com.serhat.secondhand.user.application.UserBlockService userBlockService;
    private final com.serhat.secondhand.user.application.UserSettingsService userSettingsService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        UserDto response = userService.getCurrentUserProfile(authentication);
        return ResponseEntity.ok(response);
    }

    @PublicEndpoint
    @GetMapping("/great-sellers")
    @Operation(summary = "Public list of Great Seller–eligible users (home discovery)")
    public ResponseEntity<List<GreatSellerPublicProfileDto>> listGreatSellerProfiles(@RequestParam(defaultValue = "16") int limit) {
        return ResultResponses.ok(Result.success(greatSellerService.listGreatSellerProfiles(limit)));
    }


    @PostMapping("/verification/send")
    public ResponseEntity<Void> sendVerificationCode(Authentication authentication) {
        log.info("Sending verification code for user: {}", authentication.getName());
        return ResultResponses.ok(verificationService.sendAccountVerificationCode(authentication));
    }


    @PostMapping("/verification/verify")
    public ResponseEntity<Void> verifyUser(
            @Valid @RequestBody VerificationRequest request,
            Authentication authentication) {
        log.info("Verifying user account for: {}", authentication.getName());
        return ResultResponses.ok(verificationService.verifyUser(request, authentication));
    }

    @GetMapping("/me/reviews/received")
    public ResponseEntity<Page<ReviewDto>> getMyReceivedReviews(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        log.info("Getting reviews received by current user: {}", currentUser.getId());
        return ResultResponses.ok(reviewService.getReviewsForUser(currentUser.getId(), pageable));
    }

    @GetMapping("/me/complaints")
    public ResponseEntity<List<ComplaintDto>> getMyComplaints(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(complaintService.getUserComplaints(currentUser));
    }

    @GetMapping("/me/restriction")
    public ResponseEntity<RestrictionStatusDto> getMyRestriction(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userRestrictionService.status(currentUser.getId()));
    }

    @GetMapping("/me/settings")
    public ResponseEntity<UserSettingsDto> getMySettings(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userSettingsService.getSettings(currentUser.getId()));
    }

    @PatchMapping("/me/settings")
    public ResponseEntity<UserSettingsDto> updateMySettings(
            @Valid @RequestBody UpdateUserSettingsRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userSettingsService.updateSettings(currentUser.getId(), request));
    }

    @GetMapping("/me/blocked-users")
    public ResponseEntity<List<BlockedUserDto>> getMyBlockedUsers(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userBlockService.getBlockedUsers(currentUser.getId()));
    }

    @PostMapping("/{user-id}/block")
    public ResponseEntity<BlockStatusDto> blockUser(@PathVariable("user-id") Long userId,
                                       @AuthenticationPrincipal User currentUser) {
        userBlockService.blockUser(currentUser.getId(), userId);
        return ResponseEntity.ok(userBlockService.getBlockStatus(currentUser.getId(), userId));
    }

    @DeleteMapping("/{user-id}/block")
    public ResponseEntity<BlockStatusDto> unblockUser(@PathVariable("user-id") Long userId,
                                         @AuthenticationPrincipal User currentUser) {
        userBlockService.unblockUser(currentUser.getId(), userId);
        return ResponseEntity.ok(userBlockService.getBlockStatus(currentUser.getId(), userId));
    }

    @GetMapping("/{user-id}/block-status")
    public ResponseEntity<BlockStatusDto> getBlockStatus(@PathVariable("user-id") Long userId,
                                            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userBlockService.getBlockStatus(currentUser.getId(), userId));
    }

    @GetMapping("/me/complaints/received")
    public ResponseEntity<List<ComplaintDto>> getComplaintsAboutMe(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(complaintService.getComplaintsAboutUser(currentUser));
    }

    @GetMapping("/me/offers/made")
    public ResponseEntity<Page<OfferDto>> getMyOffersMade(
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(offerService.listMade(currentUser.getId(), pageable));
    }

    @GetMapping("/me/offers/received")
    public ResponseEntity<Page<OfferDto>> getMyOffersReceived(
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(offerService.listReceived(currentUser.getId(), pageable));
    }

    @PublicEndpoint
    @GetMapping("/{user-id}/great-seller-status")
    @Operation(summary = "Great Seller badge eligibility and progress")
    public ResponseEntity<GreatSellerStatusDto> getGreatSellerStatus(@PathVariable("user-id") Long userId) {
        return ResultResponses.ok(Result.success(greatSellerService.getStatus(userId)));
    }

    @GetMapping("/{user-id}/reviews/received")
    public ResponseEntity<Page<ReviewDto>> getReviewsReceivedByUser(
            @PathVariable("user-id") Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResultResponses.ok(reviewService.getReviewsForUser(userId, pageable));
    }

    @GetMapping("/{user-id}/reviews/written")
    public ResponseEntity<Page<ReviewDto>> getReviewsWrittenByUser(
            @PathVariable("user-id") Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResultResponses.ok(reviewService.getReviewsByUser(userId, pageable));
    }

    @GetMapping("/{user-id}/review-stats")
    public ResponseEntity<UserReviewStatsDto> getUserReviewStats(@PathVariable("user-id") Long userId) {
        return ResultResponses.ok(reviewService.getUserReviewStats(userId));
    }

    @GetMapping("/{user-id}/listings")
    public ResponseEntity<Page<ListingDto>> getListingsByUser(
            @PathVariable("user-id") Long userId,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser != null) {
            ResultResponses.unwrap(userBlockService.checkProfileAccess(currentUser.getId(), userId));
        }
        // Public profile: only listings that are live for buyers (no drafts, inactive or sold ones).
        return ResponseEntity.ok(listingService.getMyListingsByStatus(
                userId, ListingStatus.ACTIVE, pageable.getPageNumber(), pageable.getPageSize()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicUserProfileDto> getUserById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (userBlockService.getBlockStatus(currentUser.getId(), id).blockedMe()) {
            throw ResultResponses.fail(UserErrorCodes.USER_BLOCKED_YOU);
        }
        return ResultResponses.ok(userService.getPublicProfile(id));
    }


    @PutMapping("/email")
    public ResponseEntity<String> updateEmail(
            @Valid @RequestBody UpdateEmailRequest request,
            Authentication authentication) {
        log.info("Updating email for user: {}", authentication.getName());
        return ResultResponses.ok(userService.updateEmail(request, authentication));
    }


    @PutMapping("/phone")
    public ResponseEntity<String> updatePhone(
            @Valid @RequestBody UpdatePhoneRequest request,
            Authentication authentication) {
        log.info("Updating phone for user: {}", authentication.getName());
        return ResultResponses.ok(userService.updatePhone(request, authentication));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Searching users with query: {} and limit: {}", query, limit);
        List<UserDto> response = userService.searchUsers(query, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get user audit logs", description = "Retrieve paginated audit logs for the authenticated user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<AuditLogDto>> getMyAuditLogs(
            Authentication authentication,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        log.info("Getting audit logs for user: {} with page: {}, size: {}", authentication.getName(), pageable.getPageNumber(), pageable.getPageSize());
        Page<AuditLogDto> auditLogs = auditLogService.getUserAuditLogs(authentication.getName(), pageable);
        return ResponseEntity.ok(auditLogs);
    }
}