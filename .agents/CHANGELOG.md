# Changelog

This document contains historical completed work and timeline events for the SecondHand project.

## Timeline
- **2026-06-19:** Initial AI support document structure designed. Token reduction-oriented working principles determined.
- **2026-06-20:** Frontend UI sprint completed. API response convention standardized. 10 skill files created.
- **2026-06-21:** Backend Legacy & Hardcoded Code Scan completed.
- **2026-06-22:** User membership (Premium) model added to backend and frontend systems. All backend and frontend build verifications provided.
- **2026-06-26:** Backend N+1 performance issue detection and fix completed. Frontend and backend builds successfully verified.

## Completed Tasks

### Optimization & Performance
- Notification, Badge and Membership systems optimized. Backend updated the `userBadges` cache strategy to reduce unnecessary database reads. Frontend was configured to read plan info from token via `jwtDecode.js` and redundant API calls were cleaned.
- Backend N+1 performans düzeltmeleri uygulandı (ChatRoomRepository, MessageRepository, Order, User, Address, OrderItem). Build başarıyla doğrulandı.
- Frontend performans analizi yapıldı ve raporu hazırlandı. Performans optimizasyonları tamamlandı.
- Backend listing aramalarına server-side `title` filtresi entegre edildi. Flyway ile `LOWER(title)` functional index eklendi.
- `useListingSearch.js` ve backend title filter entegrasyonu tamamlandı.

### Feature Development
- Membership (Premium) sistemi backend ve frontend'e eklendi. PremiumUpgradeModal geliştirildi.
- Premium/Membership ödeme altyapısı PaymentProcessor altyapısına geçirildi. MEMBERSHIP_PAYMENT tipi eklendi. In-app bildirim ve e-posta eklendi.
- Chat "Infinite Scroll" implementasyonu backend (`OrderByCreatedAtDesc`) ve frontend (`useInfiniteQuery`) olarak tamamlandı.
- Kendi İlanlarım sayfasında durum filtresi server-side'a taşındı.
- Sipariş listesinde teslimat yöntemi filtresi server-side'a taşındı.
- WebSocket lazy-loading bağlantısı sağlandı.
- Auth rate limiting (LoginAttemptService) ve Token Family Revocation tamamlandı. HttpOnly cookie refactor tamamlandı.

### Design & Refactoring
- Checkout adımları refaktör edildi (design system uyumluluğu, glassmorphism, renkler düzeltildi).
- ShoppingCartPage refaktör edildi.
- AgreementsPage refaktör edildi.
- CouponsPage refaktör edildi.
- OffersPage ve OfferTrackingCard tasarım revizyonu yapıldı.
- UserReviewsPage tamamen yenilendi.
- AuraChatPage audit edildi ve yeniden tasarlandı.
- BuyerDashboardPage, SellerDashboardPage ve AccountHubPage audit edildi ve tasarım sistemine geçirildi.
- HomePage ve Header component'leri audit edilip semantic token'lara geçirildi.
- Skeleton ve EmptyState component'leri merkezileştirildi. PageContainer standartlaştırıldı. Tipografi ve border-radius temizliği yapıldı.
- 3 adet servis sınıfında `@Autowired` yerine constructor injection refactor yapıldı.

### Audit & Fixes
- Backend audit yapıldı (auth refactor, listing analizi).
- Tüm endpoint'ler tarandı, path tutarsızlıkları düzeltildi, Postman collection oluşturuldu.
- `INVALID_AGREEMENT_COUNT` hatası giderildi (MembershipUpgradeRequest DTO ve PaymentRequestFactory güncellendi).
- İlan oluşturma formlarında local storage cache'inin filtreleri ezmesi sorunu çözüldü (`restoreDraft`).
- `listingTitle` ve `listingNo` alanlarının ListingCreation ödeme işlemlerinde `null` kaydedilmesi sorunu `PaymentModuleAdapter` ile çözüldü.
- Backend Thymeleaf email template'leri Teal tasarım sistemine uyumlu hale getirildi.
- `CloudinaryConfig` `System.out.println` yerine Logger kullanımı. `ListingMapper` boş catch bloğuna loglama.
- Safe Meetup siparişleri için review desteği backend (`ReviewValidator.java`) ve frontend (`useOrderFlow.js`, `OrdersListLayout.jsx`) entegre edilerek tamamlandı. Unit test'leri (`ReviewValidatorTest.java`) yazıldı ve doğrulandı.
- `OrderDetailsModal` içerisindeki sipariş ürünlerinin görseli ve başlığı tıklanabilir yapılarak `ListingDetailPage` sayfasına yönlendirme ve modal kapatma işlevleri entegre edildi.
