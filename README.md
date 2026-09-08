# Sissy 🎀 — Personal Website

A responsive personal profile + public photo/video gallery.

## Run locally

1. Install Node.js 18+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Make it world-wide

Deploy this folder to a Node-capable host such as Render, Railway, Fly.io, or your own VPS. Set the app's port from `PORT` (the server already supports it).

### Important storage note

The demo stores uploads on the server filesystem. On many modern cloud hosts, that filesystem is ephemeral, so a production site should switch the upload storage to persistent object storage (Cloudinary, Supabase Storage, Amazon S3, Backblaze B2, etc.) and put authentication/moderation in front of the admin/delete route.

## Production hardening

Before public launch, add:
- owner authentication for upload/delete
- persistent object storage
- HTTPS
- upload virus scanning and stricter MIME/type validation
- rate limiting and abuse reporting
- privacy/consent policy
- optional private/unlisted media mode
- image/video size and duration limits

The included profile image is the photo supplied in this conversation.
