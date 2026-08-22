package com.serhat.secondhand.concurrency;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.inventory.application.InventoryRedisReservationService;
import com.serhat.secondhand.inventory.application.InventoryService;
import com.serhat.secondhand.inventory.domain.entity.Inventory;
import com.serhat.secondhand.inventory.domain.repository.InventoryRepository;
import com.serhat.secondhand.payment.application.PaymentKafkaProducer;
import com.serhat.secondhand.payment.contract.PaymentCompletedKafkaEvent;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.outbox.OutboxStatus;
import com.serhat.secondhand.payment.outbox.PaymentOutboxEvent;
import com.serhat.secondhand.payment.outbox.PaymentOutboxRepository;
import com.serhat.secondhand.payment.outbox.PaymentOutboxService;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5433/secondhand",
        "spring.datasource.username=postgres",
        "spring.datasource.password=postgres",
        "spring.data.redis.host=localhost",
        "spring.data.redis.port=6379",
        "spring.kafka.bootstrap-servers=localhost:9092",
        "jwt.secret-key=a0afa5c788bfb88b4e6f628164275049f647a688c468d943c64c44ee2695decc2da7fcc0356227eb0e35bf7aa7ee402c",
        "GEMINI_API_KEY=mock-gemini-key",
        "GEMINI_API_MODEL=gemini-3.1-flash-lite",
        "GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com",
        "GEMINI_API_FALLBACK_MEMORY_MODEL=gemini-2.0-flash-lite",
        "CLOUDINARY_CLOUD_NAME=mock-cloudinary",
        "CLOUDINARY_API_KEY=1234567890",
        "CLOUDINARY_API_SECRET=mock-secret",
        "GOOGLE_CLIENT_ID=mock-google-client-id",
        "GOOGLE_CLIENT_SECRET=mock-google-client-secret",
        "GOOGLE_SCOPE=openid,profile,email",
        "REDIRECT_URI=http://localhost:8080/login/oauth2/code/google",
        "ISSUER_URI=https://accounts.google.com",
        "EXCHANGE_API_KEY=mock-exchange-key",
        "FRONTEND_URL=http://localhost:5173",
        "COOKIE_DOMAIN=localhost",
        "CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173",
        "RATE_LIMIT_ENABLED=false",
        "RATE_LIMIT_AUTH=3",
        "RATE_LIMIT_PAYMENT=3",
        "RATE_LIMIT_GENERAL=10",
        "RATE_LIMIT_AI=6",
        "RATE_LIMIT_WINDOW=60"
})
@Slf4j
public class ConcurrentStockAndPaymentIntegrationTest {

    @Autowired
    private InventoryRedisReservationService redisReservationService;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentOutboxRepository paymentOutboxRepository;

    @Autowired
    private PaymentOutboxService paymentOutboxService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.serhat.secondhand.listing.domain.repository.listing.ListingRepository listingRepository;

    @Test
    @DisplayName("Flash-Sale Concurrency Test: 5 Eşzamanlı Kullanıcı, 3 Adet Stok")
    public void testConcurrentStockReservationAndOutboxFlow() throws Exception {
        // DB'deki mevcut bir ilanı kullan veya yeni oluştur
        com.serhat.secondhand.listing.domain.entity.Listing realListing = listingRepository.findAll().stream().findFirst().orElseThrow(
                () -> new IllegalStateException("Test için en az 1 ilan bulunmalıdır.")
        );
        UUID testListingId = realListing.getId();
        int initialStock = 3;
        int numberOfConcurrentUsers = 5;

        log.info("================================================================================");
        log.info("🚀 [FLASH-SALE SIMULATION STARTED]");
        log.info("📦 Ürün ID: {} | Başlık: {}", testListingId, realListing.getTitle());
        log.info("🔢 Başlangıç Stoğu: {}", initialStock);
        log.info("👥 Eşzamanlı Alıcı Sayısı: {}", numberOfConcurrentUsers);
        log.info("================================================================================");

        // 1. Veritabanına başlangıç stoğu tanımla / güncelle
        Inventory inventory = inventoryRepository.findByListingId(testListingId).orElseGet(() ->
                Inventory.builder().listingId(testListingId).build()
        );
        inventory.setAvailableQuantity(initialStock);
        inventoryRepository.save(inventory);

        // Redis'teki olası eski anahtarları temizle
        redisTemplate.delete("stock:" + testListingId);
        for (long u = 1; u <= numberOfConcurrentUsers; u++) {
            redisTemplate.delete("reservation:" + u + ":" + testListingId);
        }

        // Test kullanıcıları hazırla
        User seller = userRepository.findAll().stream().findFirst().orElseGet(() ->
                userRepository.save(User.builder().email("seller_test_" + System.currentTimeMillis() + "@test.com").name("Seller").build())
        );

        ExecutorService executorService = Executors.newFixedThreadPool(numberOfConcurrentUsers);
        CountDownLatch readyLatch = new CountDownLatch(numberOfConcurrentUsers);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfConcurrentUsers);

