---
name: Backend Audit
description: Herhangi bir backend paketi, servis veya domain için mimari kalite raporu oluşturur. "Analiz et", "audit et", "incele", "mimari sorunları bul", "rapor çıkar", "ne durumda" gibi ifadelerle tetiklenir.
triggers:
  - "analiz et"
  - "audit et"
  - "incele"
  - "rapor çıkar"
  - "mimari sorunları bul"
  - "ne durumda"
  - "teknik borç"
---

# Backend Audit

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`
> Mimari kurallar: `GEMINI.md`
> Kod kalite kuralları: `.agents/skills/code-quality-control/SKILL.md`

## Tetiklenme
Bir paket, servis veya domain için mimari ve kod kalitesi analizi istendiğinde.
Paket ismi verilmezse sor: "Hangi paketi veya domain'i analiz edeyim?"

## Çalışma Adımları

### 1. Dosyaları Tara
Hedef paket ve bağlı sınıfları tespit et — içerik okuma, sadece sınıf isimlerini listele:
- `*Controller.java` → endpoint sayısı, HTTP method'ları
- `*Service.java` / `*ServiceImpl.java` → servis bölünmesi, God Object riski
- `*Repository.java` → JPA mı, custom query var mı, N+1 riski
- `*Validator.java` / `*Policy.java` → validasyon katmanı
- `*Mapper.java` → MapStruct mı, manuel mi
- `*Event.java` / `*Listener.java` → event-driven yapı
- `*Aspect.java` → AOP kullanımı
- Varsa paket README'sini oku

### 2. Raporu Oluştur

Raporu `.agents/[PAKET_ADI]_BACKEND_AUDIT.md` olarak kaydet:

```markdown
# [Paket Adı] Backend Audit
_Tarih: [tarih]_

## Genel Değerlendirme
[Katmanlı mimari ne kadar tutarlı, sorumluluk ayrımı nasıl]

## Sınıf Haritası
| Katman | Sınıflar | Adet | Yorum |
|--------|----------|------|-------|
| Controller | | | |
| Service | | | |
| Repository | | | |
| Validator/Policy | | | |
| Mapper | | | |
| Event/Listener | | | |

## Tespit Edilen Sorunlar
| Sorun | Sınıf/Katman | Risk | Çözüm Önerisi |
|-------|-------------|------|---------------|

## Katman Analizi

### Controller
[Thin mı? İş mantığı sızmış mı?]

### Service
[God Object var mı? Transaction yönetimi doğru mu?]

### Validasyon
[Validator/Policy tutarlı mı? Eksik alan var mı?]

### Repository
[N+1 riski, custom query kullanımı]

### Mapper
[MapStruct mı, manuel mi? Tutarlılık]

### Event/Async
[Loose coupling sağlanmış mı? Listener yan etkileri]

## Transaction & Güvenlik Riski
[Para, escrow, kritik domain varsa rollback senaryoları]

## Cache Kullanımı
[Bu paket cache kullanıyor mu? Invalidation doğru mu?]

## README Durumu
[README var mı, güncel mi, eksik alan var mı]

## Öncelik Sırası
1. [En kritik — production riski]
2. ...

## Genel Skor
| Kategori | Puan (1-5) |
|----------|-----------|
| Katman Ayrımı | |
| Transaction Yönetimi | |
| Validasyon | |
| Kod Tekrarı | |
| Dokümantasyon | |
| **Ortalama** | |
```

### 3. Düzeltme Onayı İste
Raporu oluşturduktan sonra sor:
"Rapor hazır. Düzeltmeleri uygulamamı ister misin?"
Onay gelirse `.agents/skills/domain-editor/SKILL.md` kurallarıyla minimum diff uygula.

## Kontrol Listesi (Her Audit'te Bak)

### Katman İhlalleri
- [ ] Controller'da iş mantığı var mı?
- [ ] Service'te direkt HTTP response nesnesi var mı?
- [ ] Repository'de iş kuralı var mı?
- [ ] Entity API'ye direkt dönülmüş mü? (DTO eksikliği)

### Transaction Riski
- [ ] Para/escrow işlemleri `@Transactional` altında mı?
- [ ] Rollback senaryosu tanımlı mı?
- [ ] Nested transaction varsa `REQUIRES_NEW` bilinçli mi?
- [ ] Outbox pattern gereken yer uygulanmış mı?

### Validasyon
- [ ] Domain kuralı service/validator'da mı, controller'da değil mi?
- [ ] Custom exception kullanılıyor mu?
- [ ] Hata mesajı client'a bilgi sızdırıyor mu?

### Repository
- [ ] N+1 riski var mı? (`@OneToMany` lazy load sorunu)
- [ ] `findAll()` büyük tabloda çağrılıyor mu?
- [ ] Pagination uygulanmış mı?

### Cache
- [ ] Cache invalidation tetikleniyor mu güncelleme sonrası?
- [ ] Cache key çakışması riski var mı?
- [ ] TTL tanımlı mı?

### Event/Async
- [ ] Listener ana transaction'ı bozuyor mu?
- [ ] Event yayını domain kararı tamamlandıktan sonra mı?
- [ ] Async listener hata durumunu handle ediyor mu?

## Çıktı Formatı
- Sorunları tabloya yaz — genel tavsiye değil, somut sınıf ve katman
- Her sorun için tek satır çözüm önerisi
- Öncelik: kritik (production riski) → orta (teknik borç) → düşük (kozmetik)
- Rapor bittikten sonra "Düzelteyim mi?" sor, onaysız değişiklik yapma
