# Locales & Internationalization Module

Multi-language dictionary catalogs, language detection, locale switching, and translation synchronization.

---

## 1. Overview & Purpose

The `locales` module manages bilingual internationalization (i18n) across the platform. It provides language negotiation, localized terminology, and dynamic dictionary hydration:
1. **Bilingual Dictionaries:** Full coverage for Turkish (`tr`, primary platform language) and English (`en`, international fallback) in `translation.json` files.
2. **Accept-Language Synchronization:** The HTTP network interceptor (`common/services/api/interceptors.js`) automatically attaches the active `i18n.language` to the `Accept-Language` header on all outgoing Axios requests.
3. **Runtime Language Detection & Persistence:** Automatically detects browser language preferences and persists explicit user choices in local storage.
4. **Natural Technical Vocabulary:** Strict compliance with platform localization guidelines: natural, widely accepted technical vocabulary is preferred over forced or obscure Turkish translations.

---

## 2. Route Map & Entry Points

| Route / Component | Guard / Access | Component | Purpose & Query Params |
|---|---|---|---|
| Global Header / Footer | Public | `LanguageSwitcher` | Interactive switcher allowing users to toggle between Turkish and English instantly. |
| Global Application Root | Public | `src/i18n.js` | Initializes `i18next`, bundles translation catalogs, and mounts language detector. |

---

## 3. Component Hierarchy & Core Sub-Components

```
locales/
├── tr/
│   └── translation.json               # Turkish master translation catalog
├── en/
│   └── translation.json               # English master translation catalog
└── README.md                          # Module architecture specification
```

### Component Roles & Invariants
- **Key Parity Invariant:** Every key present in `tr/translation.json` must have a corresponding counterpart in `en/translation.json` to prevent key fallback leaks.
- **XSS Protection:** React JSX automatically escapes dynamic values. `i18next` is initialized with `interpolation: { escapeValue: false }` to avoid double-encoding characters.
- **No Direct Emoji Characters:** Translation strings avoid decorative or celebratory emojis in compliance with the restrained design standard.

---

## 4. State Management & React Query Contract

### i18n Engine Contract
- **Engine Stack:** `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
- **Active Language:** Accessible via `useTranslation().i18n.language`.
- **Language Switcher Mutation:** Calling `i18n.changeLanguage(lang)` immediately updates:
  1. The client-side UI across all mounted components.
  2. The `Accept-Language` request header for subsequent API dispatches.
  3. The `i18nextLng` storage key in browser storage.

---

## 5. Form & Data Validation Rules

- **Interpolation Parameters:** Parametric translation keys (such as `{{count}}`, `{{min}}`, `{{max}}`) must receive valid numbers or strings to avoid rendering raw curly braces in the UI.

---

## 6. UX States, Backend Error Contract & Restrained Design Tokens

### 4-State UX Handling
1. **Loading State:** Translation catalogs are bundled synchronously with the application build, avoiding asynchronous Flash of Unstyled Content (FOUC) or raw translation key flashes.
2. **Empty / Missing Key Fallback:** If a key is absent in the active language, `i18next` falls back gracefully to `en` before rendering the literal key string.
3. **Error State:** If translation loading fails, default English strings render automatically.
4. **Data State:** Fully localized user interface with proper pluralization, date formatting, and currency symbols.

### Backend Error Contract
- Backend error responses containing an `errorCode` enum are mapped to localized strings via the `errors.*` translation namespace in `translation.json`.

### Restrained Design Tokens
- **Language Toggle Switcher:** Compact text buttons (`TR` | `EN`) with subtle active state highlights (`text-foreground font-semibold`) and neutral inactive states (`text-muted-foreground hover:text-foreground`).
- **Typography:** Uses platform sans-serif typography with complete Turkish character support (`ç`, `ğ`, `ı`, `ö`, `ş`, `ü`).
