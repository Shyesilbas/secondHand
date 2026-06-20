# UI Tutarsızlık Raporu
_Tarih: 2026-06-20_

## Genel Skor
| Kategori | Puan (1-5) | Yorum |
|----------|-----------|-------|
| Layout & Container | 2 | `max-w-6xl`, `max-w-7xl` ve arbitrary `max-w-[1220px]` gibi farklı container genişlikleri var. Ortak bir sayfa layout yapısı eksik. |
| Card Sistemi | 2 | Yuvarlatma (radius) değerleri çok dağınık. `rounded-xl`, `rounded-2xl`, `rounded-[24px]`, `rounded-[32px]`, `rounded-[2.5rem]` bir arada kullanılıyor. Gölgeler (shadow) modülden modüle değişiyor. |
| Tipografi | 2 | Başlık (heading) boyutları ve font ağırlıkları standart dışı. Örneğin H1 bir sayfada `text-3xl font-bold`, diğerinde `text-[26px] font-extrabold`, diğerinde `text-2xl font-black`. |
| Buton Sistemi | 3 | Genel buton renk paleti toparlanmış durumda fakat padding'ler (`px-6 py-3` vs `px-8 py-3.5`) kendi içinde tutarsız. |
| Spacing | 2 | Marjin ve padding kullanımlarında Tailwind standart ölçeği (`p-4`, `p-6`, `p-8`) yerine sık sık custom veya beklenmeyen boşluklar (`p-10`, `pt-5`) mevcut. |
| Form Elemanları | 3 | Çoğunlukla benzer input kullanımları var ancak bazı modüllerde validation mesajı ve labellar tutarsız boşluklara sahip. |
| Loading/Empty State | 1 | Merkezi bir `<Skeleton />` bileşeni yok. Neredeyse tüm sayfalarda manuel olarak `[...Array(x)].map` ve `animate-pulse` içeren spagetti kod blokları yazılmış. Empty State'ler de aynı şekilde her modülde farklı div'ler olarak inşa edilmiş. |
| Modal/Dialog | 2 | Modalların `max-width` ve `max-height` (`92vh` vs `90vh`) değerleri, radius'ları (`rounded-3xl` vs `rounded-[2.5rem]`) farklılık gösteriyor. |
| İkon Kullanımı | 4 | Çoğunlukla `lucide-react` tercih edilmiş, nispeten tutarlı. |
| **Genel Ortalama** | **2.3** | Çok hızlı özellik geliştirildiği için kopyala-yapıştır ile kod üretilmiş; tasarım sistemi prensiplerinden uzaklaşılmış. |

## Kritik Tutarsızlıklar (Hemen Göze Çarpıyor)

### 1. Layout Container Genişlikleri
**Sorun:** Her sayfa veya modal için rastgele max-width'ler atanmış.
**Nerede:** `listing` (`max-w-[1220px]`), `cart` (`max-w-6xl` ve `7xl`), `campaign` (`max-w-6xl`), `comparison` (`max-w-7xl`).
**Referans (doğru olan):** Ekran standartı olarak `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` kullanılmalı (örn. `CheckoutPage`).

### 2. Başlık ve Tipografi Hiyerarşisi
**Sorun:** Sayfa başlıkları (H1/H2) yapısal olarak birbirine hiç benzemiyor. Arbitrary px değerleri ve değişken font-weight'ler var.
**Nerede:** `listing` (`text-[26px] font-extrabold`), `reviews` (`text-3xl font-bold`), `showcase` (`text-2xl font-black`).
**Referans (doğru olan):** Başlıklar sadece anlamsal Tailwind token'ları kullanmalı (`text-3xl font-bold` gibi, `reviews` modülündeki gibi).

### 3. Modal & Card Border Radius
**Sorun:** Tasarımın ne kadar yuvarlak olduğu ekrandan ekrana radikal şekilde değişiyor.
**Nerede:** `showcase` (`rounded-[2.5rem]`, `rounded-[32px]`), `listing` (`rounded-[24px]`), `cart` (`rounded-xl`).
**Referans (doğru olan):** Tasarım diline (SKILL.md'ye) uygun olarak `rounded-2xl` ve `rounded-3xl` standart kılınmalı.

### 4. Tekrarlayan Skeleton Kodları
**Sorun:** Reusable `<Skeleton />` veya ortak loading componentleri yok. 
**Nerede:** Tüm modüllerde (Özellikle `dashboard`, `listing`, `reviews`).
**Referans (doğru olan):** Tüm projeye hitap edecek `src/common/components/ui/Skeleton.jsx` yaratılıp import edilmeli.

## Modül Bazlı Durum
| Modül | En İyi Yanı | Sorunlu Yanı | Öncelik |
|-------|------------|--------------|---------|
| listing | Zengin işlevsel componentler | Çok fazla arbitrary değer (`[1220px]`, `[26px]`, `[24px]`) | 🔴 |
| showcase | Dikkat çekici sunum, estetik | Abartılı radius (`rounded-[32px]`) ve tutarsız modal yapısı | 🟡 |
| cart | Standart Tailwind spacing kullanımı | Layout width farklılıkları (`6xl` vs `7xl`) | 🟡 |
| reviews | Temiz tipografi | Gereksiz tekrarlanan manual skeleton div'leri | 🟢 |
| user/dashboard | Kompakt ekran kullanımı | Componentler arası whitespace düzensiz | 🟡 |

## Tekrarlayan Anti-Pattern'ler
| Pattern | Kaç Modülde | Örnek |
|---------|-------------|-------|
| Manuel Skeleton (Copy-Paste) | 10+ | `{[...Array(4)].map(() => <div className="animate-pulse rounded-2xl bg-slate-100..." />)}` |
| Arbitrary Radius Değerleri | 5+ | `className="rounded-[24px]"`, `className="rounded-[2.5rem]"` |
| Arbitrary Tipografi | 5+ | `className="text-[20px]"`, `className="text-[26px]"` |

## Referans Modüller
- Tipografi sadeliği açısından **`reviews`** (standart text-xl, text-3xl vb. kullanım var).
- Container kalıbı ve spacing standartları açısından **`cart`** modülünün bazı ana yapısı (`CheckoutPage`'deki container).

## Düzeltme Öncelik Sırası
1. **Loading ve Empty States:** Merkezi bir `<Skeleton />` ve `<EmptyState />` bileşeni oluşturup, projedeki bütün `animate-pulse` içeren kirli kodları temizlemek.
2. **Tipografi Sistemi:** Ortak bir font büyüklüğü standardı belirleyip (H1 -> `text-3xl font-bold`, H2 -> `text-2xl font-bold`), tüm arbitrary px değerlerini kaldırmak.
3. **Sayfa Konteyner (Layout) Refactor'ı:** Her sayfadaki `max-w-*` ve `mx-auto px-*` kalıbını tek bir `PageContainer` bileşenine veya merkezi CSS layer sınıfına oturtmak.
4. **Border Radius Eşitlemesi:** Bütün `.jsx` dosyalarında `rounded-[...]` araması yapıp bunları standart `rounded-2xl` ve modal'larda `rounded-3xl` ile değiştirmek.

## Tahmini İş Yükü
| Öncelik | İş | Süre Tahmini |
|---------|-----|-------------|
| Kritik | Skeleton ve Empty State Temizliği / Merkezileştirme | 3-4 Saat |
| Kritik | Layout Container Standardizasyonu | 1.5 - 2 Saat |
| Orta | Tipografi (Arbitrary font temizliği) | 2 Saat |
| Düşük | Border Radius & Shadow Eşitlemesi | 1 Saat |
