## Son çalışılan
Tipografi arbitrary değer temizliği

## Tamamlananlar
- `text-[px]` arbitrary değerler token'a taşındı, heading hiyerarşisi standardize edildi.
- `update_typography.py` scripti kullanılarak 170+ `.jsx` dosyasında tipografi sınıfları standardize edildi.
- `h1`, `h2`, `h3` etiketlerinde ve sayfa başlıklarında standarda uygun olarak tipografi ve renk sınıfları eklendi.
- `.agents/skills/design-system/SKILL.md` içindeki tipografi tablosu ve kesinlikle yazılmaması gereken arbitrary kurallar güncellendi.
- Production build (`npm run build`) başarıyla tamamlandı.

## Bir sonraki adım
- Border-radius arbitrary değer temizliği

## Açık riskler
- Heading boyutları görsel test gerektirir — bazı başlıklar küçülmüş olabilir.

## Geçmiş (History)
- PageContainer Sayfa Seviyesi Wrapper Standartlaştırması yapıldı.
- Skeleton ve EmptyState Ortak Bileşen Refaktörü yapıldı.
- Teal/light tema geçişi + hardcoded renk temizliği yapıldı.
- theme.js yeniden yazıldı, 3600+ hardcoded değer token'a taşındı, design-system SKILL.md eklendi.
- Frontend tarafında teknik borç (technical debt) temizliği yapıldı. `enumCache.js` silinerek React Query'ye geçildi, WebSocket memory leak sorunları giderildi.
- [2026-06-20] Tüm AI ajan kuralları merkezileştirildi. `GEMINI.md` anayasa yapıldı.
- WebSocket/STOMP bağlantılarında `.deactivate()` zorunlu kılındı.
