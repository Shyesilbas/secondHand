# AI (Aura) Paketi Teknik Rehber

## Agent Note
> [!IMPORTANT]
> Detaylı AI ajan kuralları ve proje mimari haritası için: `.agents/PROJECT_REPORT.md` ve `GEMINI.md` dosyalarını oku.

## 1) Paket Amacı ve Sınırları
`ai` paketi, "Aura" yapay zeka asistanının yönetiminden, Gemini API ile haberleşmekten ve kullanıcı komutlarını (semantic search) sistem komutlarına (SQL/Search Plans) dönüştürmekten sorumludur.

Kapsam:
- Kullanıcı girdisini analiz etme (Semantic Listing Search)
- Zengin arama filtreleri ve planları üretme
- Dinamik fiyat önerileri sunma (Dynamic Price Advisor)
- Otomatik ilan açıklaması üretme (Automated Listing Generator)
- Kullanıcıya ait sepet, favori veya sipariş bağlamını prompt'a enjekte etme (Context Adapters)

## 2) Kritik Sınıflar
- `AuraController`: Arayüz ile haberleşen ana endpoint.
- `AuraListingSearchOrchestrator`: Gelen isteği alıp Gemini modeline gönderilmek üzere hazırlayan ana orkestratör.
- `ContextAdapters`: Kullanıcının sistemdeki aktif durumlarını (Sepet vb.) okuyup prompt'a bağlam (context) olarak ekleyen bileşenler.
- `GeminiClient`: Google Gemini API ile asıl HTTP iletişimini kuran servis.

## 3) Dikkat Edilmesi Gereken Riskler
- **Token Limitleri:** Context Adapter'lar çok büyük verileri (örneğin binlerce ilan geçmişini) prompt'a eklememelidir. Sınır aşımı `429 Too Many Requests` veya Token Limit Exception hatalarına yol açar.
- **Güvenlik:** Kullanıcı bağlamı enjekte edilirken kullanıcının yetkisi olmayan veriler (`other_user_cart`) kesinlikle prompt'a sızmamalıdır.
- **Gecikme (Latency):** LLM çağrıları yavaştır. Arayüz tarafında asenkron (WebSocket veya loading state) tasarımlar tercih edilmelidir.
