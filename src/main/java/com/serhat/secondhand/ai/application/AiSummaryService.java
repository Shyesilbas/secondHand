package com.serhat.secondhand.ai.application;

import com.serhat.secondhand.review.entity.Review;
import com.serhat.secondhand.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiSummaryService {

    private final ReviewRepository reviewRepository;
    private final GeminiClient geminiClient;

    @Cacheable(value = "aiSummaries", key = "'user::' + #userId")
    public String getUserReviewsSummary(Long userId) {
        log.info("Generating AI summary for user reviews: userId={}", userId);
        
        List<Review> reviews = reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 20)).getContent();
        
        if (reviews.isEmpty()) {
            return "Bu kullanıcı için henüz yapılmış yorum bulunmamaktadır.";
        }

        String reviewBlock = reviews.stream()
                .map(r -> String.format("- Puan: %d/5 | Yorum: %s", r.getRating(), r.getComment()))
                .collect(Collectors.joining("\n"));

        String prompt = String.format("""
                Aşağıda bir satıcıya yapılan kullanıcı yorumları listelenmiştir. Lütfen bu yorumları analiz et ve satıcının öne çıkan olumlu ve varsa olumsuz özelliklerini içeren, samimi, anlaşılır ve kısa bir Türkçe özet oluştur. 
                Özeti maddeler halinde veya kısa bir paragraf şeklinde sunabilirsin. Cevabında sadece özet yer alsın, giriş/giriş cümleleri kullanma.
                
                Yorumlar:
                %s
                """, reviewBlock);

        try {
            return geminiClient.generateText(prompt);
        } catch (Exception e) {
            log.error("Failed to generate AI user review summary: ", e);
            return "Sistem yoğunluğu nedeniyle şu an yorum özeti oluşturulamadı.";
        }
    }

    @Cacheable(value = "aiSummaries", key = "'listing::' + #listingId")
    public String getListingReviewsSummary(UUID listingId) {
        log.info("Generating AI summary for listing reviews: listingId={}", listingId);
        
        List<Review> reviews = reviewRepository.findReviewsByListingId(listingId, PageRequest.of(0, 20)).getContent();
        
        if (reviews.isEmpty()) {
            return "Bu ürün/ilan için henüz yapılmış yorum bulunmamaktadır.";
        }

        String reviewBlock = reviews.stream()
                .map(r -> String.format("- Puan: %d/5 | Yorum: %s", r.getRating(), r.getComment()))
                .collect(Collectors.joining("\n"));

        String prompt = String.format("""
                Aşağıda bir ilan/ürün için yapılan kullanıcı yorumları listelenmiştir. Lütfen bu yorumları analiz et ve ürünün öne çıkan özelliklerini, kalitesini, olumlu ve varsa olumsuz yanlarını içeren, samimi, anlaşılır ve kısa bir Türkçe özet oluştur.
                Özeti maddeler halinde veya kısa bir paragraf şeklinde sunabilirsin. Cevabında sadece özet yer alsın, giriş/giriş cümleleri kullanma.
                
                Yorumlar:
                %s
                """, reviewBlock);

        try {
            return geminiClient.generateText(prompt);
        } catch (Exception e) {
            log.error("Failed to generate AI listing review summary: ", e);
            return "Sistem yoğunluğu nedeniyle şu an yorum özeti oluşturulamadı.";
        }
    }
}
