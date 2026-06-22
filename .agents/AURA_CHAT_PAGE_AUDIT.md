# Aura Chat Page Tasarım Audit & Yeni Konsept Önerisi
_Tarih: 2026-06-21_

## Genel Yapı
`AuraChatPage.jsx`, kullanıcıların AI asistan Aura ile etkileşime girdiği sayfadır. Sol panelde sohbet ayarları, ortada sohbet akışı, sağ panelde ise bağlam (aktif ürün vb.) yer alır. Sayfanın işlevsel yapısı iyi kurgulanmış olsa da, görsel tasarımında aşırı miktarda hardcoded Tailwind rengi kullanılmış ve premium hissiyat zayıf kalmıştır.

## Tespit Edilen Tasarım İhlalleri (Mevcut Durum)
1. **Hardcoded Slate Tonları:** `bg-slate-50`, `bg-slate-900`, `text-slate-800` gibi renkler sayfanın her yerinde kullanılmış. Bu durum tasarım sistemi esnekliğini bozuyor.
2. **Sohbet Baloncukları:** Kullanıcı mesajı `bg-slate-900`, Aura mesajı `bg-slate-50 border-border-light` yapısıyla oluşturulmuş. Tasarım token'ları yerine sabit hex mantığı kullanılmış.
3. **Şeffaf Opacity İhlalleri:** Input kutusunda `bg-slate-50/50`, butonlarda `hover:bg-slate-950/[0.05]` benzeri opasite kullanımları var.
4. **Odaklama Halkaları:** Input'larda `focus:ring-slate-900/5` gibi hardcoded focus halkaları var.

## Yeni Premium Tasarım Konsepti Önerisi
Kullanıcılara "Wow" dedirtecek premium ve dinamik bir AI asistan deneyimi için aşağıdaki tasarım değişikliklerini öneriyorum:

- **Sidebar (Sol ve Sağ Panel):** Standart `bg-slate-50` yerine daha derinlik hissi veren `bg-background-secondary` kullanılacak. Etkileşimli butonlar semantic `bg-surface-elevated` ve `hover:bg-secondary-light` ile düzenlenecek.
- **Sohbet Alanı (Main Chat):** Arka plan `bg-background-primary` kalacak fakat sohbet baloncukları daha organik bir görünüme kavuşacak. 
  - *Kullanıcı Mesajı:* `bg-primary text-white shadow-md` ile vurgulu bir görünüm.
  - *Aura Mesajı:* `bg-background-tertiary border border-border-light shadow-sm` ile daha temiz ve okunabilir bir arayüz.
- **Floating Input Field:** Yazı yazma alanı (input bar) ekranın en alt kısmında floating (havada asılı) bir container (`bg-surface-elevated shadow-lg rounded-2xl border-border-light`) içerisinde yer alacak. "Gönder" butonu statik `bg-slate-900` yerine interaktif animasyonlu `bg-primary` ve `hover:bg-primary-hover` olacak.
- **Animasyon ve Hover Efektleri:** Tıklanabilir tüm elemanlara (önerilen sorular, butonlar) yumuşak geçişli micro-animasyonlar (`transition-all duration-300 active:scale-95`) eklenecek.
- **Renk Paleti Tam Entegrasyonu:** Tüm sabit renkler tasarım sistemindeki `text-text-primary`, `text-text-secondary`, `border-border-light` gibi semantic token'lar ile değiştirilecek.

Rapor hazır. Yeni premium tasarımı ve standart düzeltmeleri doğrudan kod üzerinde uygulamaya başlayayım mı?
