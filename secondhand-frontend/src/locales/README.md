# Locales & Internationalization Module

Localization dictionary resources, translations, language detection, and fallback rules.

## Architecture

- **Supported Locales:** Turkish (`tr`) and English (`en`). Configured in `src/i18n.js` with `fallbackLng: 'en'`.
- **Resources:**
  - `tr/translation.json`: Turkish dictionary covering platform copy, system error codes, and form labels.
  - `en/translation.json`: English dictionary mirroring Turkish key structure.
- **Engine:** `i18next` combined with `react-i18next` and `i18next-browser-languagedetector`.
- **Accept-Language Header:** `src/common/services/api/interceptors.js` automatically binds `i18n.language` to the HTTP `Accept-Language` header on all outgoing Axios requests.

## Invariants

- **Key Parity:** Any new translation key introduced must be defined in both `tr/translation.json` and `en/translation.json` to prevent key missing fallbacks.
- **XSS Protection:** React handles JSX escaping; `escapeValue: false` is configured in `i18n.js`.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: translation text must avoid forced Turkish technical terms (use natural technical vocabulary) and contain zero emojis.

