# Cloudinary Domain

Handles stateless cloud image uploads, format/dimension optimization, and remote asset deletion via Cloudinary (`CloudinaryService`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/external-integrations-cloudinary-and-exchange.md`](/docs/external-integrations-cloudinary-and-exchange.md)
> - **Key Entry Points:** [`ImageController`](api/ImageController.java) · [`CloudinaryService`](application/CloudinaryService.java) · [`CloudinaryConfig`](CloudinaryConfig.java)

## Business Rules & Invariants
- **Stateless Cloud Storage:** Image binaries are never written to local disk or PostgreSQL; uploads stream directly to the `secondhand-listings` folder in Cloudinary and return an HTTPS `secure_url`.
- **Strict MIME & Size Validation:** Accepts only `image/jpeg`, `image/png`, `image/gif`, and `image/webp` (verified by both `Content-Type` and file extension) up to 10 MB.
- **Edge Optimization & Orphan Cleanup:** Uploads apply `quality: auto`, `fetch_format: auto`, and `crop: limit` (max 800x600). Deleting an image extracts `public_id` from the URL and calls Cloudinary's destroy API; upload failures throw `BusinessException` (`IMAGE_UPLOAD_FAILED`), while remote delete errors are logged without failing calling transactions.

## API (`ImageController`, `/api/v1/images`)
- `POST /upload` — upload a multipart image file (returns JSON with `url`).
- `DELETE /delete` — delete an uploaded image from Cloudinary by URL.
