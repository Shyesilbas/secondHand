# Cloudinary Domain

Handles stateless cloud image uploads and format/dimension optimization via Cloudinary (`CloudinaryService`).

> [!NOTE]
> **Related Documentation & Runbooks:**
> - **Architecture Deep Dive:** [`docs/external-integrations-cloudinary-and-exchange.md`](/docs/external-integrations-cloudinary-and-exchange.md)
> - **Key Entry Points:** [`ImageController`](api/ImageController.java) · [`CloudinaryService`](application/CloudinaryService.java) · [`CloudinaryConfig`](CloudinaryConfig.java)

## Business Rules & Invariants
- **Stateless Cloud Storage:** Image binaries are never written to local disk or PostgreSQL; uploads stream directly to the `secondhand-listings` folder in Cloudinary and return an HTTPS `secure_url`.
- **Strict MIME & Size Validation:** Accepts only `image/jpeg`, `image/png`, `image/gif`, and `image/webp` (verified by both `Content-Type` and file extension) up to 10 MB.
- **Edge Optimization:** Uploads apply `quality: auto`, `fetch_format: auto`, and `crop: limit` (max 800x600); upload failures throw `BusinessException` (`IMAGE_UPLOAD_FAILED`).
- **No Delete Endpoint:** Uploads are not tied to an owner, so the API deletes nothing. A delete endpoint needs an ownership record first; never delete by a client-supplied URL.

## API (`ImageController`, `/api/v1/images`)
- `POST /upload` — upload a multipart image file (returns JSON with `url`).
