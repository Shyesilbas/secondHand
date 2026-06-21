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
Mevcut skill'ler: repo-navigator, domain-editor, documentation-sync, token-saver, code-quality-control, frontend-quality, design-system, frontend-audit, backend-audit, **api-contract**

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
- [x] `.agents` kurallarını netleştir
- [x] Skeleton & EmptyState merkezileştirildi
- [x] PageContainer standardize edildi
- [x] Tipografi ve border-radius temizliği
- [x] Frontend kalite skill'leri yazıldı (frontend-quality, design-system, frontend-audit)
- [x] Backend audit yapıldı — auth refactor, listing analizi
- [x] API response format standardize edildi (ResultResponses)
- [x] api-contract skill yazıldı
- [x] Auth cookie flow görsel test

**Aktif:**
- [ ] AI streaming endpoint testi
- [ ] Eksik modül README'leri (core, user, checkout, shipping, pricing, email)

**Sonraki:**
- [ ] listing N+1 sorunu JPA log analizi
- [ ] Yeni özellik geliştirmesi — api-contract skill ile test et
- [ ] CI/CD pipeline kurulumu

### 6.5. Timeline
- **2026-06-19:** İlk AI destek doküman yapısı tasarlandı. Token azaltma odaklı çalışma ilkeleri belirlendi.
- **2026-06-20:** Frontend UI sprint tamamlandı (Skeleton, PageContainer, tipografi, border-radius). Backend audit yapıldı. Auth God Object refactor edildi. API response convention standardize edildi. 10 skill dosyası oluşturuldu.