        List<String> successfulUsers = Collections.synchronizedList(new ArrayList<>());
        List<String> rejectedUsers = Collections.synchronizedList(new ArrayList<>());
        Map<String, Long> executionTimes = new ConcurrentHashMap<>();

        // 2. 5 Thread oluşturup kapıda beklet
        for (int i = 1; i <= numberOfConcurrentUsers; i++) {
            final long userId = 1000L + i;
            final String userName = "User-" + i + " (ID:" + userId + ")";

            executorService.submit(() -> {
                readyLatch.countDown();
                try {
                    startGate.await(); // Tabanca sesini bekle!

                    long startTime = System.currentTimeMillis();
                    log.info("⚡ [{}] -> Satın alma isteği ateşlendi!", userName);

                    try {
                        // A) Redis Lua Atomik Rezervasyon
                        redisReservationService.reserveStockWithTtl(userId, testListingId, 1, 900L);
                        long duration = System.currentTimeMillis() - startTime;
                        executionTimes.put(userName, duration);

                        log.info("✅ [{}] -> STOK REZERVE EDİLDİ! (Süre: {} ms) | Redis Kilit Başarılı", userName, duration);

                        // B) Ödeme & Transactional Outbox Kaydı Simülasyonu
                        Payment payment = Payment.builder()
                                .amount(new BigDecimal("250.00"))
                                .currency("TRY")
                                .listingId(testListingId)
                                .fromUser(seller) // Test için
                                .toUser(seller)
                                .status(PaymentStatus.COMPLETED)
                                .isSuccess(true)
                                .processedAt(LocalDateTime.now())
                                .idempotencyKey("TEST-CONCURRENT-" + userId + "-" + testListingId)
                                .build();
                        payment = paymentRepository.save(payment);

                        // Outbox'a yaz
                        paymentOutboxService.enqueuePaymentCompleted(payment);

                        successfulUsers.add(userName);
                        log.info("📬 [{}] -> Payment ve Outbox Event DB'ye ACID ile kaydedildi!", userName);

                    } catch (BusinessException ex) {
                        long duration = System.currentTimeMillis() - startTime;
                        executionTimes.put(userName, duration);
                        rejectedUsers.add(userName);
                        log.warn("❌ [{}] -> REDDEDİLDİ: {} (Süre: {} ms) | DB'ye yük binmedi!", userName, ex.getMessage(), duration);
                    } catch (Exception ex) {
                        log.error("💥 [{}] -> Beklenmeyen hata:", userName, ex);
                        rejectedUsers.add(userName);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Tüm thread'ler hazır olana kadar bekle
        readyLatch.await();
        log.info("🚦 5 Thread kapıda hazır bekliyor... 3.. 2.. 1.. FIRE! 💥");
        startGate.countDown(); // Tabancayı ateşle!

        // Tüm işlemlerin bitmesini bekle
        boolean completedInTime = doneLatch.await(10, TimeUnit.SECONDS);
        executorService.shutdown();

        log.info("================================================================================");
        log.info("🏁 [SIMULATION FINISHED]");
        log.info("⏱️ Zamanında Bitti mi: {}", completedInTime);
        log.info("🟢 Başarılı Satın Almalar (Kalan Stok 0 Oldu): {} -> {}", successfulUsers.size(), successfulUsers);
        log.info("🔴 Stok Yetersizliği ile Reddedilenler: {} -> {}", rejectedUsers.size(), rejectedUsers);
        log.info("📊 Ortalama Redis Lua Karar Süresi: {} ms",
                executionTimes.values().stream().mapToLong(Long::longValue).average().orElse(0.0));
        log.info("================================================================================");

        // 3. ASSERTIONS (Matematiksel Kesinlik Doğrulamaları)
        Assertions.assertEquals(3, successfulUsers.size(), "Tam olarak 3 kullanıcı ürünü satın alabilmelidir.");
        Assertions.assertEquals(2, rejectedUsers.size(), "Stok tükendiği için tam 2 kullanıcı reddedilmelidir.");

        // Redis'teki stok anahtarının değerini doğrula (3 adet rezerve edildiği için kalan 0 olmalı)
        String remainingRedisStock = redisTemplate.opsForValue().get("stock:" + testListingId);
        log.info("🔍 Redis'te Kalan Fiziksel Stok Değeri: {}", remainingRedisStock);
        Assertions.assertEquals("0", remainingRedisStock, "Redis'te kalan stok tam 0 olmalıdır.");
    }
}
