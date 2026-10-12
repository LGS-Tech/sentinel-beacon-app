# Case attachments API

Authenticated Vault PDFs. **Bytes go to Cloudflare R2. PostgreSQL stores metadata only.**

## Endpoints

Base path: **`/cases/:caseId/attachments`** (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cases/:caseId/attachments` | List attachment metadata for a case |
| POST | `/cases/:caseId/attachments` | Multipart upload (`file`) of a PDF |
| GET | `/cases/:caseId/attachments/:attachmentId` | Get one attachment |
| GET | `/cases/:caseId/attachments/:attachmentId/content` | Stream the PDF through the API |
| DELETE | `/cases/:caseId/attachments/:attachmentId` | Delete metadata, then the R2 object |

Allowed type: **PDF**. Max size: **10 MB**.

`storageUrl` in the JSON response is an API path, not a public R2 URL. Postgres stores the private object key.

R2 env vars (server only): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.
