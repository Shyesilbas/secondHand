# secondHand Project Rules & Agents Guidelines

## 0. Principles
- Kısa oku, kısa karar ver, kısa değiştir.
- Önce kurallar, sonra iş listesi, sonra kod.
- En az bağlamla en güvenli değişikliği yap.

## 0.1 Context Güncelleme Kuralı
Her görev veya session tamamlandığında `.agents/CONTEXT.md` dosyasını güncelle:
- **Son çalışılan:** Ne yapıldı
- **Tamamlananlar:** Kapatılan maddeler
- **Bir sonraki adım:** Bekleyen iş
- **Açık riskler:** Test edilmemiş veya dikkat gerektiren alan

Bu adımı atlamak yasaktır.

## 0.2 GEMINI.md Güncelleme Kuralı
Aşağıdaki durumlarda `GEMINI.md` otomatik güncellenir, onay beklenmez:

- Yeni skill eklenince → Section 2'ye ekle
- Yeni backend paketi eklenince → Section 3 Backend listesine ekle  
- Yeni frontend modülü eklenince → Section 3 Frontend listesine ekle
- Yeni teknoloji/kütüphane eklenince → Section 5'e ekle
- Yeni convention belirlendiyse → Section 5'e ekle
- Görev tamamlanınca → Section 6.4 Todo güncelle
- Önemli mimari karar alındıysa → Section 6.5 Timeline'a ekle

Bu adımı atlamak yasaktır. CONTEXT.md ile aynı anda güncellenir.

## 1. Rules

### Genel
- Var olan mimariyi bozma.
- Gereksiz refactor yapma.
- Bir degisiklik tek sorunu cozsun.
- Kod degisirse ilgili artefact da degissin.

### Proje Kurallari
- Backend is akisi genelde `controller -> service -> validator -> repository -> mapper` seklinde ilerler.
- DTO, entity, mapper ve repository birbiriyle tutarli kalmali.
- Cache davranisi degisiyorsa etkiledigi tum katmanlar kontrol edilmeli.
- Payment, escrow, order, cart, listing gibi kritik domainlerde kural ihlali yaratacak varsayim yapma.

### Token / Baglam Kurallari
- Ilgili modul disinda arama yapma.
- Uzun dosya yerine kisa ozet dosyasini kullan.
- Bir sorunu cozerken once hedef dosyayi bul, sonra minimum diff uygula.
- Ayni bilginin kopyasini README, artifact ve prompt icinde tekrar etme.

### Best Practice
- Yorum yerine isimlendirme ve yapisal ayrim kullan.
- Degisiklik oncesi ilgili test/validation etkisini zihinde haritala.
- Riskli alanlarda fallback yerine net hata uret.
- Kural eklerken once mevcut desenle eslestir, yeni desen sadece zorunluysa ekle.

## 2. Skills
Skill detayları `.agents/skills/` klasöründe tanımlıdır.
Mevcut skill'ler: repo-navigator, domain-editor, documentation-sync, token-saver, code-quality-control, frontend-quality, design-system, frontend-audit, backend-audit, api-contract, feature-planner

## 3. Projects Structure

### Backend
- `auth`, `listing`, `cart`, `offer`, `order`, `payment`, `escrow`, `ewallet`, `shipping`, `review`, `campaign`, `showcase`, `favorite`, `agreements`

### Frontend
- `src/listing`, `src/order`, `src/payments`, `src/reviews`
- `src/ai`, `src/auth`, `src/cart`, `src/chat`, `src/offer`
- `src/ewallet`, `src/campaign`, `src/showcase`, `src/forum`
- `src/complaint`, `src/notification`, `src/user`, `src/home`
- `src/common` (shared components, hooks, services, theme)

### Calisma Notu
- Her proje alani icin sadece bir ana README veya artifact referansi kullan.
- Modul icindeki detaylar gerekiyorsa oradan okunur, buraya tasinmaz.

## 4. Runbook

### Decision Flow
1. Task hangi domaini etkiliyor?
2. O domainin README'si ne diyor?
3. Degisim controller/service/validator/repository/mapper zincirinin neresinde?
4. Cache, event, auth veya money flow var mi?
5. En kucuk dogru diff nedir?

### Change Pattern
- Contract degisiyorsa DTO + mapper + controller birlikte.
- Business rule degisiyorsa validator + service birlikte.
- Query degisiyorsa repository + mapper birlikte.
- Side effect degisiyorsa event/listener veya async handler birlikte.

