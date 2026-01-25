package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.books.BooksListingService;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.util.BooksListingGenerator;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings/books/generator")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Books Listing Generator", description = "Generate realistic books listings for testing")
public class BooksListingGeneratorController {

    private final BooksListingGenerator generator;
    private final BooksListingService listingService;
    private final UserRepository userRepository;
    
    /**
     * Seller null ise otomatik olarak id=1 olan user'ı kullanır
     */
    private User getSellerOrDefault(User seller) {
        if (seller != null) {
            return seller;
        }
        return userRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Default seller (id=1) not found"));
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate a single random books listing", 
               description = "Creates a realistic random books listing for the authenticated user")
    public ResponseEntity<?> generateSingleListing(@AuthenticationPrincipal User seller) {
        User actualSeller = getSellerOrDefault(seller);
        BooksCreateRequest request = generator.generateRandomListing();
        var result = listingService.createBooksListing(request, actualSeller);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        UUID id = result.getData();
        log.info("Generated listing: {} - {} - {} for seller: {}", id, request.title(), request.price(), actualSeller.getId());
        return ResponseEntity.ok(id);
    }

    @PostMapping("/generate/{count}")
    @Operation(summary = "Generate multiple random books listings",
               description = "Creates the specified number of realistic random books listings")
    public ResponseEntity<List<UUID>> generateMultipleListings(
            @PathVariable int count,
            @AuthenticationPrincipal User seller) {
        
        if (count < 1 || count > 100) {
            return ResponseEntity.badRequest().build();
        }
        
        User actualSeller = getSellerOrDefault(seller);
        List<UUID> createdIds = generator.generateListings(count).stream()
                .map(request -> {
                    var result = listingService.createBooksListing(request, actualSeller);
                    if (result.isError()) {
                        log.error("Error generating listing: {}", result.getMessage());
                        return null;
                    }
                    UUID id = result.getData();
                    log.info("Generated listing: {} - {} - {} for seller: {}", id, request.title(), request.price(), actualSeller.getId());
                    return id;
                })
                .filter(id -> id != null)
                .toList();
        
        return ResponseEntity.ok(createdIds);
    }

    @PostMapping("/generate/genre/{genre}")
    @Operation(summary = "Generate a listing for a specific genre",
               description = "Creates a realistic books listing for the specified genre")
    public ResponseEntity<?> generateForGenre(
            @PathVariable BookGenre genre,
            @AuthenticationPrincipal User seller) {
        
        User actualSeller = getSellerOrDefault(seller);
        BooksCreateRequest request = generator.generateForGenre(genre);
        var result = listingService.createBooksListing(request, actualSeller);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        UUID id = result.getData();
        log.info("Generated listing for genre {}: {} - {} - {} for seller: {}", genre, id, request.title(), request.price(), actualSeller.getId());
        return ResponseEntity.ok(id);
    }

    @PostMapping("/generate/preview")
    @Operation(summary = "Preview a generated listing without saving",
               description = "Returns a preview of what a generated listing would look like")
    public ResponseEntity<BooksCreateRequest> previewListing() {
        BooksCreateRequest request = generator.generateRandomListing();
        return ResponseEntity.ok(request);
    }

    @PostMapping("/generate/preview/genre/{genre}")
    @Operation(summary = "Preview a generated listing for a specific genre",
               description = "Returns a preview of what a generated listing for a genre would look like")
    public ResponseEntity<BooksCreateRequest> previewForGenre(@PathVariable BookGenre genre) {
        BooksCreateRequest request = generator.generateForGenre(genre);
        return ResponseEntity.ok(request);
    }
}

