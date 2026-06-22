# Checkout Steps Tasarım ve UX Audit
_Tarih: 2026-06-21_

## 1. Genel Yapı & Düzen (Layout)
- **Adım Akışı (Stepper)**: `CheckoutProgressBar.jsx` bileşenindeki adım noktaları ve ilerleme çizgileri koyu siyah/gri tonlar (`bg-slate-900`) ile çizilmiş. Projenin marka bütünlüğü için tamamlanmış adımların ve çizginin Teal (`bg-primary`) olması gerekmektedir.
- **Kart Derinliği**: `CheckoutStep.jsx` ve diğer tüm adımlarda hex kodlu sınır çizgileri (`border-[#e5e3df]`) kullanılmış.
- **Glassmorphism / Sayfa Kartı**: `CheckoutOrderSummary.jsx` bileşeninde `border-white/50 bg-background-primary/75 backdrop-blur-md` ile glassmorphism uygulanmış. Bu durum projedeki "Kesinlikle Yapma" kurallarıyla çelişmektedir. Klasik temiz kart stiline dönüştürülmelidir.

## 2. Component Analizi & Stil Hataları

### A. CheckoutAddressStep.jsx (1. Adım)
- **Kargo / Elden Teslimat Seçimi**:
  - Aktif kartlar için `border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950/10` şeklinde agresif siyah halkalar tercih edilmiş.
  - İkonların arka planındaki rozetler ve hover efektleri (`bg-indigo-50/50`, `bg-indigo-50/15`, `hover:bg-indigo-50`) mor/indigo tonlarında. Bunlar Teal (`bg-primary/10`, `hover:bg-primary/15`) olmalıdır.
  - Düğmelerde, metinlerde ve sınırlarda çok sayıda `slate-100`, `slate-300`, `slate-400`, `slate-500`, `slate-600`, `slate-700`, `slate-800` hardcoded renk sınıfları var.
  - Devam et butonu (`continue`) `bg-slate-900 hover:bg-black` (koyu siyah). Marka rengi Teal (`bg-primary`) olarak güncellenmelidir.

### B. CheckoutPaymentStep.jsx (2. Adım)
- **Ödeme Yöntemi ve Cüzdan**:
  - Cüzdan seçimi kartında mor leke (`bg-indigo-50/15`) kullanılmış.
  - Bakiye yetersiz uyarı kutusu kırmızı hexlerle (`border-[#f5d5d5] bg-[#fdf7f7] text-[#a4262c]`) tasarlanmış.
  - Limiti aşma uyarısında `border-amber-100` hardcoded sarı kullanılmış.
  - Devam butonu ve mobil butonlar `bg-slate-900` siyah/gri.

### C. CheckoutReviewStep.jsx (3. Adım)
- **Sipariş Önizleme**:
  - Ürün listesinde `border-[#e5e3df] bg-background-primary divide-y divide-[#f0efed]` hardcoded sınırları var.
  - Ürün görseli çerçevesinde `border-[#eee] bg-[#fafaf9]` kullanılmış.
  - Teklif rozetinde `border-[#e5e3df] bg-[#fafaf9] text-[#555]` morumsu/gri sınıflar var.
  - Butonlarda `bg-slate-900` siyah renkler kullanılmış.

### D. CheckoutVerificationStep.jsx (4. Adım)
- **OTP Doğrulama**:
  - Kilit ikonu arka planı `border-slate-100 bg-slate-50 text-slate-700` ile grileştirilmiş.
  - Kodu doğrula butonu `bg-slate-900` (siyah).
  - Trust rozetlerinde `text-slate-400` ve `text-slate-200` gibi hardcoded gri tonlar var.

### E. ActiveCouponsModal.jsx
- **Kupon Seçim Modalı**:
  - Modal arka plan perdesi `bg-black/30 backdrop-blur-[1px]` yerine standart `bg-slate-900/40 backdrop-blur-sm` olmalıdır.
  - Kupon listesi border'ları `#e5e3df` ve hover durumları `hover:bg-[#fafaf9]` hardcoded.
  - Kupon uygula butonu `bg-[#1466c6]` (mavi) olarak kalmış.

---

## Tespit Edilen Tasarım Sorunları

| Sorun | Dosya / Konum | Etki Seviyesi | Çözüm Önerisi |
| :--- | :--- | :--- | :--- |
| **Siyah / Gri Butonlar (CTA)** | Tüm Checkout Adım Butonları | Yüksek | `bg-slate-900 hover:bg-black` butonlarını `bg-primary hover:bg-primary-hover` (Teal) ile değiştir. |
| **Mor/Indigo Vurguları** | `CheckoutAddressStep.jsx`, `CheckoutPaymentStep.jsx` | Orta | `bg-indigo-50` ve türevlerini `bg-primary/5` veya `bg-primary/10` ile değiştir. |
| **Mavi Kupon Uygula Butonu** | `ActiveCouponsModal.jsx` | Kritik | Mavi CTA butonunu Teal (`bg-primary`) yap. |
| **Sert Modal Overlay & Glassmorphism** | `ActiveCouponsModal.jsx`, `CheckoutOrderSummary.jsx` | Orta | Perdeyi `backdrop-blur-sm` ile yumuşat; order summary kartındaki `backdrop-blur-md` glassmorphism stilini kaldırıp standart `border-border-light bg-background-primary` yap. |
| **Hardcoded Slate/Zinc Renk Sınıfları** | Tüm Adım Dosyaları | Yüksek | Tüm `slate-*` ve `zinc-*` yazı/sınır renklerini `text-text-primary`, `text-text-secondary`, `border-border-light` token'ları ile değiştir. |
