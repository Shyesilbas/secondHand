-- Book catalog: author, publisher, work (the book itself) and edition (one ISBN). A listing may point at an
-- edition; its author/year/pages/format/language/publisher/translator are then copied from the catalog.

CREATE TABLE book_authors (
    id    UUID PRIMARY KEY,
    name  VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL
);

CREATE TABLE book_publishers (
    id    UUID PRIMARY KEY,
    name  VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(200) NOT NULL
);

CREATE TABLE book_works (
    id                   UUID PRIMARY KEY,
    name                 VARCHAR(160) NOT NULL UNIQUE,
    title                VARCHAR(300) NOT NULL,
    book_type_id         UUID NOT NULL REFERENCES book_types (id),
    book_genre_id        UUID NOT NULL REFERENCES book_genres (id),
    original_language_id UUID REFERENCES book_languages (id),
    source               VARCHAR(20) NOT NULL
);

CREATE TABLE book_work_authors (
    work_id    UUID NOT NULL REFERENCES book_works (id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES book_authors (id),
    sort_order INT  NOT NULL,
    PRIMARY KEY (work_id, author_id)
);

CREATE TABLE book_editions (
    id               UUID PRIMARY KEY,
    work_id          UUID NOT NULL REFERENCES book_works (id),
    isbn             VARCHAR(13) UNIQUE,
    publisher_id     UUID NOT NULL REFERENCES book_publishers (id),
    publication_year INT,
    page_count       INT,
    book_format_id   UUID NOT NULL REFERENCES book_formats (id),
    book_language_id UUID NOT NULL REFERENCES book_languages (id),
    translator       VARCHAR(200),
    cover_url        VARCHAR(500),
    exam_year        INT,
    source           VARCHAR(20) NOT NULL
);

CREATE INDEX idx_book_editions_work ON book_editions (work_id);
CREATE INDEX idx_book_work_authors_author ON book_work_authors (author_id);

-- books_listings.publisher already exists (V1 baseline, unused until now).
ALTER TABLE books_listings
    ADD COLUMN edition_id UUID REFERENCES book_editions (id),
    ADD COLUMN translator VARCHAR(200);

CREATE INDEX idx_books_listings_edition ON books_listings (edition_id);

-- E-books and audiobooks cannot be resold; the seed removes these formats, so listings on them move to paperback.
UPDATE books_listings
SET book_format_id = (SELECT id FROM book_formats WHERE name = 'PAPERBACK')
WHERE book_format_id IN (SELECT id FROM book_formats WHERE name IN ('E_BOOK', 'AUDIOBOOK'))
  AND EXISTS (SELECT 1 FROM book_formats WHERE name = 'PAPERBACK');
