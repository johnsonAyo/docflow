# API Contract

This is the backend contract the frontend should wire to after the backend is
stable. MongoDB stores all metadata. MinIO or another S3-compatible object
store stores document artifacts.

## Health

`GET /health`

Returns active storage services and configured collection groups.

## Workflow Definitions

- `GET /workflows`
- `POST /workflows`
- `GET /workflows/{workflow_id}`
- `GET /workflows/{workflow_id}/config`
- `PUT /workflows/{workflow_id}`

Workflow response:

```json
{
  "id": "workflow-id",
  "name": "Invoice intake",
  "slug": "invoice-intake",
  "document_type": "Invoice",
  "status": "draft",
  "config": {},
  "created_at": "2026-05-24T00:00:00+00:00",
  "updated_at": "2026-05-24T00:00:00+00:00"
}
```

## Document Artifacts

`PUT /documents/artifacts/{object_key}`

Stores bytes in the configured S3-compatible document store.

Response:

```json
{
  "key": "uploads/example.pdf",
  "store": "s3-compatible",
  "uri": "s3://docflow-documents/uploads/example.pdf",
  "content_type": "application/pdf",
  "size_bytes": 12345
}
```

## Document Runs

- `GET /document-runs?workflow_id={workflow_id}`
- `POST /document-runs`
- `PUT /document-runs/{document_run_id}`

Statuses: `uploaded`, `processing`, `needs_review`, `approved`, `failed`.

## Extracted Records

- `GET /records?workflow_id={workflow_id}&document_run_id={document_run_id}`
- `POST /records`
- `PUT /records/{record_id}`

Statuses: `draft`, `needs_review`, `approved`, `exported`, `failed`.

## Review States

- `GET /review-states?workflow_id={workflow_id}&document_run_id={document_run_id}&record_id={record_id}`
- `POST /review-states`
- `PUT /review-states/{review_state_id}`

Statuses: `open`, `approved`, `rejected`, `resolved`.

## Integration Logs

- `GET /integration-logs?workflow_id={workflow_id}&record_id={record_id}`
- `POST /integration-logs`
- `PUT /integration-logs/{integration_log_id}`

Statuses: `pending`, `sent`, `failed`.

## Action History

- `GET /action-history?entity_type={entity_type}&entity_id={entity_id}`
- `POST /action-history`

Action history is append-only through the public API.
