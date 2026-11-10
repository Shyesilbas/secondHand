# Books Catalog UI Module

Books, textbook editions, author bibliographic information, ISBN metadata, and condition rating.

## Architecture

- **`booksService`:** API service managing book listing mutations:
  - `createListing(data)`: Dispatches book listing payloads (`POST /v1/books/create-listing`).
  - `getListing(id)`: Retrieves extended bibliographic data (`GET /v1/books/{id}`).
  - `updateListing(id, data)`: Updates book listings (`PUT /v1/books/{id}`).
- **`BookEditionPicker`:** Specialized component for selecting publication edition, printing number, and cover type (hardcover vs paperback).
- **`bookCatalogQuery`:** React Query hook querying dynamic attribute metadata from `/v1/catalog/books/attributes`.
- **`bookEdition.js` & `books.js`:** Utilities and validation schemas handling ISBN, author, publisher, publication year, page count, and language.

## Invariants

- **ISBN Formatting:** ISBN inputs validate against ISBN-10 or ISBN-13 checksum rules when provided.
- **Publication Year Boundary:** Publication year cannot exceed the current calendar year.
- **Restrained Styling:** Strict compliance with `.agents/skills/restrained-ui-design-standard/SKILL.md`: bibliographic details rendered in clean monospace or serif-accented typography, hairline dividers, and zero emojis.

