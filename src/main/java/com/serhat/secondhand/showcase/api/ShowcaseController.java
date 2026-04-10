package com.serhat.secondhand.showcase.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.showcase.application.IShowcaseService;
import com.serhat.secondhand.showcase.ShowcaseMapper;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/showcases")
@RequiredArgsConstructor
@Slf4j
public class ShowcaseController {

    private final IShowcaseService showcaseService;
    private final ShowcaseMapper showcaseMapper;
    private final ShowcaseConfig showcaseConfig;

    @PostMapping
    public ResponseEntity<?> createShowcase(
            @Valid @RequestBody ShowcasePaymentRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Request to create showcase for user: {} and listing {}",
                currentUser.getId(), request.listingId());

        var result = showcaseService.createShowcase(currentUser.getId(), request);

        if (result.isError()) {
            return ResultResponses.ok(result);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(showcaseMapper.toDto(result.getData()));
    }

    @GetMapping("/active")
    public ResponseEntity<Page<ShowcaseDto>> getActiveShowcases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size) {
        int resolvedSize = (size != null && size > 0)
                ? size
                : (showcaseConfig.getActiveListDefaultSize() != null ? showcaseConfig.getActiveListDefaultSize() : 12);
        Pageable pageable = PageRequest.of(Math.max(page, 0), resolvedSize);
        return ResponseEntity.ok(showcaseService.getActiveShowcases(pageable));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ShowcaseDto>> getUserShowcases(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(showcaseService.getUserShowcases(user.getId()));
    }

    @PostMapping("/{id}/extend")
    public ResponseEntity<?> extendShowcase(
            @PathVariable UUID id,
            @RequestParam int days,
            @AuthenticationPrincipal User user) {
        return ResultResponses.noContent(showcaseService.extendShowcase(user.getId(), id, days));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelShowcase(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResultResponses.noContent(showcaseService.cancelShowcase(user.getId(), id));
    }

    @GetMapping("/pricing-config")
    public ResponseEntity<ShowcasePricingDto> getShowcasePricingConfig() {
        return ResponseEntity.ok(showcaseService.getShowcasePricingConfig());
    }
}
