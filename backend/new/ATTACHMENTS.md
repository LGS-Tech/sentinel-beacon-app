# Case attachments API

Authenticated Vault files. **Bytes go to Cloudflare R2. PostgreSQL stores metadata only.** The API never writes files to the Render disk, and R2 credentials never leave the server.

## Endpoints

Base path: **`/cases/:caseId/attachments`** (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cases/:caseId/attachments` | List attachment metadata for a case |
| POST | `/cases/:caseId/attachments` | Multipart upload (`file`) to R2, then insert metadata |
| GET | `/cases/:caseId/attachments/:attachmentId` | Get one attachment (metadata + content path) |
| GET | `/cases/:caseId/attachments/:attachmentId/content` | Stream the file through the API (auth required) |
| DELETE | `/cases/:caseId/attachments/:attachmentId` | Delete R2 object and metadata |

Allowed types: **TXT, PDF, JPG, PNG**. Max size: **10 MB**.

### POST (multipart)

Field name: `file`

```bash
curl -X POST "$API/cases/$CASE_ID/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@broken-tap.jpg;type=image/jpeg"
```

JSON body uploads (client-supplied URLs) are rejected. The server chooses the R2 object key.

### Response shape

```json
{
  "id": "uuid",
  "caseId": "uuid",
  "filename": "broken-tap.jpg",
  "mimeType": "image/jpeg",
  "storageUrl": "/cases/uuid/attachments/uuid/content",
  "storageProvider": "r2",
  "fileSizeBytes": 245760,
  "uploadedByUserId": 7,
  "uploadedByName": "Aisha Khan",
  "createdAt": 1787102249027
}
```

`storageUrl` is an API path, not a public R2 URL. Open files by fetching that path with the same Bearer token. Postgres stores the private object key; that key is not returned to clients.

Upload failures return a controlled JSON error (`400` / `413` / `502` / `503`) — they do not crash the API.

## Storage

| Layer | What it holds |
|-------|----------------|
| Cloudflare R2 | File bytes (private bucket) |
| PostgreSQL `case_attachments` | filename, MIME type, size, provider, object key, uploader |
| Render disk | nothing |

R2 env vars (server only, see `.env.example`):

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

Do not put these in Expo / GitHub Pages env.

`GET /health` includes `"storage": { "ready": true, "provider": "r2" }` when those vars are set. It does not echo secrets or the bucket name.

## Database

Table: `case_attachments` in `db/schema.sql`  
Queries: `db/queries/attachments.js`

```bash
cd backend/new
npm run db:setup
npm run smoke:vault-files
npm run db:smoke-attachments
```
