---
name: Frontend Audit
description: Herhangi bir frontend sayfası, component veya modülü için tasarım ve kod kalitesi raporu oluşturur. "Şunu analiz et", "tasarım sorunlarını bul", "özet çıkar", "audit et", "incele" gibi ifadelerle tetiklenir.
triggers:
  - "analiz et"
  - "audit et"
  - "incele"
  - "özet çıkar"
  - "tasarım sorunlarını bul"
  - "ne durumda"
  - "rapor çıkar"
---

# Frontend Audit

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`
> Tasarım token'ları: `src/common/theme/theme.js`
> Tasarım kuralları: `.agents/skills/design-system/SKILL.md`
> Kod kalite kuralları: `.agents/skills/frontend-quality/SKILL.md`

## Tetiklenme
Bir sayfa, component veya modül için tasarım ve/veya kod kalitesi analizi istendiğinde.
Sayfa ismi verilmezse kullanıcıya sor: "Hangi sayfayı veya modülü analiz edeyim?"

## Çalışma Adımları

### 1. Dosyaları Tara
Hedef sayfa ve bağlı component'leri tespit et:
- Ana sayfa dosyası (`*Page.jsx`)
- Sayfanın import ettiği component'ler
- Sayfanın kullandığı hook'lar (`hooks/`)
- Varsa modal ve panel component'leri

Her dosyada şunlara bak:
- **Layout & Sayfa Yerleşimi**: Flex/Grid kullanımı, bilgi yoğunluğu (cramped or too sparse), elemanların hizalanması, boşlukların dengeli dağılımı, sticky/sabit alanların kullanımı.
- **Görsel Hiyerarşi & Tipografi**: Başlıkların öne çıkma derecesi, alt detayların okunabilirliği, meta bilgilerin görsel olarak ikincil düzeyde düzgün gruplanıp gruplanmadığı.
- **Kullanıcı Akışı & UX/UI**: Form elemanları, butonlar ve aksiyonların konumu (ulaşılabilirlik), tıklanabilir alanların belirginliği (hover/focus animasyonları), modal/drawer geçişleri.
- **Sunum & Kart Tasarımları**: Bilginin sadece düz çizgilerle değil, derinlik hissi veren premium kart tasarımları, gölgeler (`shadow-sm`/`shadow-md`), ve temiz gruplamalarla sunulması.
- **Renkli Durumlar & Badge'ler**: Statü badge'lerinin, hata/uyarı kutularının çok parlak/çiğ renkler yerine pastel ve premium tonlarda olmasının sağlanması.
- **Loading & Empty States**: İskelet yükleme (skeleton) ekranlarının tasarımsal bütünlüğü, veri olmadığında gösterilen boş durum (empty state) görselleri ve açıklayıcı metinlerin kalitesi.
- **Mobil & Responsive**: Mobilde elemanların kayması, taşması veya aşırı sıkışması, kritik aksiyonların parmak hizasına yakınlığı.
- **Yasaklı Pattern'ler**: Renk token ihlalleri, gradient, kontrolsüz glassmorphism, arbitrary (`-[px]`) Tailwind değerleri.

### 2. Raporu Oluştur

Raporu `.agents/[SAYFA_ADI]_AUDIT.md` olarak kaydet:

```markdown
# [Sayfa Adı] Tasarım Audit
_Tarih: [tarih]_

## Genel Yapı
[Layout, grid yapısı, kaç kolon, sticky var mı, mobil davranış]

## Component Haritası
[Hangi component nerede, hiyerarşi — maksimum 3 seviye]

## Tespit Edilen Tasarım Sorunları
| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|

## Renk & Token Tutarsızlıkları
[Hardcoded kalan değerler ve karşılık gelen token'lar]

## Spacing Sorunları
[Tutarsız padding/margin'ler]

## CTA & Buton Analizi
[Ana CTA'lar, hiyerarşi doğru mu, butonlar token'a uygun mu]

## Mobil Uyum
[Responsive davranış, sorunlar]

## Öncelik Sırası
1. [En kritik — kullanıcı deneyimini en çok bozan]
2. ...
```

### 3. Düzeltme Onayı İste
Raporu oluşturduktan sonra şunu sor:
"Rapor hazır. Düzeltmeleri uygulamamı ister misin?"
Onay gelirse `.agents/skills/domain-editor/SKILL.md` mantığıyla minimum diff uygula.

## Kontrol Listesi (Her Audit'te Bak)

### Yasaklı Pattern'ler
- [ ] `bg-gradient-to-*` gradient kullanımı var mı?
- [ ] `backdrop-blur-*` glassmorphism var mı?
- [ ] `bg-*/opacity` kombinasyonu var mı?
- [ ] `text-[px]` arbitrary tipografi var mı?
- [ ] `rounded-[px]` arbitrary radius var mı?
- [ ] `shadow-[...]` arbitrary shadow var mı?
- [ ] `py-3`, `py-4`, `py-5` büyük buton padding var mı?
- [ ] `rounded-3xl` veya üstü var mı?
- [ ] `localStorage` doğrudan component içinde mi?
- [ ] `useEffect` içinde fetch/axios var mı?
- [ ] `map()` içinde `key={index}` var mı?

### Token Kontrolü
- [ ] Renkler semantic token mı? (`text-text-primary`, `bg-background-secondary`)
- [ ] Buton rengi `bg-primary` mi?
- [ ] Border `border-border-light` mi?
- [ ] Shadow `shadow-sm` veya `shadow-md` mi?

### CTA Hiyerarşisi
- [ ] Birincil CTA: `bg-primary text-white rounded-lg py-2.5`
- [ ] İkincil CTA: `bg-secondary-light text-primary rounded-lg py-2.5`
- [ ] Avatar: `rounded-full`
- [ ] Mobilde kritik CTA erişilebilir mi?

## Çıktı Formatı
- Sorunları tabloya yaz — genel tavsiye değil, somut dosya ve satır
- Her sorun için çözüm önerisi tek satırda
- Öncelik sırası: kritik (kural ihlali) → orta (tutarsızlık) → düşük (kozmetik)
- Rapor bittikten sonra "Düzelteyim mi?" sor, onaysız değişiklik yapma
