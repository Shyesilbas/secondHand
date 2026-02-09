package com.serhat.secondhand.user.api;

import com.serhat.secondhand.complaint.ComplaintDto;
import com.serhat.secondhand.complaint.ComplaintService;
import com.serhat.secondhand.core.audit.dto.AuditLogDto;
import com.serhat.secondhand.core.audit.service.AuditLogService;
import com.serhat.secondhand.core.verification.VerificationService;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.offer.service.OfferService;
import com.serhat.secondhand.review.service.ReviewService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.dto.UpdateEmailRequest;
import com.serhat.secondhand.user.domain.dto.UpdatePhoneRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.dto.VerificationRequest;
import com.serhat.secondhand.user.domain.entity.User;
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

    private final UserService userService;
    private final AuditLogService auditLogService;
    private final VerificationService verificationService;
    private final ReviewService reviewService;
    private final ListingService listingService;
    private final ComplaintService complaintService;
    private final OfferService offerService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        UserDto response = userService.getCurrentUserProfile(authentication);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/verification/send")
    public ResponseEntity<?> sendVerificationCode(Authentication authentication) {
        log.info("Sending verification code for user: {}", authentication.getName());
        var result = verificationService.sendAccountVerificationCode(authentication);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok().build();
    }


    @PostMapping("/verification/verify")
    public ResponseEntity<?> verifyUser(
            @Valid @RequestBody VerificationRequest request,
            Authentication authentication) {
        log.info("Verifying user account for: {}", authentication.getName());
        var result = verificationService.verifyUser(request, authentication);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/reviews/received")
    public ResponseEntity<?> getMyReceivedReviews(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        log.info("Getting reviews received by current user: {}", currentUser.getId());
        var result = reviewService.getReviewsForUser(currentUser.getId(), pageable);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/me/complaints")
    public ResponseEntity<java.util.List<ComplaintDto>> getMyComplaints(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(complaintService.getUserComplaints(currentUser));
    }

    @GetMapping("/me/complaints/received")
    public ResponseEntity<java.util.List<ComplaintDto>> getComplaintsAboutMe(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(complaintService.getComplaintsAboutUser(currentUser));
    }

    @GetMapping("/me/offers/made")
    public ResponseEntity<?> getMyOffersMade(
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(offerService.listMade(currentUser.getId(), pageable));
    }

    @GetMapping("/me/offers/received")
    public ResponseEntity<?> getMyOffersReceived(
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(offerService.listReceived(currentUser.getId(), pageable));
    }

    @GetMapping("/{userId}/reviews/received")
    public ResponseEntity<?> getReviewsReceivedByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        var result = reviewService.getReviewsForUser(userId, pageable);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/{userId}/reviews/written")
    public ResponseEntity<?> getReviewsWrittenByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        var result = reviewService.getReviewsByUser(userId, pageable);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/{userId}/review-stats")
    public ResponseEntity<?> getUserReviewStats(@PathVariable Long userId) {
        var result = reviewService.getUserReviewStats(userId);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/{userId}/listings")
    public ResponseEntity<Page<ListingDto>> getListingsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(listingService.getListingsByUser(userId, pageable.getPageNumber(), pageable.getPageSize()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        var result = userService.getById(id);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }


    @PutMapping("/email")
    public ResponseEntity<?> updateEmail(
            @Valid @RequestBody UpdateEmailRequest request,
            Authentication authentication) {
        log.info("Updating email for user: {}", authentication.getName());
        var result = userService.updateEmail(request, authentication);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }


    @PutMapping("/phone")
    public ResponseEntity<?> updatePhone(
            @Valid @RequestBody UpdatePhoneRequest request,
            Authentication authentication) {
        log.info("Updating phone for user: {}", authentication.getName());
        var result = userService.updatePhone(request, authentication);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
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