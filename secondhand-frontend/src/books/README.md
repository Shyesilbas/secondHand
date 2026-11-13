# Book Catalog UI Module

> [!NOTE]
> **Backend Counterpart & Architecture Deep Dive:**
> - **Backend Module:** [`listing`](../../../src/main/java/com/serhat/secondhand/listing/README.md)
> - **Architecture Deep Dive:** [`docs/catalog-and-category-polymorphism.md`](../../../docs/catalog-and-category-polymorphism.md)

## 1. Executive Summary & Catalog Scope
The `books` module governs literature, academic textbooks, exam preparation books, comic books/manga, and collector periodicals across 19 book categories.

It features ISBN-13 scanning, automatic catalog edition snapshotting via Open Library integration, and exam-specific condition tagging.

## 2. React Query Keys

Generated from code; the hook files are the source of truth.

| Query key | Defined in |
|---|---|
| `['catalog', 'books', 'attributes', String(typeId ?? '')]` | `bookCatalogQuery.js` |
| `['catalog', 'books', isbn ? 'isbn' : 'search', isbn ? compactIsbn(q) : q.toLocaleLowerCase('tr')]` | `bookCatalogQuery.js` |

## 3. Edition Snapshotting & The ISBN Engine

### Canonical Edition Snapshotting (`BookEditionPicker`)
1. **ISBN / Title Search:** Sellers can enter an ISBN or search by book title/author.
2. **Catalog Binding (`editionId`):**
   - Selecting a verified catalog edition automatically populates author, publisher, publication year, page count, language, format, and book cover.
   - Book covers link directly to Open Library CDN (`covers.openlibrary.org`) without re-uploading to Cloudinary.
   - If no catalog edition is matched, the seller manually enters book facts (marked as unverified).

### ISBN-13 Conversion & Validation
- `bookEdition.js` accepts either ISBN-10 or ISBN-13.
- Automatically converts 10-digit ISBNs to canonical 13-digit EAN format by prepending `978` and recalculating the check digit.
- Rejects malformed ISBNs before network dispatch.

## 4. Form & Dynamic Attributes by Category

Dynamic attributes stored in `listings.attributes` JSONB:
- **Exam Preparation (`SINAV_HAZIRLIK`):** Prep format (Question Bank, Lecture, Practice Exams), target exam (YKS, KPSS, LGS, ALES, DGS), solved ratio percentage, video solution availability.
- **School Textbooks (`OKUL_KITAPLARI`):** Grade level (1-12), MEB approved curriculum status.
- **Children's Books (`COCUK_KITAPLARI`):** Recommended age range.
- **Comics & Manga (`CIZGI_ROMAN_VE_MANGA`):** Volume number, issue number.
- **General Condition:** Highlighting/pen marks (`usageMarks`: None, Pencil, Pen, Highlighter), cover wear, missing pages.
