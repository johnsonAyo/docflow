# Storage Architecture

DocFlow stores operational metadata and document artifacts behind separate
interfaces so the local-first MVP can move to managed infrastructure later.
MongoDB and an S3-compatible object store are required from day one. JSON and
filesystem stores are not runtime fallbacks.

## Metadata

MongoDB is the primary metadata store for:

- workflow definitions
- document runs
- extracted records
- review states
- integration logs
- action history

Environment:

```bash
DOCFLOW_MONGODB_URI=mongodb://localhost:27017
DOCFLOW_MONGODB_DATABASE=docflow
```

## Document Artifacts

MinIO or another S3-compatible object store is the v1 target for:

- original uploads
- page images
- OCR text
- evidence crops
- processed artifacts

Environment:

```bash
DOCFLOW_S3_ENDPOINT_URL=http://localhost:9000
DOCFLOW_S3_ACCESS_KEY_ID=minioadmin
DOCFLOW_S3_SECRET_ACCESS_KEY=minioadmin
DOCFLOW_S3_REGION=us-east-1
DOCFLOW_DOCUMENT_BUCKET=docflow-documents
```

## Backup And Export Expectations

- Back up MongoDB with `mongodump` or the equivalent managed-provider snapshot.
- Back up object storage by bucket replication, object lifecycle exports, or
  provider snapshots.
- Treat metadata and object artifacts as one recovery set. A record without its
  source document artifact is incomplete.
- Keep object keys stable and store artifact references in MongoDB records.
