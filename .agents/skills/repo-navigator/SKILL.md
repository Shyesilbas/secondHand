---
name: Repo Navigator
description: Hangi dosyanın veya modülün değişeceğini bulmak için tetiklenir.
---

> Detaylı proje haritası için: `.agents/PROJECT_REPORT.md`

# Repo Navigator

## Tetiklenme
"nerede yazıyor", "hangi dosya", "modülü bul", "ilgili sınıf hangisi" gibi ifadeler.

## Çalışma Adımları
1. Root README → GEMINI.md → ilgili modül README sırasıyla oku.
2. Tüm repoyu tarama — sadece ilgili modül klasörüne gir.
3. Hedef dosya listesini çıkar.
4. Değişiklik kapsamını belirt: hangi katman, hangi dosya.

## Çıktı Formatı
- Hedef dosyalar: `[modül]/[katman]/[DosyaAdı].java`
- Değişiklik kapsamı: controller / service / validator / repository / mapper
- Yan etki riski: cache / event / auth / payment varsa belirt.
