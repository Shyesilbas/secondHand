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
        UUID testListingId = UUID.randomUUID();
        int initialStock = 3;
        int numberOfConcurrentUsers = 5;

        log.info("================================================================================");
        log.info("🚀 [FLASH-SALE SIMULATION STARTED]");
        log.info("📦 Ürün ID: {}", testListingId);
        log.info("🔢 Başlangıç Stoğu: {}", initialStock);
        log.info("👥 Eşzamanlı Alıcı Sayısı: {}", numberOfConcurrentUsers);
        log.info("================================================================================");

        // Redis'teki stok anahtarını başlangıç değeriyle doğrudan ayarla
        redisTemplate.opsForValue().set("stock:" + testListingId, String.valueOf(initialStock));
        for (long u = 1; u <= numberOfConcurrentUsers; u++) {
            redisTemplate.delete("reservation:" + (1000L + u) + ":" + testListingId);
        }

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

    @Autowired
    private com.serhat.secondhand.coupon.application.CouponRedisLimiterService couponRedisLimiterService;

    @Test
    @DisplayName("Flash-Sale Coupon Concurrency Test: 5 Eşzamanlı Kullanıcı, 2 Adet Kupon Limiti")
    public void testConcurrentCouponRedemptionLimit() throws Exception {
        String testCouponCode = "FLASH_TEST_" + System.currentTimeMillis();
        int globalLimit = 2;
        int numberOfConcurrentUsers = 5;

        log.info("================================================================================");
        log.info("🎟️ [COUPON FLASH-SALE CONCURRENCY SIMULATION STARTED]");
        log.info("🔖 Kupon Kodu: {}", testCouponCode);
        log.info("🔢 Global Kullanım Limiti: {}", globalLimit);
        log.info("👥 Eşzamanlı İstek Sayısı: {}", numberOfConcurrentUsers);
        log.info("================================================================================");

        ExecutorService executorService = Executors.newFixedThreadPool(numberOfConcurrentUsers);
        CountDownLatch readyLatch = new CountDownLatch(numberOfConcurrentUsers);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfConcurrentUsers);

        List<String> successfulUsers = Collections.synchronizedList(new ArrayList<>());
        List<String> rejectedUsers = Collections.synchronizedList(new ArrayList<>());

        for (int i = 1; i <= numberOfConcurrentUsers; i++) {
            final long userId = 2000L + i;
            final String userName = "CouponUser-" + i;

            executorService.submit(() -> {
                readyLatch.countDown();
                try {
                    startGate.await();
                    int result = couponRedisLimiterService.acquireCouponUsage(
                            testCouponCode, userId, globalLimit, 1, 3600L
                    );

                    if (result > 0) {
                        successfulUsers.add(userName);
                        log.info("✅ [{}] -> KUPON BAŞARIYLA ALINDI! (Redis Sıra No: {})", userName, result);
                    } else {
                        rejectedUsers.add(userName);
                        log.warn("❌ [{}] -> KUPON LİMİTİ DOLDU (Sonuç Kodu: {})", userName, result);
                    }
                } catch (Exception e) {
                    log.error("Hata:", e);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startGate.countDown();
        doneLatch.await(5, TimeUnit.SECONDS);
        executorService.shutdown();

        log.info("🟢 Kupon Kazananlar: {} -> {}", successfulUsers.size(), successfulUsers);
        log.info("🔴 Kupon Kaçıranlar: {} -> {}", rejectedUsers.size(), rejectedUsers);

        Assertions.assertEquals(2, successfulUsers.size(), "Kuponu tam olarak 2 kişi alabilmelidir.");
        Assertions.assertEquals(3, rejectedUsers.size(), "Kupon kotası dolduğu için 3 kişi reddedilmelidir.");
    }

    @Autowired
    private com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository escrowOutboxRepository;

    @Autowired
    private com.serhat.secondhand.escrow.outbox.EscrowOutboxService escrowOutboxService;

    @Autowired
    private com.serhat.secondhand.escrow.domain.repository.EscrowRepository escrowRepository;

    @Test
    @DisplayName("Escrow Release -> Transactional Outbox Flow Test")
    public void testEscrowOutboxReleaseFlow() {
        log.info("================================================================================");
        log.info("🤝 [ESCROW RELEASE & OUTBOX SIMULATION STARTED]");
        log.info("================================================================================");

        User seller = userRepository.findAll().stream().findFirst().orElseThrow();
        com.serhat.secondhand.escrow.domain.entity.Escrow escrow = com.serhat.secondhand.escrow.domain.entity.Escrow.builder()
                .seller(seller)
                .buyer(seller)
                .amount(new BigDecimal("750.00"))
                .status(PaymentStatus.ESCROW)
                .listingId(UUID.randomUUID())
                .listingTitle("Test Güvenceli Ürün")
                .listingNo("ESC-999")
                .blockedAt(LocalDateTime.now())
                .build();
        final com.serhat.secondhand.escrow.domain.entity.Escrow savedEscrow = escrowRepository.save(escrow);

        // 1. Escrow Release tetikle (Outbox'a yaz)
        escrowOutboxService.enqueueEscrowReleased(savedEscrow);

        // 2. Outbox tablosunu kontrol et
        List<com.serhat.secondhand.escrow.outbox.EscrowOutboxEvent> outboxEvents = escrowOutboxRepository.findAll();
        boolean eventExists = outboxEvents.stream()
                .anyMatch(e -> e.getAggregateId().equals(savedEscrow.getId().toString()) && e.getEventType().equals("ESCROW_RELEASED"));

        log.info("📬 Escrow Outbox Tablosunda ESCROW_RELEASED Event Kaydı Bulundu mu: {}", eventExists);
        Assertions.assertTrue(eventExists, "Escrow release eventi escrow_outbox_events tablosuna ACID ile yazılmalıdır.");
    }

    @Test
    @DisplayName("Stock Reservation Manual Cancellation & TTL Release Test")
    public void testStockReservationTtlAndCancellation() {
        log.info("================================================================================");
        log.info("⏳ [STOCK RESERVATION CANCELLATION & TTL SIMULATION STARTED]");
        log.info("================================================================================");

        com.serhat.secondhand.listing.domain.entity.Listing realListing = listingRepository.findAll().stream().findFirst().orElseThrow();
        UUID testListingId = realListing.getId();
        long testUserId = 9999L;

        // 1. Başlangıç stoğu 1 yap
        Inventory inventory = inventoryRepository.findByListingId(testListingId).orElseGet(() ->
                Inventory.builder().listingId(testListingId).build()
        );
        inventory.setAvailableQuantity(1);
        inventoryRepository.save(inventory);

        redisTemplate.delete("stock:" + testListingId);
        redisTemplate.delete("reservation:" + testUserId + ":" + testListingId);

        // 2. Kullanıcı stoğu rezerve eder
        redisReservationService.reserveStockWithTtl(testUserId, testListingId, 1, 900L);
        String stockAfterReserve = redisTemplate.opsForValue().get("stock:" + testListingId);
        log.info("📦 Rezervasyon Sonrası Redis Kalan Stok: {}", stockAfterReserve);
        Assertions.assertEquals("0", stockAfterReserve);

        // 3. Kullanıcı sepetten ürünü çıkarır veya checkout iptal eder
        redisReservationService.cancelUserReservation(testUserId, testListingId);
        String stockAfterCancel = redisTemplate.opsForValue().get("stock:" + testListingId);
        log.info("♻️ İptal Sonrası Redis Serbest Kalan Stok: {}", stockAfterCancel);
        Assertions.assertEquals("1", stockAfterCancel, "İptal edilen rezervasyon stoğa anında geri iade edilmelidir.");
    }

    @Autowired
    private com.serhat.secondhand.order.outbox.OrderOutboxRepository orderOutboxRepository;

    @Autowired
    private com.serhat.secondhand.order.outbox.OrderOutboxService orderOutboxService;

    @Test
    @DisplayName("Order Cancelled -> Transactional Outbox Flow Test")
    public void testOrderCancellationOutboxFlow() {
        log.info("================================================================================");
        log.info("📦 [ORDER CANCELLATION & OUTBOX SIMULATION STARTED]");
        log.info("================================================================================");

        long testOrderId = 8888L;
        com.serhat.secondhand.order.contract.OrderCancelledKafkaEvent event =
                new com.serhat.secondhand.order.contract.OrderCancelledKafkaEvent(
                        testOrderId,
                        "ORD-TEST-8888",
                        1001L,
                        new BigDecimal("499.00"),
                        List.of(new com.serhat.secondhand.order.contract.OrderCancelledKafkaEvent.CancelledItemDetail(
                                UUID.randomUUID(), 1, new BigDecimal("499.00")
                        )),
                        "Customer cancellation test"
                );

        // 1. Outbox'a yaz
        orderOutboxService.enqueueOrderCancelled(event);

        // 2. Outbox tablosunu kontrol et
        List<com.serhat.secondhand.order.outbox.OrderOutboxEvent> outboxEvents = orderOutboxRepository.findAll();
        boolean eventExists = outboxEvents.stream()
                .anyMatch(e -> e.getAggregateId().equals(String.valueOf(testOrderId)) && e.getEventType().equals("ORDER_CANCELLED"));

        log.info("📬 Order Outbox Tablosunda ORDER_CANCELLED Event Kaydı Bulundu mu: {}", eventExists);
        Assertions.assertTrue(eventExists, "Sipariş iptal eventi order_outbox_events tablosuna ACID ile yazılmalıdır.");
    }

    @Test
    @DisplayName("Order Refunded -> Transactional Outbox Flow Test")
    public void testOrderRefundOutboxFlow() {
        log.info("================================================================================");
        log.info("🔄 [ORDER REFUND & OUTBOX SIMULATION STARTED]");
        log.info("================================================================================");

        long testOrderId = 7777L;
        com.serhat.secondhand.order.contract.OrderRefundedKafkaEvent event =
                new com.serhat.secondhand.order.contract.OrderRefundedKafkaEvent(
                        testOrderId,
                        "ORD-REFUND-7777",
                        1001L,
                        new BigDecimal("299.00"),
                        List.of(new com.serhat.secondhand.order.contract.OrderRefundedKafkaEvent.RefundedItemDetail(
                                UUID.randomUUID(), 1, new BigDecimal("299.00")
                        )),
                        "Customer refund test"
                );

        // 1. Outbox'a yaz
        orderOutboxService.enqueueOrderRefunded(event);

        // 2. Outbox tablosunu kontrol et
        List<com.serhat.secondhand.order.outbox.OrderOutboxEvent> outboxEvents = orderOutboxRepository.findAll();
        boolean eventExists = outboxEvents.stream()
                .anyMatch(e -> e.getAggregateId().equals(String.valueOf(testOrderId)) && e.getEventType().equals("ORDER_REFUNDED"));

        log.info("📬 Order Outbox Tablosunda ORDER_REFUNDED Event Kaydı Bulundu mu: {}", eventExists);
        Assertions.assertTrue(eventExists, "Sipariş iade eventi order_outbox_events tablosuna ACID ile yazılmalıdır.");
    }
}
