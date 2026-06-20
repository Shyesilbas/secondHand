## Son çalışılan
Frontend kalite audit ve refactor

## Tamamlananlar
- `FRONTEND_AUDIT.md` raporu oluşturuldu.
- Component ve hook içlerindeki `localStorage` kullanımları `cacheService`'e geçirildi (`GenericListingForm.jsx`, `SafeMeetupOnboardingModal.jsx`, `AuraChatWidget.jsx`, `useAuraChat.js`, `useCart.js`).
- `map()` içerisindeki array index tabanlı key kullanımları benzersiz değerlerle değiştirildi (`ReviewsList.jsx`, `ListingGrid.jsx`, `ListingsSkeleton.jsx`, `NotificationModal.jsx`, `UserStats.jsx`, `Footer.jsx`).
- Yeni frontend kod kalitesi kuralı (Liste ve Key Kullanımı) `frontend-quality/SKILL.md`'ye eklendi.

## Açık riskler
- Düzeltilen form cache mekanizmalarının (`GenericListingForm.jsx`, `useCart.js`) ve yapay zeka sohbet component'inin (`AuraChatWidget.jsx`) state kalıcılığının test edilmesi gerekiyor.

## Geçmiş (History)
- Frontend tarafında teknik borç (technical debt) temizliği yapıldı. `enumCache.js` silinerek React Query'ye geçildi, WebSocket memory leak sorunları giderildi.
- [2026-06-20] Tüm AI ajan kuralları merkezileştirildi. `GEMINI.md` anayasa yapıldı.
- WebSocket/STOMP bağlantılarında `.deactivate()` zorunlu kılındı.
