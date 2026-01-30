package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;
import com.serhat.secondhand.listing.domain.repository.books.BookConditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookFormatRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookGenreRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookLanguageRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class BooksDataInitializer implements SeedTask {

    private final BookTypeRepository bookTypeRepository;
    private final BookGenreRepository bookGenreRepository;
    private final BookLanguageRepository bookLanguageRepository;
    private final BookFormatRepository bookFormatRepository;
    private final BookConditionRepository bookConditionRepository;

    @Override
    public String key() {
        return "books";
    }

    @Override
    public Result<Void> run() {
        if (bookTypeRepository.count() == 0) {
            seedBookTypes();
        }
        if (bookGenreRepository.count() == 0) {
            seedBookGenres();
        }
        if (bookLanguageRepository.count() == 0) {
            seedBookLanguages();
        }
        if (bookFormatRepository.count() == 0) {
            seedBookFormats();
        }
        if (bookConditionRepository.count() == 0) {
            seedBookConditions();
        }
        return Result.success();
    }

    private void seedBookTypes() {
        List<String> labels = List.of(
                "Ders Kitabı",
                "Test Kitabı",
                "Okuma Kitabı",
                "Dini Kitaplar",
                "Çocuk Kitapları",
                "Akademik",
                "Sınav Hazırlık",
                "Kişisel Gelişim"
        );

        for (String label : labels) {
            BookType type = new BookType();
            type.setName(toKey(label));
            type.setLabel(label);
            bookTypeRepository.save(type);
        }
    }

    private void seedBookGenres() {
        Map<String, List<String>> genresByTypeLabel = new LinkedHashMap<>();
        genresByTypeLabel.put("Ders Kitabı", List.of(
                "Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Türkçe", "Edebiyat",
                "İngilizce", "Almanca", "Fransızca", "Felsefe", "Psikoloji", "Sosyoloji", "Ekonomi",
                "Bilgisayar Bilimleri", "Yazılım", "Veri Yapıları", "Algoritmalar", "Elektronik", "Makine", "İnşaat"
        ));
        genresByTypeLabel.put("Test Kitabı", List.of(
                "TYT", "AYT", "LGS", "KPSS", "ALES", "DGS", "YDS", "IELTS", "TOEFL",
                "Branş Denemeleri", "Konu Tarama", "Soru Bankası", "Deneme Sınavı", "Çıkmış Sorular"
        ));
        genresByTypeLabel.put("Okuma Kitabı", List.of(
                "Roman", "Hikâye", "Şiir", "Klasikler", "Bilimkurgu", "Fantastik", "Polisiye", "Gerilim",
                "Tarihî Roman", "Biyografi", "Anı", "Deneme", "Gezi", "Mizah", "Drama", "Aşk"
        ));
        genresByTypeLabel.put("Dini Kitaplar", List.of(
                "Kur'an-ı Kerim", "Tefsir", "Hadis", "Siyer", "İlmihal", "Fıkıh", "Tasavvuf",
                "Dua ve Zikir", "Ahlak", "İslam Tarihi"
        ));
        genresByTypeLabel.put("Çocuk Kitapları", List.of(
                "Masal", "Etkinlik", "Boyama", "Okuma Seti", "İlk Okuma", "Eğitici", "Kahramanlık", "Macera"
        ));
        genresByTypeLabel.put("Akademik", List.of(
                "Araştırma", "Tez", "Makale Derlemesi", "Referans", "Sözlük", "Ansiklopedi"
        ));
        genresByTypeLabel.put("Sınav Hazırlık", List.of(
                "Konu Anlatımı", "Hız ve Renk", "Notlar", "Özet", "Pratik", "Video Destekli"
        ));
        genresByTypeLabel.put("Kişisel Gelişim", List.of(
                "Motivasyon", "Zaman Yönetimi", "İletişim", "Liderlik", "Mindfulness", "Kariyer", "Finansal Okuryazarlık"
        ));

        for (var entry : genresByTypeLabel.entrySet()) {
            BookType type = bookTypeRepository.findByNameIgnoreCase(toKey(entry.getKey())).orElse(null);
            if (type == null) {
                continue;
            }
            for (String label : entry.getValue()) {
                BookGenre genre = new BookGenre();
                genre.setName(toKey(entry.getKey()) + "_" + toKey(label));
                genre.setLabel(label);
                genre.setBookType(type);
                bookGenreRepository.save(genre);
            }
        }

        BookType otherType = bookTypeRepository.findByNameIgnoreCase(toKey("Okuma Kitabı")).orElse(null);
        if (otherType != null) {
            BookGenre other = new BookGenre();
            other.setName("OTHER");
            other.setLabel("Other");
            other.setBookType(otherType);
            bookGenreRepository.save(other);
        }
    }

    private void seedBookLanguages() {
        List<String> labels = List.of(
                "Türkçe", "İngilizce", "Almanca", "Fransızca", "İspanyolca", "Arapça", "Rusça", "İtalyanca", "Other"
        );
        for (String label : labels) {
            BookLanguage language = new BookLanguage();
            language.setName(toKey(label));
            language.setLabel(label);
            bookLanguageRepository.save(language);
        }
    }

    private void seedBookFormats() {
        List<String> labels = List.of(
                "Hardcover", "Paperback", "Ebook", "Spiral", "Large Print", "Pocket"
        );
        for (String label : labels) {
            BookFormat format = new BookFormat();
            format.setName(toKey(label));
            format.setLabel(label);
            bookFormatRepository.save(format);
        }
    }

    private void seedBookConditions() {
        List<String> labels = List.of(
                "New", "Like New", "Good", "Fair", "Poor"
        );
        for (String label : labels) {
            BookCondition condition = new BookCondition();
            condition.setName(toKey(label));
            condition.setLabel(label);
            bookConditionRepository.save(condition);
        }
    }

    private String toKey(String label) {
        String normalized = Normalizer.normalize(label, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "");
        return normalized.trim()
                .toUpperCase(Locale.ROOT)
                .replace('&', ' ')
                .replace('\'', ' ')
                .replace('-', ' ')
                .replaceAll("\\s+", "_");
    }
}

