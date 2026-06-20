# Tasarım Sistemi Audit Raporu
_Tarih: 2026-06-20_

## Mevcut Durum
- **Merkezi token sistemi var mı?** Evet. `tailwind.config.js` dosyası `src/common/theme/theme.js` üzerinden kendi merkezi tokenlarını alıyor.
- **Tailwind config'de custom renkler tanımlı mı?** Evet. `app-bg`, `text-primary`, `btn-primary`, `alert-success`, `card-bg` gibi anlamsal (semantic) renk sınıfları tanımlanmış.
- **CSS variables kullanılıyor mu?** Evet. `index.css` içerisinde `--page-page-background`, `--page-text-primary` gibi CSS variable'ları tanımlı ve bazı class'lar (ör. `.bg-page-canvas`) bunları kullanıyor.

## Hardcoded Renk Tespiti
| Dosya | Hardcoded değer | Olması gereken token |
|-------|----------------|----------------------|
| `ReviewsList.jsx` | `bg-gray-200`, `text-red-500`, `bg-blue-600`, `text-gray-900` | `bg-main-bg` (veya `skeleton-bg`), `text-alert-error`, `bg-btn-primary`, `text-text-primary` |
| `ReviewStats.jsx` | `text-green-600`, `text-yellow-600`, `bg-yellow-400` | `text-alert-success`, `text-alert-warning`, `bg-highlight` |
| `ReviewCard.jsx` | `bg-gray-50`, `border-gray-100`, `text-gray-800`, `text-gray-400` | `bg-card-bg`, `border-card-border`, `text-card-text-primary`, `text-card-text-muted` |
| `AuraChatPage.jsx` | `bg-slate-400`, `bg-indigo-400` | `bg-text-muted`, `bg-primary` veya semantic chat bubble token'ı |
| `ListingDetailPage.jsx` | `border-slate-200` | `border-header-border` veya `border-card-border` |
| `OrderSummary.jsx` | `bg-[#f7f6f5]`, `text-[#9c9894]` | `bg-app-bg`, `text-text-muted` |
| `ShoppingCartPage.jsx` | `text-[#5f5b57]`, `bg-indigo-600` | `text-text-secondary`, `bg-primary` |

## Tutarsız Spacing/Typography
| Dosya | Sorun |
|-------|-------|
| `ReviewCard.jsx` | `text-[10px]`, `text-[14px]`, `text-[15px]` gibi hardcoded px tabanlı font boyutları kullanılmış. Tailwind'in standart `text-xs`, `text-sm` font scale'i dışına çıkılmış. |
| `OrderSummary.jsx` | `text-[10px]` şeklinde arbitrary typography değerleri ve inline layout styling kullanılmış. |
| Genel JSX Dosyaları | `style={{ ... }}` içerisinde dinamik olmayan yapısal (structural) layout veya `backgroundColor` tanımlamalarına rastlandı. Tailwind utility class'ları yerine tercih edilmiş. |

## Genel Değerlendirme
Projenin temelinde çok kapsamlı ve esnek bir merkezi tasarım token sistemi kurulmuş (`theme.js`). Ancak frontend kodu yazılırken bu yapıya çok az bağlı kalınmış. Yapılan taramada `src/` altındaki `.jsx` dosyalarında **3600'den fazla** hardcoded Tailwind renk class'ı (`gray-900`, `red-500`, `blue-600` vb.) ve spesifik HEX kodları (`#f7f6f5`) tespit edildi.

**Durum:** Dağınık. Altyapı merkezi olarak kurulmuş olsa da pratikte uygulama katmanında tamamen hardcoded utility'ler kullanılmış.
**İş Yükü:** Yüksek. Gerçek bir tasarım sistemi standardizasyonu için tüm ana component'lerin, sayfa (Page) ve modal dosyalarının taranıp `text-gray-900` yerine `text-text-primary`, `bg-blue-600` yerine `bg-btn-primary` gibi anlamsal token'lara geçirilmesi ve `text-[14px]` gibi tutarsız tipografi tanımlarının temizlenmesi gerekiyor.
