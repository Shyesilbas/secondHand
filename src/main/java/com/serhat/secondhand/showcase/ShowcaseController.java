package com.serhat.secondhand.showcase;

import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/showcases")
@RequiredArgsConstructor
public class ShowcaseController {
    
    private final ShowcaseService showcaseService;
    private final ShowcaseMapper showcaseMapper;
    
    @PostMapping
    public ResponseEntity<?> createShowcase(
            @RequestBody ShowcasePaymentRequest request,
            Authentication authentication) {
        
        var result = showcaseService.createShowcase(request, authentication);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(showcaseMapper.toDto(result.getData()));
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<ShowcaseDto>> getActiveShowcases() {
        return ResponseEntity.ok(showcaseService.getActiveShowcases());
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
        
        var result = showcaseService.extendShowcase(id, days);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelShowcase(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        
        var result = showcaseService.cancelShowcase(id);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/pricing-config")
    public ResponseEntity<ShowcasePricingDto> getShowcasePricingConfig() {
        ShowcasePricingDto config = showcaseService.getShowcasePricingConfig();
        return ResponseEntity.ok(config);
    }
}
