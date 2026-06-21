# Backend Legacy & Hardcoded Kod Taraması
_Tarih: 2026-06-21_

## Özet
| Kategori | Tespit Sayısı | Risk |
|----------|--------------|------|
| Hardcoded Değer | 79 | 🟡 |
| Legacy Pattern | 41 | 🔴 |
| Güvenlik Riski | 253 | 🔴 |
| Kod Kalitesi | 76 | 🟡 |
| **Toplam** | 449 | |

## 1. Hardcoded Değerler
| Dosya | Satır | Değer | Önerilen Çözüm |
|-------|-------|-------|----------------|
| OrderCompensationPersistenceService.java | 58 | `if (item == null || delta <= 0) return;` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| OrderItemCompensationPlanner.java | 81 | `if (availableToCancel <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| OrderItemCompensationPlanner.java | 107 | `if (availableToRefund <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| OrderItemCompensationPlanner.java | 186 | `if (itemSubtotal.compareTo(BigDecimal.ZERO) <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| OrderItemCompensationPlanner.java | 200 | `if (item.getQuantity() == null || item.getQuantity() <= 0 || compensatedQuantity >= item.getQuantity()) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| OfferValidator.java | 32 | `if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| VerificationService.java | 123 | `if (verificationAttemptLeft <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| EWalletValidator.java | 28 | `if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| EWalletValidator.java | 82 | `if (user == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| EWalletValidator.java | 93 | `if (userId == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| PasswordService.java | 129 | `if (attemptsLeft <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| CampaignValidator.java | 50 | `if (campaign.getValue().compareTo(BigDecimal.ZERO) <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| CampaignController.java | 57 | `if (resolvedSize <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| CartValidator.java | 60 | `if (availableStock <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| EscrowService.java | 276 | `if (itemSubtotal.compareTo(BigDecimal.ZERO) <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| Listing.java | 154 | `if (restoredQuantity <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| HouseValidator.java | 17 | `if (listing.getSquareMeters() == null || listing.getSquareMeters() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| HouseValidator.java | 21 | `if (listing.getRoomCount() == null || listing.getRoomCount() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| LandValidator.java | 17 | `if (listing.getSquareMeters() == null || listing.getSquareMeters() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| VanValidator.java | 30 | `if (listing.getWheels() != null && listing.getWheels() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| TruckValidator.java | 30 | `if (listing.getWheels() != null && listing.getWheels() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| MotorcycleValidator.java | 17 | `if (listing.getEngineCapacity() == null || listing.getEngineCapacity() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| CarValidator.java | 36 | `if (listing.getWheels() != null && listing.getWheels() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| BicycleValidator.java | 17 | `if (listing.getWheels() != null && listing.getWheels() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| HeadphonesValidator.java | 30 | `if (listing.getBatteryLifeHours() == null || listing.getBatteryLifeHours() <= 0) {` | Comparison <= 0 (check if magic number context). Consider using constants or configurations. |
| ... | ... | ... | (54 adet diğer hardcoded değer listelenmedi) |

## 2. Legacy Pattern'ler
| Dosya | Satır | Pattern | Önerilen Çözüm |
|-------|-------|---------|----------------|
| OrderQueryService.java | 48 | `@Autowired` field | Field injection. Replace with constructor injection. |
| UserService.java | 40 | `@Autowired` field | Field injection. Replace with constructor injection. |
| ListingQueryService.java | 46 | `@Autowired` field | Field injection. Replace with constructor injection. |
| JwtUtils.java | 113 | `new Date()` | Legacy date class. Replace with `Instant` or `LocalDateTime`. |
| JwtUtils.java | 114 | `new Date()` | Legacy date class. Replace with `Instant` or `LocalDateTime`. |
| JwtUtils.java | 143 | `new Date()` | Legacy date class. Replace with `Instant` or `LocalDateTime`. |
| JwtUtils.java | 189 | `new Date()` | Legacy date class. Replace with `Instant` or `LocalDateTime`. |
| JwtUtils.java | 190 | `new Date()` | Legacy date class. Replace with `Instant` or `LocalDateTime`. |
| CloudinaryConfig.java | 18 | `System.out.println` | Console logging. Replace with SLF4J `log.info`/`log.debug`. |
| CloudinaryConfig.java | 19 | `System.out.println` | Console logging. Replace with SLF4J `log.info`/`log.debug`. |
| CloudinaryConfig.java | 20 | `System.out.println` | Console logging. Replace with SLF4J `log.info`/`log.debug`. |
| FavoriteListRepository.java | 106 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderRepository.java | 28 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderRepository.java | 59 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 91 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 100 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 110 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 119 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 135 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 146 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 160 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 168 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 178 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| OrderItemRepository.java | 189 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| NotificationRepository.java | 17 | `@Query` string split | Multi-line JPQL/SQL concat via `+`. Safe compile-time concat, but consider text blocks. |
| ... | ... | ... | (16 adet diğer legacy pattern listelenmedi) |

## 3. Güvenlik Riskleri
| Dosya | Satır | Risk | Önerilen Çözüm |
|-------|-------|------|----------------|
| JwtUtils.java | 123 | Keyword 'log.debug("JWT token...' in logger | Verify that plain credentials/tokens are not leaked. |
| JwtUtils.java | 126 | Keyword 'log.warn("Malformed ...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthenticationFilter.java | 81 | Keyword 'log.debug("Token ext...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthenticationFilter.java | 86 | Keyword 'log.debug("Token ext...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthenticationFilter.java | 129 | Keyword 'log.debug("JWT token...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthenticationFilter.java | 132 | Keyword 'log.warn("Malformed ...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthenticationFilter.java | 184 | Keyword 'log.info("Token acce...' in logger | Verify that plain credentials/tokens are not leaked. |
| WebSocketSecurityConfig.java | 81 | Keyword 'log.warn("Rejecting ...' in logger | Verify that plain credentials/tokens are not leaked. |
| WebSocketSecurityConfig.java | 93 | Keyword 'log.warn("Invalid JW...' in logger | Verify that plain credentials/tokens are not leaked. |
| WebSocketSecurityConfig.java | 130 | Keyword 'log.debug("Using tok...' in logger | Verify that plain credentials/tokens are not leaked. |
| WebSocketConfig.java | 75 | Keyword 'log.info("WebSocket ...' in logger | Verify that plain credentials/tokens are not leaked. |
| CookieUtils.java | 31 | Keyword 'log.debug("Access to...' in logger | Verify that plain credentials/tokens are not leaked. |
| CookieUtils.java | 44 | Keyword 'log.debug("Refresh t...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuditAspect.java | 125 | Keyword 'log.info("Password c...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuditAspect.java | 131 | Keyword 'log.warn("Password c...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuditLogService.java | 139 | Keyword 'log.info("Audit log ...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuditLogService.java | 148 | Keyword 'log.error("Failed to...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthController.java | 61 | Keyword 'log.info("Login succ...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthController.java | 100 | Keyword 'log.info("Token refr...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthController.java | 109 | Keyword 'log.info("Token refr...' in logger | Verify that plain credentials/tokens are not leaked. |
| AuthController.java | 125 | Keyword 'log.info("OAuth comp...' in logger | Verify that plain credentials/tokens are not leaked. |
| PasswordService.java | 52 | Keyword 'log.info("Password c...' in logger | Verify that plain credentials/tokens are not leaked. |
| PasswordService.java | 73 | Keyword 'log.info("Password c...' in logger | Verify that plain credentials/tokens are not leaked. |
| PasswordService.java | 79 | Keyword 'log.info("Password r...' in logger | Verify that plain credentials/tokens are not leaked. |
| PasswordService.java | 108 | Keyword 'log.info("Password r...' in logger | Verify that plain credentials/tokens are not leaked. |
| ... | ... | ... | (58 adet diğer güvenlik riski listelenmedi) |

## 4. Kod Kalitesi Sorunları
| Dosya | Satır | Sorun | Önerilen Çözüm |
|-------|-------|-------|----------------|
| FavoriteListService.java | - | Service class has 339 lines | Split this service into domain-specific sub-services. |
| OfferService.java | - | Service class has 319 lines | Split this service into domain-specific sub-services. |
| EnumReadService.java | - | Service class has 371 lines | Split this service into domain-specific sub-services. |
| EWalletService.java | - | Service class has 331 lines | Split this service into domain-specific sub-services. |
| CouponService.java | - | Service class has 327 lines | Split this service into domain-specific sub-services. |
| ForumService.java | - | Service class has 381 lines | Split this service into domain-specific sub-services. |
| MemoryService.java | - | Service class has 584 lines | Split this service into domain-specific sub-services. |
| AuraListingSearchOrchestrator.java | - | Service class has 312 lines | Split this service into domain-specific sub-services. |
| EscrowService.java | - | Service class has 310 lines | Split this service into domain-specific sub-services. |
| ShowcaseService.java | - | Service class has 309 lines | Split this service into domain-specific sub-services. |
| PublicEndpointRegistry.java | 78 | `} else if (mappingInfo.getPatt` (Nested if statements at depth 4) | Refactor using guard clauses or split methods. |
| LocationCatalogService.java | 143 | `if (neighborhoodsNode != null ` (Nested if statements at depth 4) | Refactor using guard clauses or split methods. |
| LocationCatalogService.java | 206 | `if (districtKey.equals(d.get("` (Nested if statements at depth 4) | Refactor using guard clauses or split methods. |
| LocationCatalogService.java | 209 | `if (nbNodes != null)` (Nested if statements at depth 5) | Refactor using guard clauses or split methods. |
| PriceCalculationEngine.java | 149 | `if (share.compareTo(remainingD` (Nested if statements at depth 4) | Refactor using guard clauses or split methods. |
| ListingMapper.java | 376 | `} catch (Exception ignored) {}` | Empty catch block. Log exception or propagate. |
| SecurityConfig.java | 55 | `public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {` | General exception thrown. Specify concrete exception class. |
| SecurityConfig.java | 201 | `public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {` | General exception thrown. Specify concrete exception class. |
| RealEstateDataInitializer.java | 74 | `private JsonNode loadCatalog() throws Exception {` | General exception thrown. Specify concrete exception class. |
| RealEstateSpecCatalogService.java | 50 | `private void loadCatalog() throws Exception {` | General exception thrown. Specify concrete exception class. |
| VehicleDataInitializer.java | 126 | `private List<VehicleBrandCatalogDto> loadBrandsMetadata() throws Exception {` | General exception thrown. Specify concrete exception class. |
| VehicleDataInitializer.java | 138 | `private List<VehicleSeedModelDto> loadBrandModelsFile(String fullPath) throws Exception {` | General exception thrown. Specify concrete exception class. |
| ClothingDataInitializer.java | 58 | `private JsonNode loadJson(String path) throws Exception {` | General exception thrown. Specify concrete exception class. |
| ElectronicDataInitializer.java | 93 | `private List<ElectronicBrandCatalogDto> loadBrandsIndex() throws Exception {` | General exception thrown. Specify concrete exception class. |
| ElectronicDataInitializer.java | 103 | `private List<ElectronicSeedModelDto> loadBrandModelsFile(String fullPath) throws Exception {` | General exception thrown. Specify concrete exception class. |
| ... | ... | ... | (3 adet diğer kod kalitesi sorunu listelenmedi) |

## 5. TODO / FIXME Listesi
| Dosya | Satır | İçerik |
|-------|-------|--------|
| Yok | - | Bulgu tespit edilmedi. |

## Öncelik Sırası
1. **Kritik (🔴):** `@Autowired` field injection kullanan sınıfların (`OrderQueryService`, `UserService`, `ListingQueryService`) constructor injection ile refactor edilmesi.
2. **Kritik (🔴):** Hassas olabilecek URL veya yetkilendirme kontrollerinin, rol bazlı endpoint'lerde (`/api/v1/seller/campaigns` gibi) controller bazında `@PreAuthorize` ile kısıtlanması veya `SecurityConfig` içindeki rol eşleşmelerinin kontrol edilmesi.
3. **Orta (🟡):** `CloudinaryConfig` içerisindeki `System.out.println` ifadelerinin kaldırılıp yerine Logger (`log.info`/`log.debug`) kullanılması.
4. **Orta (🟡):** 300 satırı aşan God Object servislerinin (`MemoryService` (584 satır), `ForumService` (381 satır), `EnumReadService` (371 satır)) alt servislere bölünmesi.
5. **Düşük (🟢):** `ListingMapper:376` içerisindeki boş catch bloğunun temizlenmesi/loglanması ve `throws Exception` kullanan metotların spesifik exception sınıflarına dönüştürülmesi.

## Temizlik Tahmini
| Öncelik | İş | Dosya Sayısı |
|---------|-----|-------------|
| 🔴 Kritik | Constructor injection refactor & Controller yetki kontrolleri | 15 |
| 🟡 Orta | God Object servis parçalama & `System.out` temizliği | 12 |
| 🟢 Düşük | Boş catch temizliği & `throws Exception` güncellemesi | 13 |
