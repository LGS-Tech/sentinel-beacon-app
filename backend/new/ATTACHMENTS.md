# Case attachments API

Metadata-only attachments linked to Postgres `cases`. **No binary storage in PostgreSQL** — the client (or a future upload service) stores the file and sends a `storageUrl` reference.

## Endpoints (after merge with Core API)

Base path: **`/api/cases/:caseId/attachments`**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cases/:caseId/attachments` | List attachments for a case |
| POST | `/api/cases/:caseId/attachments` | Register an attachment reference |
| GET | `/api/cases/:caseId/attachments/:attachmentId` | Get one attachment |
| DELETE | `/api/cases/:caseId/attachments/:attachmentId` | Remove attachment metadata |

### POST body (JSON)

```json
{
  "filename": "broken-tap.jpg",
  "mimeType": "image/jpeg",
  "storageUrl": "https://cdn.example.com/vault/case-123/broken-tap.jpg",
  "storageProvider": "external",
  "fileSizeBytes": 245760,
  "uploadedByUserId": 7
}
```

Required: `filename`, `storageUrl`.

### Response shape

```json
{
  "id": "uuid",
  "caseId": "uuid",
  "filename": "broken-tap.jpg",
  "mimeType": "image/jpeg",
  "storageUrl": "https://...",
  "storageProvider": "external",
  "fileSizeBytes": 245760,
  "uploadedByUserId": 7,
  "uploadedByName": "Aisha Khan",
  "createdAt": 1787102249027
}
```

## Merge with `feature/core-api-auth`

In `routes/casesRoutes.js`, **before** `router.get("/:id", getCase)`:

```js
const caseAttachmentsRoutes = require("./caseAttachmentsRoutes");
router.use("/:caseId/attachments", caseAttachmentsRoutes);
```

Then wrap with `authenticate` (same as other case routes) once auth middleware is final.

Update root `/` endpoint list to include attachments if desired.

## Database

Table: `case_attachments` in `db/schema.sql`  
Queries: `db/queries/attachments.js`  
Access: `const db = require("./db"); await db.attachments.listAttachmentsByCaseId(caseId);`

Apply schema:

```bash
cd backend/new
npm run db:setup
npm run db:smoke-attachments
```

## Coordination notes

- Does **not** change `server.js` on `main` (still Mongo) — routes ship on this branch for merge after / alongside Muna's Core API PR.
- File upload binary handling is **out of scope** for this sprint; frontend can use a placeholder URL until Blob/S3 is chosen.
