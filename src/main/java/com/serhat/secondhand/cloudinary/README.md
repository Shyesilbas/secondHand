# Cloudinary Domain

## Purpose
The `cloudinary` domain manages external cloud image storage, CDN delivery, file validation, automatic format optimization, and image removal for listing photos and user avatars.

## Architecture Overview
- **Cloud Storage:** Files are not persisted on the application server or in PostgreSQL; they are streamed directly to Cloudinary and referenced via HTTPS `secure_url`.
- **Optimization Pipeline:** Upload parameters enforce `quality: auto`, `fetch_format: auto` (serving WebP/AVIF to compatible browsers), with automatic dimensions capped at 800x600 (`crop: limit`).
- **Isolation:** Managed via `CloudinaryService` and exposed to frontend multipart form uploads via `ImageController`.

## Business Invariants & Constraints
- **Allowed Formats:** Only `image/jpeg`, `image/png`, `image/gif`, and `image/webp` are permitted.
- **Size Limitation:** Maximum file size is strictly capped at 10 MB per image.
- **Folder Scoping:** Listing images are isolated in the `secondhand-listings` folder on Cloudinary.
- **Public ID Extraction:** Deleting an image parses the public ID from the stored URL and invokes Cloudinary's destroy API to prevent orphaned assets.

## Public APIs
- `POST /api/images/upload`: Uploads a `MultipartFile` and returns `{ "url": "https://res.cloudinary.com/..." }`.
- `DELETE /api/images/delete`: Accepts `{ "imageUrl": "..." }` and cleans up the remote asset.
