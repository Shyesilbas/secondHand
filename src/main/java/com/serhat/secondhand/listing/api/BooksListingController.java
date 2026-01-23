package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.listing.application.BooksListingService;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.books.BooksUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.books.BooksListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.user.domain.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Books Listings", description = "Books listing CRUD operations and search")
public class BooksListingController {

    private final BooksListingService booksListingService;

    @PostMapping("/create-listing")
    @Operation(summary = "Create a new books listing")
    public ResponseEntity<?> createBooksListing(
            @Valid @RequestBody BooksCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        var result = booksListingService.createBooksListing(request, currentUser);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        URI location = URI.create("/api/v1/books/" + result.getData());
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a books listing")
    public ResponseEntity<?> updateBooksListing(
            @PathVariable UUID id,
            @Valid @RequestBody BooksUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        var result = booksListingService.updateBooksListing(id, request, currentUser);
        if (result.isError()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get books listing details")
    public ResponseEntity<BooksListingDto> getBooksDetails(@PathVariable UUID id) {
        BooksListingDto dto = booksListingService.getBooksDetails(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/filter")
    @Operation(summary = "Filter books listings")
    public ResponseEntity<Page<ListingDto>> filterBooks(@RequestBody BooksListingFilterDto filters) {
        Page<ListingDto> page = booksListingService.filterBooks(filters);
        return ResponseEntity.ok(page);
    }
}


