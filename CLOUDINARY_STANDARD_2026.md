# Cloudinary Standard 2026 — Upload, Search & Updates

This document defines how this project uses **Cloudinary** for idea supporting documents: uploads, search, and updates. It aligns with Cloudinary’s current APIs and 2025/2026 practices.

---

## 1. Overview

| Capability  | Purpose                                        | Where                                     |
| ----------- | ---------------------------------------------- | ----------------------------------------- |
| **Upload**  | Staff attach supporting documents to proposals | Signed upload from browser → Cloudinary   |
| **Search**  | Find assets by folder, idea, or criteria       | DB for in-app; Admin/Search API for audit |
| **Updates** | Change metadata or remove assets               | Admin API (server-side only)              |

- **Folder**: All idea attachments live in Cloudinary folder `idea-attachments`.
- **References**: We store only refs in our DB (`cloudinaryPublicId`, `secureUrl`, `fileName`, `mimeType`, `sizeBytes`); files stay in Cloudinary.
- **Secrets**: `CLOUDINARY_API_SECRET` is used only on the backend; never exposed to the client.

---

## 2. Upload (Current)

- **Method**: [Upload API](https://cloudinary.com/documentation/image_upload_api_reference) — **signed** upload.
- **Flow**: Backend returns short-lived signed params (`GET /api/ideas/upload-params`); frontend POSTs the file directly to `https://api.cloudinary.com/v1_1/{cloud_name}/raw/upload`.
- **Resource type**: `raw` (documents and any file type).
- **Folder**: `idea-attachments`.
- **Limits**: Max 10 files per idea, 10 MB per file; allowed types: PDF, Word, images, `.txt`.

See **CLOUDINARY_SETUP.md** for account setup and env vars.

---

## 3. Search

### 3.1 In-app search (by idea)

- **Source of truth**: Our database.
- **Behaviour**: Attachments for an idea are read from `IdeaAttachment` (by `ideaId`). No direct Cloudinary call is needed for normal “view idea attachments” or “list my ideas’ attachments”.
- **Use**: Staff and idea detail pages use DB-only for listing and linking to `secureUrl`.

### 3.2 Admin / audit search (Cloudinary)

When you need to **list or search assets inside Cloudinary** (e.g. audit, reconciliation, support):

- **By folder**: Use [Admin API – List resources](https://cloudinary.com/documentation/admin_api#get_resources):
  - `GET https://api.cloudinary.com/v1_1/{cloud_name}/resources/image` (or `raw`) with `type=upload` and `prefix=idea-attachments`.
  - Requires server-side auth (cloud name, API key, API secret).
- **Advanced search**: Use [Search API](https://cloudinary.com/documentation/searching_for_assets) (Lucene-style expressions, e.g. by folder, date, size). Available on Advanced plans; use from backend only with API secret.

**Standard**: Any Cloudinary **search** used for admin or audit must run on the backend (never expose API secret to the client). Prefer DB queries for in-app “search by idea”; use Admin/Search API only when you need to inspect or reconcile Cloudinary assets.

---

## 4. Updates

### 4.1 Metadata updates

- **API**: [Admin API](https://cloudinary.com/documentation/admin_api) or [Upload API – Explicit](https://cloudinary.com/documentation/image_upload_api_reference#explicit_method) with context/metadata.
- **Use**: To add or change metadata (e.g. tags, custom fields) for an asset identified by `public_id`.
- **Where**: Backend only; use `CLOUDINARY_API_SECRET` for signing.

### 4.2 Deleting assets

- **API**: [Admin API – Delete resources](https://cloudinary.com/documentation/admin_api#delete_resources) or Upload API `destroy`.
- **When**:
  - **Required**: When an idea is permanently deleted, delete its attachments from Cloudinary so we do not keep orphaned files (GDPR/data minimisation).
  - **Optional**: Cleanup or “remove attachment” flows; prefer soft-delete in DB and optional Cloudinary delete for audit.
- **How**: For each `IdeaAttachment` of the idea, call delete with `cloudinaryPublicId` (and `resource_type: 'raw'` for non-image). Run this on the backend after (or in the same transaction as) deleting the idea/attachments in the DB.
- **Limit**: Admin API can delete up to 100 `public_id`s per call; batch if an idea has many attachments.

**Standard**: Any **update** or **delete** of Cloudinary assets must be performed server-side using the Admin (or Upload) API with the API secret. No client-side delete or metadata update with the secret.

---

## 5. Security checklist

- [ ] `CLOUDINARY_API_SECRET` only in backend env; never in frontend or public config.
- [ ] Upload: only signed params from backend; frontend never holds the secret.
- [ ] Search/updates: only from backend services; no client-side Admin/Search API calls with secret.
- [ ] CORS and Cloudinary: uploads go directly from browser to `api.cloudinary.com`; our backend only issues params and stores refs.

---

## 6. References

- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Cloudinary Admin API](https://cloudinary.com/documentation/admin_api)
- [Cloudinary Search API](https://cloudinary.com/documentation/searching_for_assets)
- [Authentication (signatures)](https://cloudinary.com/documentation/authentication_signatures)
- [Node.js asset administration](https://cloudinary.com/documentation/node_asset_administration)

---

## 7. Summary table (code)

| Action                         | Endpoint / code                    | Who   | Notes                                                  |
| ------------------------------ | ---------------------------------- | ----- | ------------------------------------------------------ |
| Upload file                    | `GET /api/ideas/upload-params`     | STAFF | Folder: `idea-attachments`                             |
| List attachments for idea      | DB (`IdeaAttachment` by ideaId)    | App   | No Cloudinary call                                     |
| List assets in folder (search) | `GET /api/cloudinary/resources`    | ADMIN | Query: prefix, resource_type, max_results, next_cursor |
| Delete assets by public_id     | `DELETE /api/cloudinary/resources` | ADMIN | Body: `{ publicIds, resource_type? }`, max 100         |
| Delete idea + Cloudinary       | `DELETE /api/ideas/:id`            | ADMIN | `IdeasService.deleteIdea()` → Cloudinary → Prisma      |

## 8. Implementation (backend)

- **CloudinaryModule**: `CloudinaryService` (list, delete), `CloudinaryController` (ADMIN-only search and delete).
- **IdeasModule**: Imports `CloudinaryModule`; `IdeasService.deleteIdea()` uses `CloudinaryService` to remove attachment files when an idea is deleted.
- **IdeasController**: `DELETE /ideas/:id` with `@Roles('ADMIN')` calls `IdeasService.deleteIdea(id)`.

This is the **New 2026 Standard** for Cloudinary in this project: upload as implemented, search via DB + `GET /api/cloudinary/resources` for admin audit, and updates/deletes via backend only (`DELETE /api/cloudinary/resources` and `DELETE /api/ideas/:id`).