### Do Not
- Tum depoyu tarama.
- Kurali birden fazla katmana kopyalama.
- Eski endpoint veya alan adini dokumanda tutma.
- Buyuk refactor'u is acil degilken tek turda yapma.

## 5. Technology Guidelines

### Spring Boot & Java Best Practices
- **Injection:** Prefer constructor injection (kullanımı) over field injection (`@Autowired`).
- **Separation of Concerns:** Keep controllers thin. All business logic must reside in `@Service` classes.
- **Data Transfer:** Always use DTOs for request and response payloads, never expose Domain/Entity models directly to the API layer.
- **Validation:** Use `jakarta.validation` constraints thoroughly on DTOs.

### React & Frontend Best Practices
- **Components:** Use functional components and React Hooks exclusively.
- **State Management:** Keep state as local as possible. Use Context API or global state managers only when prop-drilling becomes an issue.
- **Structure:** Follow a modular folder structure (`components/`, `hooks/`, `services/`, vb.).
- **Side Effects:** Ensure `useEffect` dependencies are accurate and perform cleanups to prevent memory leaks.

### API Contract & Response Convention
- **Response format:** Backend `ResultResponses` wrapper kullanır. Frontend'e başarıda direkt DTO, hata durumunda `{ error: "KOD", message: "..." }` gelir.
- **Frontend fetch:** Asla `useEffect` ile fetch yapma — her zaman React Query kullan.
- **Hata yakalama:** `error.response?.data?.error` ve `error.response?.data?.message` kullan.
- **Double unwrap yasak:** `response.data.data` değil, `response.data` kullan.
- **Mutation sonrası:** `queryClient.invalidateQueries` ile ilgili cache'i temizle.

## 6. Artifacts & Context

### 6.1. Behaviour & Architecture
- **Backend:** Spring Boot 3.5, Java 17, PostgreSQL, Redis, Flyway, Security, JPA, WebSocket
- **Frontend:** React 19, Vite, feature-based module yapisi
- **Domain:** listing, order, payment, escrow, ewallet, cart, offer, review, shipping, auth, campaign, showcase, favorite
- **AI Çalışma Kuralı:** Önce ilgili modül README'sini oku. Read order: root README -> `GEMINI.md` -> `.agents/CONTEXT.md` -> ilgili modul README -> kaynak kod. Büyük değişiklikleri küçük, doğrulanabilir adımlara böl.
- **Değişiklik Prensipleri:** Modüller arası soyutlamayı bozma. Hardcoded mesajları azalt. Boundary'leri koru. Domain rule'u service/validator tarafında tut. Repository'yi saf data access olarak kullan. DTO ile entity'yi karıştırma. Cache, event ve async yan etkileri ayrık düşün. Token azaltma kurallarına uy, özetleri davranış dosyasında tut, detayı koda bırak.

### 6.2. Agent Map & Read Order
- **Read Order:** 1. Root README → 2. `GEMINI.md` → 3. `.agents/CONTEXT.md` → 4. `.agents/PROJECT_REPORT.md` → 5. `.agents/skills/` → 6. Backend module README / Frontend feature README → 7. Source files
- **Fast Mental Model:** Root README explains product scope. `GEMINI.md` explains how to work. Module README explains local business rules. Source code is the final authority.
- **Best Practice Checklist:** Prefer the smallest file set that answers the question. Update docs when behavior changes. Treat cache, payment, escrow, and auth as high-risk areas. Favor existing patterns over new abstractions.

### 6.3. Artifacts Purpose
- Bu doküman (`GEMINI.md`), AI aracılarının hızlı bağlam edinmesi için tek kaynaklı, kısa ve karlı dokümanları tutar. Yeni bilgi sadece buraya eklenir; README'ler özeti tutar.

