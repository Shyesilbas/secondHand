package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.books.BookEditionCatalogDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookEdition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookWork;
import com.serhat.secondhand.listing.domain.repository.books.BookEditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Catalog reads for the books listing form: an edition by ISBN, editions by title or author, and the attribute
 * definitions of a book type. Not cached: small indexed reads; the catalog only changes through the seed.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookCatalogService {

    static final int MIN_QUERY_LENGTH = 2;
    static final int MAX_RESULTS = 20;

    private final BookEditionRepository editionRepository;
    private final BookTypeRepository typeRepository;
    private final ListingAttributeCatalogService attributeCatalogService;

    /** The edition with this ISBN (ISBN-10 accepted), or an empty list when the catalog does not have it. */
    public Result<List<BookEditionCatalogDto>> byIsbn(String isbn) {
        return Isbn.toIsbn13(isbn)
                .<Result<List<BookEditionCatalogDto>>>map(isbn13 -> Result.success(
                        editionRepository.findByIsbn(isbn13).map(BookCatalogService::toDto).stream().toList()))
                .orElseGet(() -> Result.error("ISBN is not a valid ISBN-10 or ISBN-13", "BOOK_ISBN_INVALID"));
    }

    public Result<List<BookEditionCatalogDto>> search(String query) {
        String q = query == null ? "" : query.trim().toLowerCase(Locale.forLanguageTag("tr"));
        if (q.length() < MIN_QUERY_LENGTH) {
            return Result.error("Search needs at least " + MIN_QUERY_LENGTH + " characters", "BOOK_SEARCH_QUERY_TOO_SHORT");
        }
        return Result.success(editionRepository.search(q, PageRequest.of(0, MAX_RESULTS)).stream()
                .map(BookCatalogService::toDto).toList());
    }

    /** Attribute definitions of a book type (scope = the type's name, e.g. SINAV_HAZIRLIK). */
    public Result<List<AttributeDefinitionDto>> attributes(UUID typeId) {
        return typeRepository.findById(typeId)
                .<Result<List<AttributeDefinitionDto>>>map(type -> Result.success(
                        attributeCatalogService.getDefinitions(ListingType.BOOKS, type.getName())))
                .orElseGet(() -> Result.error("Book type not found", "BOOK_TYPE_NOT_FOUND"));
    }

    static BookEditionCatalogDto toDto(BookEdition e) {
        BookWork w = e.getWork();
        return new BookEditionCatalogDto(e.getId(), e.getIsbn(), w.getTitle(), w.authorNames(),
                w.getBookType().getId(), w.getBookType().getLabel(), w.getGenre().getId(), w.getGenre().getLabel(),
                e.getPublisher().getLabel(), e.getPublicationYear(), e.getPageCount(),
                e.getFormat().getId(), e.getFormat().getLabel(), e.getLanguage().getId(), e.getLanguage().getLabel(),
                e.getTranslator(), e.getCoverUrl(), e.getExamYear(), e.getSource());
    }
}
