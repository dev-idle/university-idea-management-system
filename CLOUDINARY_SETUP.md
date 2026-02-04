# Cloudinary setup for idea supporting documents

Supporting documents for ideas are uploaded to **Cloudinary** (optional). If Cloudinary is not configured, the "Upload document" option is hidden and staff can still submit ideas without attachments.

For **search and updates** (how we find assets, update metadata, and delete when needed), see **CLOUDINARY_STANDARD_2026.md**.

## 1. Create a Cloudinary account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up (free tier is enough to start).
2. Log in to the **Dashboard**.

## 2. Get your credentials

In the Dashboard you’ll see:

- **Cloud name**
- **API Key**
- **API Secret** (click “Reveal” to copy)

Keep the API Secret private (server-side only).

## 3. Configure the backend

Add these to your backend environment (e.g. `.env` in the `backend` folder):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with the values from the Dashboard.

Restart the backend so it picks up the new variables.

## 4. How it works

- **Staff** open “Submit proposal” and see **“Upload document”** when Cloudinary is configured.
- Files are sent **directly from the browser to Cloudinary** using a **signed upload**: the backend returns a short-lived signature; the frontend uses it to upload without sending files through your server.
- Uploaded files are stored in the Cloudinary folder `idea-attachments`.
- When the proposal is submitted, only **references** (public id, URL, file name, size) are saved in your database; the actual files stay in Cloudinary.

## 5. Limits (frontend)

- **Max 10** supporting documents per idea.
- **Max 10 MB** per file.
- Allowed types: PDF, Word (`.doc`, `.docx`), plain text, and common images (JPEG, PNG, GIF, WebP).

## 6. Optional: Cloudinary Dashboard

In the Cloudinary Dashboard you can:

- See all uploads under **Media** (folder: `idea-attachments`).
- Set **Transformations** or **Access control** if needed later.
- Check **Usage** for free-tier limits.

## 7. Troubleshooting

| Issue                      | What to do                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| “Upload is not configured” | Add the three `CLOUDINARY_*` env vars to the backend and restart.                                          |
| Upload fails with 401      | Ensure `CLOUDINARY_API_SECRET` matches the Dashboard and there are no extra spaces.                        |
| Upload fails with 4xx/5xx  | Check Cloudinary status and your plan/limits. Inspect the browser Network tab for the Cloudinary response. |

No frontend env vars are required; the backend provides the signed upload parameters to the client.
