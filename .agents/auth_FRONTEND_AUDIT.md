# Auth Pages Tasarım Audit
_Tarih: 2026-06-20_

## Genel Yapı
Auth sayfaları (Login, Register, Forgot Password, Change Password, Account Verification, OAuth süreçleri) genellikle sayfa ortasında odaklanmış, tek kolonlu kart veya form yapıları kullanıyor. Ancak bazı sayfalarda container wrapper varken (`ChangePasswordPage`, `AccountVerificationPage`), bazılarında formlar doğrudan `flex flex-col` olarak sayfa içinde duruyor (`LoginPage`, `RegisterPage`). Logo alanı her sayfada aynı olmasına rağmen manuel ve hardcoded olarak (örn. `bg-stone-900 text-amber-400`) tekrar edilmiş.

## Component Haritası
- `LoginPage`
  - `AuthInput`
  - `AuthButton`
- `RegisterPage`
  - `RegisterForm`
    - `AuthInput`
    - `AuthButton`
    - `LoadingIndicator`
    - `AgreementsSection`
  - `AgreementModal`
- `ForgotPasswordPage`
  - `AuthInput`
  - `AuthButton`
- `ChangePasswordPage`
  - `Alert`
  - `AuthInput`
  - `AuthButton`
  - `PasswordRequirements`
- `AccountVerificationPage`
  - `AuthButton`
- `OAuthCompletePage`
  - `AuthInput`
  - `AuthButton`
  - `LoadingIndicator`
- `OAuthErrorPage` / `OAuthCallbackPage`
  - `LoadingIndicator`

## Tespit Edilen Tasarım Sorunları
| Sorun | Nerede | Etki | Çözüm Önerisi |
|-------|--------|------|---------------|
| Hardcoded Renkler (`stone`, `amber`, `rose`, `#faf9f7`) | `LoginPage.jsx`, `RegisterForm.jsx`, `ForgotPasswordPage.jsx`, `AccountVerificationPage.jsx` | Yüksek | Tüm hardcoded renkler (`bg-stone-900`, `text-amber-400`, vs.) semantic token'lar (`bg-primary`, `text-primary`, vb.) ile değiştirilmeli. |
| Hardcoded Logo Tekrarı | Neredeyse tüm sayfalarda | Orta | Logo bölümü ortak bir component'e çıkarılmalı (örn. `AuthLogo`) ve semantic token'lar kullanmalı. |
| Arbitrary Tipografi (`tracking-[0.2em]`) | `LoginPage`, `RegisterForm`, `ForgotPasswordPage`, `AccountVerificationPage` | Düşük | `tracking-[0.2em]` gibi keyfi değerler yerine `tracking-widest` gibi standart Tailwind sınıfları kullanılmalı. |
| Hover/Focus durumlarında hardcoded renkler | `OAuthCompletePage`, `AccountVerificationPage`, vb. | Orta | `focus:border-stone-900`, `hover:bg-indigo-700` gibi sınıflar semantic theme değerlerine geçirilmeli. |
| Standart Dışı Layout Yönetimi | `LoginPage` vs `AccountVerificationPage` | Orta | Bazı sayfalar container içinde ortalanmışken, bazıları tam genişliğe yayılmış. Auth sayfaları için ortak bir `AuthLayout` kullanılabilir. |
| OTP Input Hardcoded Stiller | `AccountVerificationPage.jsx` | Orta | `bg-stone-100/40`, `border-stone-200/60` yerine semantic token'lar (`bg-background-secondary`, `border-border-light`) kullanılmalı. |

## Renk & Token Tutarsızlıkları
- **Logo:** `bg-stone-900 text-amber-400` -> Yeni teal temaya uymuyor. `bg-primary text-primary-content` olmalı.
- **Arka planlar:** `bg-[#faf9f7]`, `bg-stone-50/50` -> `bg-background-primary` veya `bg-background-secondary` olmalı.
- **Borders:** `border-stone-200/50`, `border-stone-100/65` -> `border-border-light`.
- **Hata Mesajları:** `bg-rose-50/50 border-rose-100 text-rose-600` -> `bg-status-error-bg border-status-error-border text-status-error`.
- **Metinler:** `text-stone-900`, `text-stone-500`, `text-stone-400` -> `text-text-primary`, `text-text-secondary`, `text-text-muted`.

## Spacing Sorunları
Genel olarak `gap` ve padding değerleri tutarlı olsa da (örneğin `gap-5`, `gap-6` kullanımları), ortak `AuthLayout` olmaması sebebiyle form genişlikleri sayfadan sayfaya ufak değişiklikler gösterebilir. Form içindeki divider kısımlarında (`my-2`, `my-3`) spacing tutarsızlıkları var.

## CTA & Buton Analizi
`AuthButton` kullanılarak genel bir tutarlılık sağlanmış. Ancak `OAuthErrorPage`'de buton manuel olarak `bg-primary text-white hover:bg-indigo-700` şeklinde yazılmış, `AuthButton` kullanılmamış ve hover efekti hardcoded olarak kalmış.

## Mobil Uyum
Sayfalar genel olarak mobil uyumlu. Ancak layout ortaklaştırılmadığı için bazı padding ve margin değerleri sayfa bazında mobilde farklı görünebilir. 

## Öncelik Sırası
1. **[Kritik]** Hardcoded renklerin (`stone`, `amber`, `rose`, `#faf9f7`) yeni teal tema bazlı semantic token'lara geçirilmesi.
2. **[Kritik]** Logoların her dosyadan silinip, `AuthLogo` veya ortak bir `AuthLayout` / Header içine alınması.
3. **[Orta]** Arbitrary tipografi ve spacing değerlerinin düzeltilmesi (`tracking-[0.2em]` vb.).
4. **[Orta]** `OAuthErrorPage` gibi dosyalardaki butonların `AuthButton` yapısına dahil edilmesi veya `hover:bg-indigo-700` gibi hardcoded yapının kaldırılması.
