# Locales & Internationalization Module

Multi-language dictionary catalogs, language detection, locale switching, and translation synchronization.

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`core`](../../../src/main/java/com/serhat/secondhand/core/README.md)
> - **Architecture Deep Dive:** [`docs/error-handling-and-contract-architecture.md`](../../../docs/error-handling-and-contract-architecture.md)

## 1. Overview & Purpose

The `locales` module manages bilingual internationalization (i18n) across the platform. It provides language negotiation, localized terminology, and dynamic dictionary hydration:
1. **Bilingual Dictionaries:** Full coverage for Turkish (`tr`, primary platform language) and English (`en`, international fallback) in `translation.json` files.
2. **Accept-Language Synchronization:** The HTTP network interceptor (`common/services/api/interceptors.js`) automatically attaches the active `i18n.language` to the `Accept-Language` header on all outgoing Axios requests.
3. **Runtime Language Detection & Persistence:** Automatically detects browser language preferences and persists explicit user choices in local storage.
4. **Natural Technical Vocabulary:** Strict compliance with platform localization guidelines: natural, widely accepted technical vocabulary is preferred over forced or obscure Turkish translations.

## 2. Route Map & Entry Points

- No own route; components are embedded in other modules' pages.

| Embedded entry | Where |
|---|---|
| `LanguageSwitcher` | Interactive switcher allowing users to toggle between Turkish and English instantly. |
| `src/i18n.js` | Initializes `i18next`, bundles translation catalogs, and mounts language detector. |

## 3. Component Rules

- **Key Parity Invariant:** Every key present in `tr/translation.json` must have a corresponding counterpart in `en/translation.json` to prevent key fallback leaks.
- **XSS Protection:** React JSX automatically escapes dynamic values. `i18next` is initialized with `interpolation: { escapeValue: false }` to avoid double-encoding characters.
- **No Direct Emoji Characters:** Translation strings avoid decorative or celebratory emojis in compliance with the restrained design standard.

---

## 4. React Query Keys

Generated from code; the hook files are the source of truth.

- No queries defined in this module.

## 5. State Management

### i18n Engine Contract
- **Engine Stack:** `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
- **Active Language:** Accessible via `useTranslation().i18n.language`.
- **Language Switcher Mutation:** Calling `i18n.changeLanguage(lang)` immediately updates:
  1. The client-side UI across all mounted components.
  2. The `Accept-Language` request header for subsequent API dispatches.
  3. The `i18nextLng` storage key in browser storage.

## 6. Form & Data Validation Rules

- **Interpolation Parameters:** Parametric translation keys (such as `{{count}}`, `{{min}}`, `{{max}}`) must receive valid numbers or strings to avoid rendering raw curly braces in the UI.
