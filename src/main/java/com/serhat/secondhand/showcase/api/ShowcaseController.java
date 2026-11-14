package com.serhat.secondhand.showcase.api;

import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.showcase.ShowcaseMapper;
import com.serhat.secondhand.showcase.application.IShowcaseService;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import com.serhat.secondhand.showcase.dto.ShowcaseQuoteDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/v1/showcases")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Showcase", description = "Showcase operations")
public class ShowcaseController {

    private final IShowcaseService showcaseService;
    private final ShowcaseMapper showcaseMapper;
    private final ShowcaseConfig showcaseConfig;

    @PostMapping
    public ResponseEntity<ShowcaseDto> createShowcase(
            @Valid @RequestBody ShowcasePaymentRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Request to create showcase for user: {} and listing {}",
                currentUser.getId(), request.listingId());

        var showcase = ResultResponses.unwrap(showcaseService.createShowcase(currentUser.getId(), request));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(showcaseMapper.toDto(showcase));
    }

    @PublicEndpoint
    @GetMapping("/active")
    public ResponseEntity<Page<ShowcaseDto>> getActiveShowcases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer size,
            @AuthenticationPrincipal User user) {
        int resolvedSize = (size != null && size > 0)
                ? size
                : (showcaseConfig.getActiveListDefaultSize() != null ? showcaseConfig.getActiveListDefaultSize() : 12);
        Pageable pageable = PageRequest.of(Math.max(page, 0), resolvedSize);
        return ResponseEntity.ok(showcaseService.getActiveShowcases(pageable.getPageNumber(), pageable.getPageSize(),
                user != null ? user.getId() : null));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ShowcaseDto>> getUserShowcases(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(showcaseService.getUserShowcases(user.getId()));
    }

    @PostMapping("/{id}/extend")
    public ResponseEntity<Void> extendShowcase(
            @PathVariable UUID id,
            @Valid @RequestBody ShowcasePaymentRequest request,
            @AuthenticationPrincipal User user) {
        return ResultResponses.noContent(showcaseService.extendShowcase(user.getId(), id, request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelShowcase(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResultResponses.noContent(showcaseService.cancelShowcase(user.getId(), id));
    }

    @GetMapping("/quotes")
    public ResponseEntity<List<ShowcaseQuoteDto>> getShowcaseQuotes(
            @RequestParam("days") List<Integer> days,
            @AuthenticationPrincipal User user) {
        return ResultResponses.ok(showcaseService.getShowcaseQuotes(user.getId(), days));
    }

    @PublicEndpoint
    @GetMapping("/pricing-config")
    public ResponseEntity<ShowcasePricingDto> getShowcasePricingConfig() {
        return ResponseEntity.ok(showcaseService.getShowcasePricingConfig());
    }
}
