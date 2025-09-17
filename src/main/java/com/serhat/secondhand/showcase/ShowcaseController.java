package com.serhat.secondhand.showcase;

import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
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
    public ResponseEntity<ShowcaseDto> createShowcase(
            @RequestBody ShowcasePaymentRequest request,
            Authentication authentication) {
        
        Showcase showcase = showcaseService.createShowcase(request, authentication);
        return ResponseEntity.ok(showcaseMapper.toDto(showcase));
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
    public ResponseEntity<Showcase> extendShowcase(
            @PathVariable UUID id,
            @RequestParam int days,
            @AuthenticationPrincipal User user) {
        
        showcaseService.extendShowcase(id, days);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelShowcase(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        
        showcaseService.cancelShowcase(id);
        return ResponseEntity.ok().build();
    }
}
