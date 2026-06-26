---
name: Feature Planner
description: Yeni bir özellik veya değişiklik için uçtan uca implementasyon planı oluşturur. "Plan yap", "nasıl yaparız", "özellik ekleyelim", "implement edelim" gibi ifadelerle tetiklenir.
triggers:
  - "plan yap"
  - "nasıl yaparız"
  - "özellik ekleyelim"
  - "implement edelim"
  - "feature ekle"
  - "nasıl çalışır"
  - "mimari nasıl olur"
---

# Feature Planner

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`
> API contract kuralları: `.agents/skills/api-contract/SKILL.md`
> Backend kalite kuralları: `.agents/skills/code-quality-control/SKILL.md`
> Frontend kalite kuralları: `.agents/skills/frontend-quality/SKILL.md`
> Tasarım kuralları: `.agents/skills/design-system/SKILL.md`

## Tetiklenme
Yeni bir özellik, değişiklik veya entegrasyon için plan istendiğinde.
Özellik net değilse önce sor: "Ne yapmak istiyorsun? Hangi domain'i etkiliyor?"

## Çalışma Adımları

### 1. Etki Analizi
Önce şunları belirle:
- Hangi domain'ler etkileniyor?
- Yüksek riskli alan var mı? (payment, escrow, auth, order, listing)
- Mevcut bir yapıya mı ekleniyor, yoksa sıfırdan mı?
- Frontend + backend ikisi de değişiyor mu?

### 2. Teknik Kararlar
Plana başlamadan şu kararları ver:

**Backend:**
- Yeni entity/tablo gerekiyor mu? → Flyway migration gerekir
- Mevcut servise mi ekleniyor, yeni servis mi? → God Object riski var mı?
- Event-driven mi olmalı? → Başka domain'leri etkiliyor mu?
- Cache etkisi var mı? → Invalidation gerekir mi?
- Scheduler gerekiyor mu? → Cron job mu, event mi?

**Frontend:**
- Yeni sayfa mı, mevcut sayfaya ekleme mi?
- Yeni hook mu, mevcut hook'a ekleme mi?
- Modal mı, drawer mı, inline mı?
- React Query key'i ne olacak?

### 3. Plan Formatı

Planı şu formatta yaz:

```markdown
# [Özellik Adı] — Implementasyon Planı

## Özet
[1-2 cümle: ne yapıyor, neden gerekli]

## Etkilenen Domain'ler
[Liste — yüksek riskli olanları 🔴 ile işaretle]

## Teknik Kararlar
[Yukarıdaki soruların cevapları]

## Open Questions
[Kullanıcının karar vermesi gereken belirsiz noktalar]

## Proposed Changes

### Backend
#### [NEW/MODIFY] [DosyaAdı.java]
- Ne ekleniyor/değiştiriliyor — tek cümle
- Neden — tek cümle

### Frontend
#### [NEW/MODIFY] [DosyaAdı.jsx/js]
- Ne ekleniyor/değiştiriliyor
- Neden

### Database
#### [NEW] Flyway Migration
- Ne ekleniyor

## API Contract
HTTP Method: 
Path: /api/v1/[domain]/[kaynak]
Auth: Required / Public
Request: [DTO alanları]
Response: [DTO alanları]
Hata Kodları: [KOD → açıklama]

## Risk Analizi
| Risk | Seviye | Önlem |
|------|--------|-------|
| | 🔴/🟡/🟢 | |

## Verification Plan
### Automated
- Build kontrolü

### Manual
- [Adım adım test senaryosu]

## User Review Required
[Kullanıcının onaylaması gereken kararlar — fiyatlandırma, iş kuralı, UX tercihi]
```

## Kurallar

### Planı Yazarken
- Genel Java/Spring/React tavsiyesi yazma — sadece bu projeye özel
- Her dosya değişikliği için neden değiştiğini yaz
- `User Review Required` bölümünü atlama — kullanıcının karar vermesi gereken her şeyi buraya koy
- Risk seviyesi olmadan plan yazma
- Büyük değişiklikleri küçük adımlara böl

### Yüksek Riskli Alanlarda
- `payment`, `escrow`, `ewallet` → Transaction ve rollback senaryosunu yaz
- `auth` → Token/session etkisini belirt
- `listing` → Cache invalidation zincirini yaz
- `order` → State machine etkisini kontrol et
- `ai/Aura` → Rate limit ve Gemini API maliyetini değerlendir

### Onay Almadan Yapma
- Flyway migration içeriğini kullanıcı onaylamadan yazma
- Para akışı içeren işlemlerde iş kuralını kullanıcı onaylamadan belirleme
- Büyük refactor planı kullanıcı onaylamadan uygulama

### Plan Sonrası
- "Onaylıyor musun?" diye sor
- Onay gelince api-contract skill'i tetikle
- Uygulama bittikten sonra GEMINI.md ve CONTEXT.md güncelle

## Referans Örnekler

### İyi Plan Örneği
Membership sistemi planı:
- Domain analizi yapıldı (user, ewallet, showcase, ai)
- JWT claim kararı kullanıcıyla birlikte alındı
- Fiyatlandırma kullanıcıya soruldu
- Scheduler gerekliliği belirlendi
- Her dosya için neden değiştiği yazıldı

### Kaçınılacak
- "Bir servis ekle" — hangi servis, nereye, neden?
- "Frontend'i güncelle" — hangi dosya, ne değişiyor?
- Risk analizi olmadan plan sunmak
- Kullanıcı kararı gereken şeyleri varsayımla geçmek
