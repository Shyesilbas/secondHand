# Agreements Page Tasarım ve UX Audit
_Tarih: 2026-06-21_

## 1. Genel Yapı & Düzen (Layout)
- **Sayfa Hiyerarşisi**: Sol tarafta kategori seçimi (Sidebar), sağ tarafta sözleşmeler listesi (Content Panel) şeklinde klasik iki sütunlu bir yerleşim mevcut. Bu yapı büyük ekranlarda verimli olsa da, görsel olarak bazı dengesizlikler barındırıyor.
- **Kategori Menüsü (Sidebar)**: 
  - Aktif kategori butonu `bg-primary text-white` sınıfıyla doğrudan koyu teal arka plana sahip. Bu, arayüzün genelindeki minimal, bol beyaz alanlı tasarıma kıyasla çok ağır duruyor. Modern tasarımlarda aktif menü öğeleri için hafif bir arka plan (`bg-primary/8` veya `bg-primary-light`) ile teal renkli metin/ikon tercih edilir.
  - Kategori başlığı ("Category") üstten ve alttan çizgiyle bölünmüş, bu da görsel kalabalık oluşturuyor.

## 2. Bilgi Hiyerarşisi & Kart Tasarımları (AgreementCard)
- **Kart Görünümü**:
  - `isPending` (bekleyen onay) durumundaki kartların arka planı `bg-status-warning-bg/30` ve kenarlığı `border-status-warning-border` olarak ayarlanmış. Bu durum, onay bekleyen 2-3 sözleşme yan yana/alt alta geldiğinde arayüzü aşırı sarı ve "hata/uyarı" varmış gibi agresif gösteriyor.
  - Kart içindeki metinler ve butonlar çok sıkışık. Padding (`p-5`) dağılımı daha dengeli hale getirilebilir.
  - "Sözleşmeyi Oku" (`read_agreement`) butonu ikincil bir buton veya metin linki olarak sol altta kalmış. Ancak bu, sözleşmeyi kabul etmekten önce yapılması gereken birincil adımdır (okumadan kabul etme akışını engellemek veya okumayı teşvik etmek için).

## 3. Modal Deneyimi (AgreementModal)
- **Backdrop & Katman Derinliği**:
  - Arka plan perdesi `bg-black/50` olarak ayarlanmış. Bunu `bg-slate-900/40 backdrop-blur-sm` yaparak arkadaki içeriği yumuşak bir şekilde flulaştırmak ve derinlik hissi oluşturmak daha premium bir hava katacaktır.
  - Modal başlığındaki ikon konteyneri `bg-primary-light` (sabit) kullanıyor. Bu `bg-primary/10` ile değiştirilmelidir.
- **Syntax Hatası**:
  - Dosyanın en sonunda (`line 74`) gereksiz `;;` (çift noktalı virgül) kalmış. Bu durum build/lint süreçlerinde sorun yaratabilir.

## 4. AgreementsSection (Ödeme/Kayıt Sırasındaki Küçük Bölüm)
- **Renk ve Kenarlıklar**:
  - `text-slate-600`, `border-slate-300`, `text-slate-400`, `text-slate-700` gibi hardcoded slate renk kodları kullanılmış. Bunlar projenin genelindeki semantic token'larla (`text-text-muted`, `border-border-light`, `text-text-secondary`) uyuşmuyor.
  - Liste elemanlarındaki checkbox ve yazı yerleşimi dikeyde tam ortalanmamış veya dikey hizalama dengesiz duruyor.

---

## Tespit Edilen Tasarım Sorunları

| Sorun | Dosya / Konum | Etki Seviyesi | Çözüm Önerisi |
| :--- | :--- | :--- | :--- |
| **Ağır Sidebar Butonları** | `AgreementsPage.jsx` | Orta | Aktif kategoriyi `bg-primary/10 text-primary` ve yumuşak geçişlerle renklendir. |
| **Agresif Sarı Kartlar** | `AgreementCard.jsx` | Orta | Arka planı düz `bg-background-primary` veya `bg-card-bg` yap; bekleyen durumu sadece zarif bir durum badge'i (`status-warning`) ile göster. |
| **Sert Modal Backdrop** | `AgreementModal.jsx` | Düşük | `bg-slate-900/40 backdrop-blur-sm` kullanarak daha elit bir derinlik oluştur. |
| **Gereksiz Semicolon** | `AgreementModal.jsx:74` | Kritik (Kod Kalitesi) | `</div>;;` ifadesini `</div>;` olarak düzelt. |
| **Hardcoded Slate Sınıfları** | `AgreementsSection.jsx` | Yüksek | Tüm `slate` sınıflarını `text-text-muted`, `text-text-secondary`, `border-border-light` ile değiştir. |

---

## Önerilen Yeni Tasarım Görünümü (Sidebar & Kartlar)
Sol menünün daha elit durması için aktif buton rengini pastel bir teal tona çekeceğiz. Kartlar ise arka planda sarı lekeler yerine beyaz/gri minimal kartlar olacak ve sadece sağ üstteki badge onay durumunu gösterecek.
