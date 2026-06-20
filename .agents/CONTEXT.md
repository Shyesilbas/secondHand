## Son çalışılan
Teal/light tema geçişi + hardcoded renk temizliği

## Tamamlananlar
- `theme.js` yeniden yazıldı, yeni Teal/light renk paleti entegre edildi.
- 3600+ hardcoded değer ve Tailwind renk/boyut sınıfı token'lara taşındı (tüm frontend `.jsx` ve `.js` dosyaları elden geçirildi).
- `design-system` SKILL.md rehberi oluşturuldu.
- Tailwind yapılandırması (`tailwind.config.js`) yeni renk paletiyle uyumlu olacak şekilde güncellendi ve üretim build'i başarıyla doğrulandı.

## Bir sonraki adım
- Tarayıcıda görsel test — her ana ekranı kontrol et

## Açık riskler
- Tailwind purge'ün yeni token class'larını tanıması için build gerekebilir.
- Yapılan kapsamlı renk değişimlerinin arayüzdeki diğer bileşenlerle kontrast uyumunun görsel olarak kontrol edilmesi gerekir.