### 6.4. Todo & Active Tasks
**Tamamlanan:**
- [x] Checkout adımları (CheckoutStep, CheckoutProgressBar, CheckoutAddressStep, CheckoutPaymentStep, CheckoutReviewStep, CheckoutVerificationStep, CheckoutOrderSummary ve ActiveCouponsModal) tasarım sistemi uyumluluğu kapsamında refaktör edildi; cam efekti (glassmorphism), tüm mavi butonlar (#1466c6) ve hardcoded slate/indigo renkleri temizlendi.
- [x] ShoppingCartPage ve alt bileşenleri (CartItemCard, OrderSummary, uiPalette) projenin standart light teması ve Teal renk şemasına (design-system) göre tamamen refaktör edildi; mavi CTA'ler, warm-stone arka planları ve tüm hardcoded renkler temizlendi
- [x] AgreementsPage ve alt bileşenleri (AgreementCard, AgreementModal, AgreementsSection) detaylı tasarım/UX denetiminden geçirilerek refaktör edildi; sol menü aktif stili, sert sarı kart arka planları, modal overlay/derinlik hissi iyileştirildi, tüm hardcoded slate renkler temizlendi
- [x] CouponsPage (MyCouponsPage, PlatformCouponsPage, AdminCouponsPage) üzerindeki hardcoded renkler, gradyanlar, ve slates/violets temizlendi; tasarım sistemiyle entegre edildi ve skeletons SkeletonList bileşenine dönüştürüldü
- [x] OffersPage ve OfferTrackingCard tasarım revizyonu (1→2→3 adım göstergesi, 3'lü kutu grid kaldırıldı, kart sadeleştirildi, modal/skeleton standardize edildi)
- [x] UserReviewsPage (Alınan/Verilen Yorumlar) baştan aşağı elit bir tasarımla yenilendi, hardcoded stiller temizlendi.
- [x] AuraChatPage sayfası audit edildi (`AURA_CHAT_PAGE_AUDIT.md`) ve premium asistan görünümü ile baştan tasarlandı.
- [x] BuyerDashboardPage ve SellerDashboardPage analiz edilip (`BUYER_ANALYTICS_PAGE_AUDIT.md`) UI standartlarına çekildi.
- [x] AccountHubPage (Dashboard) analiz edildi (`ACCOUNT_HUB_PAGE_AUDIT.md`) ve hardcoded token kural ihlalleri semantic token'larla düzeltildi.
- [x] HomePage bileşenleri audit edildi (`HOME_PAGE_AUDIT.md`) ve tasarım standardı kural ihlalleri giderildi.
- [x] Frontend Header bileşeni analiz edildi (HEADER_AUDIT.md) ve glassmorphism/hardcoded token kural ihlalleri düzeltildi
- [x] `.agents` kurallarını netleştir
- [x] Skeleton & EmptyState merkezileştirildi
- [x] PageContainer standardize edildi
- [x] Tipografi ve border-radius temizliği
- [x] Frontend kalite skill'leri yazıldı (frontend-quality, design-system, frontend-audit)
- [x] Backend audit yapıldı — auth refactor, listing analizi
- [x] API response format standardize edildi (ResultResponses)
- [x] api-contract skill yazıldı
- [x] Auth cookie flow görsel test
- [x] Backend Legacy & Hardcoded Kod Taraması (BACKEND_LEGACY_AUDIT)
- [x] 3 sınıfta @Autowired -> constructor injection refaktörü yapıldı (OrderQueryService, UserService, ListingQueryService)
- [x] CloudinaryConfig System.out.println ifadeleri Logger ile değiştirildi
- [x] ListingMapper:376 boş catch bloğuna loglama eklendi
- [x] Eksik modül README'leri tamamlandı (core, user, checkout, shipping, pricing, email)
- [x] Frontend performans analizi yapıldı ve raporu hazırlandı (frontend_performance_audit.md)
- [x] Frontend performans optimizasyonları (React Query, WebSocket lazy load, storage debounce, ReviewButton loop fix) başarıyla tamamlandı ve build alındı
- [x] useListingSearch.js ve backend title filtresi entegrasyonu (V24__add_listing_title_search_index.sql ile) tamamlandı, build alındı
- [x] Sipariş listesinde istemci tarafı teslimat yöntemi filtresi, veritabanı sayfalama uyumsuzluğunu gidermek için sunucu tarafına (server-side JPQL) taşındı
- [x] İlan yönetiminde (Kendi İlanlarım) istemci tarafı durum (status) filtresi, veritabanı sayfalama uyumsuzluğunu gidermek için sunucu tarafına (server-side status query) taşındı
- [x] Membership (Premium) sistemi entegrasyonu (PlanValidator, JWT claim, Showcase/Aura quota limitleri, MembershipScheduler). Frontend için usePlan hook'u, API servisi ve PremiumUpgradeModal bileşeni geliştirildi.
- [x] Chat infinite scroll implementasyonu backend (OrderByCreatedAtDesc) ve frontend (useInfiniteQuery, scroll restoration) olarak başarıyla tamamlandı.
- [x] Premium/Membership UI tasarımı (PremiumUpgradeModal, AccountHub plan kartı ve Header badge/buton) premium/elit görsel standartlara (animasyonlu gold/amber CTA'ler, progress barlar ve görsel olarak zenginleştirilmiş kıyaslama satırları) göre tamamen yenilendi.
- [x] Premium üyelik ödemesi, `PaymentProcessor` üzerinden `MEMBERSHIP_PAYMENT` işlemi olarak entegre edildi; veritabanına payment kaydı oluşturulması, in-app bildirim ve custom Thymeleaf fatura e-postası (membership-confirmation.html) gönderimi ile frontend success toast geri bildirimi tamamlandı.
- [x] Tüm Controller endpoint'leri tarandı, raporlandı, path format tutarsızlıkları düzeltildi, public endpoint yetki kontrolü yapıldı ve test edilebilir bir Postman collection (`SecondHand_API.postman_collection.json`) oluşturuldu.

- [x] ListingCreation ödeme (Payment) işlemlerinde `listingTitle` ve `listingNo` alanlarının `null` kaydedilmesi sorunu `PaymentModuleAdapter` güncellenerek çözüldü.
- [x] İlan oluşturma formlarında (GenericListingForm) local storage cache'inin kullanıcı seçimlerini (pre-filter) ezmesi sorunu `restoreDraft` bayrağı eklenerek çözüldü. Artık sadece açıkça `restoreDraft: true` gönderildiğinde cache verisi yükleniyor, aksi takdirde kullanıcının girdiği güncel veriler gösteriliyor.
- [x] Backend Thymeleaf email şablonlarındaki tasarım tutarsızlıkları düzeltildi. Hardcoded indigo/blue vb. renkler ile Helvetica font ailesi temizlenerek projenin ana Teal (#0d9488) rengi ve Inter tipografisine çekildi. `PaymentNotificationService` içindeki raw enum (örn: LISTING_CREATION) metinleri yerelleştirildi.
- [x] Backend N+1 performans sorunları giderildi: `ChatRoomRepository`'ye `@EntityGraph(attributePaths={"participantIds"})`, `MessageRepository`'ye `@EntityGraph(attributePaths={"sender","recipient"})` eklendi. `Order.orderItems`, `User`, `Address`, `OrderItem` entity'lerine `@BatchSize(size=20)` eklenerek in-memory paging riski olmadan `1+N/20` seviyesine indirgendi. Build başarıyla doğrulandı.

**Aktif:**
- [ ] AI streaming endpoint testi

**Sonraki:**
- [ ] listing N+1 sorunu JPA log analizi
- [ ] Yeni özellik geliştirmesi — api-contract skill ile test et
- [ ] CI/CD pipeline kurulumu

### 6.5. Timeline
- **2026-06-19:** İlk AI destek doküman yapısı tasarlandı. Token azaltma odaklı çalışma ilkeleri belirlendi.
- **2026-06-20:** Frontend UI sprint tamamlandı (Skeleton, PageContainer, tipografi, border-radius). Backend audit yapıldı. Auth God Object refactor edildi. API response convention standardize edildi. 10 skill dosyası oluşturuldu.
- **2026-06-21:** Backend Legacy & Hardcoded Kod Taraması tamamlandı, `.agents/BACKEND_LEGACY_AUDIT.md` raporu oluşturuldu. Performans optimizasyonları (React Query, lazy-loading WebSockets, storage writes debouncing, ReviewButton loop fixes) uygulandı. Son olarak, backend arama API'sine `title` filtresi entegre edildi, `LOWER(title)` için `V24__add_listing_title_search_index.sql` Flyway migration'ı yazıldı ve frontend client-side search loops kaldırılarak debounced server-side paginated title aramaya geçildi. Hem frontend hem backend build'leri başarıyla doğrulandı. Sipariş listesinde teslimat yöntemi (kargo / elden teslimat) filtresi sunucu tarafında (server-side paginated JPQL) çalışacak şekilde entegre edildi, istemci tarafı süzme mantığı ve yerel state'ler temizlendi. Kendi ilanlarım sayfasındaki durum (status) bazlı local/client-side filtreleme kaldırıldı; backend `/my-listings` endpoint'ine opsiyonel `status` parametresi eklenerek `ListingRepository` dynamic JPQL sorgusu ile server-side paginated entegre edildi, hem backend hem frontend build'leri başarıyla doğrulandı. Frontend Header bileşeni incelendi, glassmorphism ihlali temizlenerek semantic theme token'lara geçirildi ve HEADER_AUDIT.md raporu oluşturuldu. HomePage bileşenleri (Hero, Showcase, GreatSellers vs.) incelenerek HOME_PAGE_AUDIT.md hazırlandı ve keyfi/hardcoded opacity, amber yıldız renkleri, cam efekti gibi tüm ui/tasarım borçları temizlendi. OffersPage ve OfferTrackingCard tasarım revizyonu tamamlandı; 1→2→3 adım göstergesi ve 3'lü kutu grid kaldırıldı, kart sadeleştirildi, skeleton/modal container standartları uygulandı. MyCouponsPage, PlatformCouponsPage and AdminCouponsPage bileşenleri temizlenerek tüm hardcoded renkler, gradyanlar ve slates/violets temizlendi; tasarım sistemine entegre edilerek skeletons SkeletonList bileşenine dönüştürüldü. AgreementsPage ve alt bileşenleri (AgreementCard, AgreementModal, AgreementsSection) detaylı tasarım/UX denetiminden geçirilerek refaktör edildi; sol menü aktif stili, sert sarı kart arka planları, modal overlay/derinlik hissi iyileştirildi, tüm hardcoded slate renkler temizlendi ve frontend-audit skill dosyası daha derinlemesine tasarım/yerleşim denetimleri yapacak şekilde güncellendi. ShoppingCartPage, CartItemCard, OrderSummary ve uiPalette modülleri detaylı tasarım/UX denetiminden geçirilerek refaktör edildi; ayrıksı mavi accent renkleri (#1466c6) ve warm-stone arka planları (#f4f3f1) temizlenerek projenin birincil Teal (#0d9488) renk standardına ve semantic token'larına geçildi. Checkout adımları (CheckoutStep, CheckoutProgressBar, CheckoutAddressStep, CheckoutPaymentStep, CheckoutReviewStep, CheckoutVerificationStep, CheckoutOrderSummary ve ActiveCouponsModal) tasarım sistemi uyumluluğu kapsamında refaktör edildi; cam efekti (glassmorphism), tüm mavi butonlar (#1466c6) ve hardcoded slate/indigo renkleri temizlendi.
- **2026-06-22:** Kullanıcı üyelik (Premium) modeli backend ve frontend sistemlerine eklendi. `User` entity'sine `MembershipPlan`, quota limitleri, günlük Aura kullanımları gibi field'lar eklendi. JWT tabanlı auth akışına `plan` bilgisi dahil edildi. Backend Showcase ve Gemini AI servislerine `PlanValidator` ile yetkilendirme (quota) limitleri koyuldu ve plan süresi dolan kullanıcılar için `MembershipScheduler` arka plan cron işlemleri eklendi. Frontend katmanında ise kullanıcıların hesap durumunu canlı olarak yansıtmak amacıyla `usePlan` custom hook'u ve `PremiumUpgradeModal` eklendi. Ayrıca Chat "Infinite Scroll" altyapısı başarıyla eklendi; veritabanı seviyesinde `OrderByCreatedAtDesc` kullanılarak sondan başa sayfalama yapıldı, frontend'de ise `useInfiniteQuery` ve `useLayoutEffect` entegrasyonu ile scroll pozisyonu zıplamaları önlendi. Premium/Membership UI bileşenleri (PremiumUpgradeModal, AccountHub plan kartı, HeaderProfileMenu) baştan aşağı elit ve modern bir tasarımla yenilendi; cam efekti veya keyfi renkler yerine marka Teal tonu ile Premium Gold/Amber tonları birleştirildi, görsel kota ilerleme çubukları eklendi ve tüm frontend test build'leri doğrulandı. Premium ödemeleri, Showcase ve Listing Fee ile aynı veritabanı ve payment/e-wallet altyapısına (`PaymentProcessor`) taşındı. Ödeme başarısında in-app `PAYMENT_SUCCESS` bildirimi ile özel detaylar içeren `membership-confirmation` HTML e-posta faturası tetiklendi. Frontend upgrade modalına aniden kapanma sorununu çözmek üzere success toast (`showSuccess`) entegre edildi. Tüm backend ve frontend build doğrulamaları sağlandı.- **2026-06-26:** Backend N+1 performans sorunu tespiti ve düzeltmesi tamamlandı. `ChatRoomRepository` ve `MessageRepository` için `@EntityGraph` ile eager-fetch sağlandı. `Order`, `OrderItem`, `User`, `Address` entity'lerine `@BatchSize(size=20)` eklenerek Hibernate'in koleksiyon yüklemelerini `IN` sorgusuyla toplu (batched) yapması sağlandı. Bu yaklaşım, in-memory pagination riskini tamamen ortadan kaldırarak güvenli bir `1+N/20` paternine geçişi mümkün kıldı.


