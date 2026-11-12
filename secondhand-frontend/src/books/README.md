# Book Catalog UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Executive Summary & Catalog Scope
The `books` module governs literature, academic textbooks, exam preparation books, comic books/manga, and collector periodicals across 19 book categories.

It features ISBN-13 scanning, automatic catalog edition snapshotting via Open Library integration, and exam-specific condition tagging.

---

## 2. Component Hierarchy & File Structure

```
src/books/
├── components/
│   └── BookEditionPicker.jsx           # Modal dialog searching and selecting canonical book editions
├── services/
│   ├── booksService.js                 # Raw Axios calls (/api/v1/books/**)
│   └── bookCatalogQuery.js             # React Query hooks for ISBN lookups and edition search
├── utils/
│   └── bookEdition.js                  # ISBN-10 to ISBN-13 converter and checksum validator
├── books.js                            # Form schemas, validation rules, initial field states
└── README.md                           # Module documentation
```

---

## 3. React Query 5 Data Flow & Query Key Invalidation Matrix

### Query Key Topology
- `['catalog', 'books', 'search', query]`: Title/author auto-complete (`/api/v1/catalog/books/search?q=`).
- `['catalog', 'books', 'isbn', isbn]`: Exact edition lookup by ISBN-13 (`/api/v1/catalog/books/editions?isbn=`).
- `['catalog', 'books', 'genres']`: Book genre taxonomy (`/api/v1/enums/all`).
- `['catalog', 'books', 'attributes', typeId]`: Category-scoped attributes (exam solved ratio, grade level).

### Invalidation Matrix
| Mutation | Endpoint | Invalidated Query Keys | UX Impact |
|---|---|---|---|
| `createBookListing` | `POST /api/v1/books/create-listing` | `['listings', 'my']`, `['listings', 'search']` | Creates draft/active book item |
| `updateBookListing` | `PUT /api/v1/books/{id}` | `['listings', 'detail', id]`, `['listings', 'my']` | Updates condition and pricing |

---

## 4. Edition Snapshotting & The ISBN Engine

### 4.1 Canonical Edition Snapshotting (`BookEditionPicker`)
1. **ISBN / Title Search:** Sellers can enter an ISBN or search by book title/author.
2. **Catalog Binding (`editionId`):**
   - Selecting a verified catalog edition automatically populates author, publisher, publication year, page count, language, format, and book cover.
   - Book covers link directly to Open Library CDN (`covers.openlibrary.org`) without re-uploading to Cloudinary.
   - If no catalog edition is matched, the seller manually enters book facts (marked as unverified).

### 4.2 ISBN-13 Conversion & Validation
- `bookEdition.js` accepts either ISBN-10 or ISBN-13.
- Automatically converts 10-digit ISBNs to canonical 13-digit EAN format by prepending `978` and recalculating the check digit.
- Rejects malformed ISBNs before network dispatch.

---

## 5. Form & Dynamic Attributes by Category

Dynamic attributes stored in `listings.attributes` JSONB:
- **Exam Preparation (`SINAV_HAZIRLIK`):** Prep format (Question Bank, Lecture, Practice Exams), target exam (YKS, KPSS, LGS, ALES, DGS), solved ratio percentage, video solution availability.
- **School Textbooks (`OKUL_KITAPLARI`):** Grade level (1-12), MEB approved curriculum status.
- **Children's Books (`COCUK_KITAPLARI`):** Recommended age range.
- **Comics & Manga (`CIZGI_ROMAN_VE_MANGA`):** Volume number, issue number.
- **General Condition:** Highlighting/pen marks (`usageMarks`: None, Pencil, Pen, Highlighter), cover wear, missing pages.

---

## 6. Backend Contract & Safe Error Handling
- Exceptions are parsed via `errorUtils.getErrorMessage(err)`:
  - `BOOK_ISBN_INVALID` -> "The provided ISBN checksum is invalid."
  - `BOOK_PAGE_COUNT_NEGATIVE` -> "Page count must be a positive integer."
  - `BOOK_EDITION_NOT_FOUND` -> "The selected catalog edition was not found."

---

## 7. Restrained Design Tokens & Anti-Patterns
- **Typography:** ISBN-13, publication year, and page count use `font-mono tabular-nums`.
- **Cover Display:** Rendered with standard book aspect ratio (2:3) with subtle drop-shadow and hairline border.
- **Zero Emojis:** Strictly prohibited across genre badges, edition cards, and condition tags.
- **Radius Ceiling:** Edition cards, modals, and buttons adhere strictly to `rounded-md`.
