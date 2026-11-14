package com.serhat.secondhand.listing.api;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.listing.application.books.BookCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.books.BookEditionCatalogDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Book catalog lookups for the listing form: edition by ISBN, title/author search, and type attributes. */
@RestController
@RequestMapping("/api/v1/catalog/books")
@RequiredArgsConstructor
@PublicEndpoint
@Tag(name = "Book Catalog", description = "Book edition and attribute lookups")
public class BookCatalogController {

    private final BookCatalogService bookCatalogService;

    @GetMapping("/editions")
    @Operation(summary = "Catalog edition with this ISBN (empty list when unknown)")
    public ResponseEntity<List<BookEditionCatalogDto>> editionsByIsbn(@RequestParam String isbn) {
        return ResultResponses.ok(bookCatalogService.byIsbn(isbn));
    }

    @GetMapping("/search")
    @Operation(summary = "Catalog editions whose title or author contains the query (max 20)")
    public ResponseEntity<List<BookEditionCatalogDto>> search(@RequestParam String q) {
        return ResultResponses.ok(bookCatalogService.search(q));
    }

    @GetMapping("/attributes")
    @Operation(summary = "Attribute definitions of a book type")
    public ResponseEntity<List<AttributeDefinitionDto>> attributes(@RequestParam UUID typeId) {
        return ResultResponses.ok(bookCatalogService.attributes(typeId));
    }
}
