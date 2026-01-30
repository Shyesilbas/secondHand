package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.repository.books.BookConditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookFormatRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookGenreRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookLanguageRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BooksListingResolver {
    private final BookTypeRepository bookTypeRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookLanguageRepository bookLanguageRepository;
    private final BookFormatRepository bookFormatRepository;
    private final BookConditionRepository bookConditionRepository;

    public Result<BooksResolution> resolve(UUID bookTypeId, UUID genreId, UUID languageId, UUID formatId, UUID conditionId) {
        var bookType = bookTypeRepository.findById(bookTypeId).orElse(null);
        if (bookType == null) return Result.error("Book type not found", "BOOK_TYPE_NOT_FOUND");

        var genre = bookGenreRepository.findById(genreId).orElse(null);
        if (genre == null) return Result.error("Book genre not found", "BOOK_GENRE_NOT_FOUND");

        var language = bookLanguageRepository.findById(languageId).orElse(null);
        if (language == null) return Result.error("Book language not found", "BOOK_LANGUAGE_NOT_FOUND");

        var format = bookFormatRepository.findById(formatId).orElse(null);
        if (format == null) return Result.error("Book format not found", "BOOK_FORMAT_NOT_FOUND");

        var condition = bookConditionRepository.findById(conditionId).orElse(null);
        if (condition == null) return Result.error("Book condition not found", "BOOK_CONDITION_NOT_FOUND");

        return Result.success(new BooksResolution(bookType, genre, language, format, condition));
    }

    public Result<Void> apply(
            BooksListing listing,
            Optional<UUID> bookTypeId,
            Optional<UUID> genreId,
            Optional<UUID> languageId,
            Optional<UUID> formatId,
            Optional<UUID> conditionId
    ) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (bookTypeId != null && bookTypeId.isPresent()) {
            var bookType = bookTypeRepository.findById(bookTypeId.get()).orElse(null);
            if (bookType == null) return Result.error("Book type not found", "BOOK_TYPE_NOT_FOUND");
            listing.setBookType(bookType);
        }

        if (genreId != null && genreId.isPresent()) {
            var genre = bookGenreRepository.findById(genreId.get()).orElse(null);
            if (genre == null) return Result.error("Book genre not found", "BOOK_GENRE_NOT_FOUND");
            listing.setGenre(genre);
        }

        if (languageId != null && languageId.isPresent()) {
            var language = bookLanguageRepository.findById(languageId.get()).orElse(null);
            if (language == null) return Result.error("Book language not found", "BOOK_LANGUAGE_NOT_FOUND");
            listing.setLanguage(language);
        }

        if (formatId != null && formatId.isPresent()) {
            var format = bookFormatRepository.findById(formatId.get()).orElse(null);
            if (format == null) return Result.error("Book format not found", "BOOK_FORMAT_NOT_FOUND");
            listing.setFormat(format);
        }

        if (conditionId != null && conditionId.isPresent()) {
            var condition = bookConditionRepository.findById(conditionId.get()).orElse(null);
            if (condition == null) return Result.error("Book condition not found", "BOOK_CONDITION_NOT_FOUND");
            listing.setCondition(condition);
        }

        return Result.success();
    }
}

