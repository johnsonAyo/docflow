# Document OCR Engine Context

Source project note:

`/Users/johnsonafuye/Desktop/Second Brain/Projects/document-ocr-engine.md`

## Goal

Build a web app where a business user can configure a document workflow, upload PDFs or scanned files, review extracted data, and export or send structured records without needing to understand OCR internals.

## Product Positioning

Document OCR Engine is a configurable document operations engine for internal business teams.

It is not just OCR. OCR is the engine. The product is the operational workflow around documents:

- ingestion
- OCR and extraction
- field schema configuration
- validation rules
- human review
- structured record storage
- exports and webhooks
- insights and follow-up actions

## Background

Teacher grading remains a possible workflow module, but the main product is Document OCR Engine: a configurable workflow builder for document-heavy business operations.

## Core Proof Workflows

### Invoice Intake

Extract vendor, invoice number, dates, currency, totals, line items, payment terms, and review issues. Export structured records as CSV and send them through webhook/API.

### Contract Intake

Extract parties, dates, renewal/termination terms, payment terms, obligations, penalties, auto-renewal clauses, and risk flags. Generate reviewable summaries and structured records.

## Delivery Modes

Document OCR Engine can deliver a workflow result in more than one way. The canonical first-v1 delivery mode is a **shareable live report**:

- a browser-based report URL
- owner and read-only access variants
- chronological presentation of the extracted records
- source evidence visible alongside the extracted facts

Other delivery modes, such as CSV export and downstream pushes, are separate outcomes and should be treated as distinct workflow outputs.

## Bundle Creation

The canonical v1 bundle-creation rule is **manual grouping during upload**:

- the user groups files/pages into one bundle before processing
- a bundle represents one logical case, transaction, or record set
- the system should not infer bundles automatically in v1

## Artifact Storage

The canonical v1 artifact policy is to store both:

- the original uploaded file, intact, for provenance
- normalized page-level artifacts, for OCR, evidence, and report rendering

## Evidence Model

The canonical v1 evidence model uses both:

- full-page OCR context
- field-level evidence snippets or crops when a value can be traced to a narrower source region

## Language Scope

Translation is deferred for v1.

- only English-language documents are in scope for the first release
- OCR should still preserve the original document text as extracted text
- non-English translation is a later capability, not part of the first pipeline

## Extraction Contract

The canonical v1 extraction output must include:

- structured fields
- confidence per field
- an evidence pointer for each field when possible

## Share Gate

The canonical v1 report becomes shareable only after human review and approval.

## Report Access

Tokenized report access is deferred for v1.

- the report remains approval-gated
- share-token permissions are a later capability
- v1 does not need separate owner/read-only tokens

## Report Permissions

The canonical v1 permission split is:

- owner can edit the approved report
- everyone else gets view-only access

## Auth Scope

V1 has no authentication.

- the owner edits through the local workspace, not through the shared report link
- the shared report remains view-only for everyone else
- v1 assumes a single trusted local owner session

## Owner Workspace

The canonical v1 owner workspace is a local single-user workspace.

- it is used to create, review, and edit approved reports
- it does not require authentication in v1
- it is separate from the shared view-only report URL

## Report Content

The canonical v1 shared report should show:

- chronological document bundle timeline
- extracted fields
- evidence
- approval status

## Report Interaction

The canonical v1 shared report is strictly linear.

- no search/filter inside the report
- no embedded chat in the report
- the report is a readable review artifact, not an exploration interface

## Coming Soon

The following are intentionally not in v1, but should be shown as coming soon:

- downstream delivery modes other than the shared report
- API-based ingestion
- inbox-based ingestion
- any non-upload ingestion pipeline

## Upload Scope

The canonical v1 upload inputs are:

- PDF files
- image files

## Bundle Upload Shape

The canonical v1 bundle can contain multiple uploaded files.

## Processing Mode

The canonical v1 processing mode is background jobs.

- upload starts a background processing task
- uploaded files are stored in the document bucket first
- the document bucket is the canonical file-store term for v1
- processing auto-starts on upload

## Status Semantics

The canonical v1 status ladder is:

- `uploaded` = file has been stored and queued for processing
- `processing` = the system is actively running OCR or extraction
- `needs_review` = the system completed processing, but human correction is needed
- `approved` = a human reviewed and accepted the extracted record
- `failed` = a system error prevented processing from completing

- humans can only move a run from `needs_review` to `approved`
- humans do not mark a run `failed`
- `failed` is reserved for system-level processing errors

## Shareable State

The canonical v1 `approved` state is shareable.

- there is no separate publish step in v1
- once a run is approved, the shared report can be viewed

## Failed Runs

The canonical v1 failed-run behavior is:

- the run stays visible in the owner workspace
- the run shows the processing error
- the run does not become shareable
- the owner can retry by re-uploading or reprocessing

## Retry Model

The canonical v1 retry model creates a new run.

- retries do not overwrite the original run
- each processing attempt gets its own run history
- the workspace can show multiple attempts for the same bundle

## Run Removal

The canonical v1 failed-job behavior is:

- failed jobs can be retried or deleted
- retry keeps the same PDF and lets the owner edit workflow or fields
- retrying is about fixing the job, not changing the source document
- deletion is reserved for failed jobs in v1

## Retry Record

The canonical v1 retry model keeps the same job record and adds a new attempt.

- the source PDF stays the same
- workflow and field edits apply to the retry
- attempts are tracked under the same job record

## Delete Semantics

The canonical v1 delete behavior is workspace-only removal.

- deletion removes the failed job from the main workspace view
- deletion is used when the job is recoverable and can be rerun
- the source PDF remains available so the same job can be run again

## Rerun Flow

The canonical v1 rerun flow happens after editing workflow or fields.

- the owner can correct workflow or field settings before rerunning
- rerun uses the same source PDF
- rerun is for fixing the job, not replacing the input document

## Rerun Input

The canonical v1 rerun input is the same PDF only.

- rerun does not swap to a different source document
- changing the source PDF should create a new job

## Bundle Reordering

The canonical v1 reorder rule is file-level only.

- files can be reordered inside the bundle before processing
- pages inside a multi-page file stay together
- v1 does not support page-level reordering

## Report Ordering

The canonical v1 shared report follows the bundle's file order.

- the report mirrors how the owner assembled the case
- it does not sort by upload time or process time

## Report Structure

The canonical v1 shared report is grouped by file.

- each file has its own section
- extracted fields live under the corresponding file section
- the bundle structure stays visible in the report

## Report Header

The canonical v1 report includes a summary header above the file sections.

## Report Header Content

The canonical v1 summary header includes:

- bundle title
- approval status
- file count
- simple extraction summary

## Confidence Display

The canonical v1 report shows low-confidence values inline.

- every extracted value should display its confidence state when relevant
- uncertainty stays visible in the shared report
- the report does not hide low-confidence values behind a separate mode

## Edit Flow

The canonical v1 owner edit flow happens before approval.

- the owner reviews extracted values in the workspace
- changes are made before the report is approved and shared

## Edit Scope

The canonical v1 owner edit scope is freeform corrections to extracted fields only.

- the owner can adjust extracted field values directly
- the owner is not editing the OCR source text itself
- the owner is not editing the original uploaded files

## Audit Trail

The canonical v1 system keeps both the original extraction and the corrected value.

- original extracted values remain available for comparison
- corrected values become the approved report values
- the report can distinguish between extracted and approved data

## Report Visibility

The canonical v1 shared report does not show the full raw OCR text by default.

- the report focuses on extracted facts and evidence
- the raw OCR text remains an internal workspace artifact

## Debugging View

The canonical v1 owner workspace includes an advanced raw OCR text view.

- the advanced view is for debugging and verification
- it is not part of the shared report experience

## Architecture Defaults

- Backend: FastAPI
- Frontend: React, TypeScript, Vite
- Database: MongoDB for workflows, document runs, extracted records, review states, integration logs, and action history
- Document storage: free S3-compatible object store such as MinIO for originals, page images, OCR text, evidence crops, and processed artifacts
- Local filesystem storage: development fallback only
- OCR: provider-configurable (Tesseract default)
- Image preprocessing: OpenCV
- AI/extraction: provider-configurable
- Workflow config: visual builder persisted as JSON/YAML-compatible structured data
- Export: CSV, webhook, REST API

## Core Product Rule

Document OCR Engine must be useful to non-technical users through a visual step-by-step workflow builder, while still exposing structured config for technical users.

Primary builder flow:

```txt
Choose Document Type -> Define Fields -> Set Review Rules -> Choose Actions -> Test Workflow -> Run Documents
```

Do not build a drag-and-drop node canvas in v1. A linear step-by-step builder is clearer and more trustworthy for non-technical operators.

## Design Rule

The UI is a first-class product requirement.

Use `design-taste-frontend` and `minimalist-ui` as the design basis:

- premium utilitarian minimalism
- document-style interface
- warm off-white canvas
- charcoal text
- subtle borders
- restrained status colors
- strong typography
- quiet surfaces
- no generic dashboard look
- no neon AI styling
- no AI-purple gradients

The main screens should be:

1. Workspace Home
2. Workflow Builder
3. Document Run
4. Review Queue
5. Records Table
6. Integration Panel

## Boundaries To Preserve

- OCRProvider
- ExtractionProvider
- WorkflowDefinitionStore
- DocumentStore
- RecordRepository
- JobRunner
- IntegrationProvider
- ExportProvider
- ReviewQueue

## Current Build Focus

The landing page is in place and deployed. The first static application workflow shell now exists at `#/app`.

Current app UI includes:

- sidebar navigation for Workflows, Runs, Review Queue, Records, and Integrations
- contract intake workflow builder
- workflow stages
- field schema table
- review rules
- delivery actions
- latest runs
- evidence preview

Next focus:

- make workflow stages selectable
- make fields editable
- make review rules configurable
- make delivery actions configurable
- let users switch between document runs
- wiring the frontend to the backend REST API (since backend models, MongoDB/MinIO storage, and routing are now fully configured)
- designing and implementing the `OcrEngine` interface for extracting data from documents

Avoid continuing the old school-only grading UI.

## Frontend Code Style

The following rules apply to the React/TypeScript frontend (apps/web):

- **Single Responsibility Functions**: Keep functions small and named for one job. Extract validation, formatting, fetching, mapping, and rendering helpers when a function does more than one thing.
- **Dumb Pages**: Keep page files mostly as view/composition files. They may call one or two high-level data functions at the top, but should never contain raw queries, request construction, API mapping loops, or business logic.
- **Reusable Data Logic**: Put reusable server/data fetching logic in `lib/` or a feature-specific data module.
- **Custom Hooks for State**: For client-side fetching, form behavior, derived UI state, browser APIs, validation, filtering, modals, local persistence, and other stateful flows, use custom hooks in a `hooks/` folder. Views/components should call hooks and render their returned state/actions without owning bulky logic.
- **Clean Components**: Keep components clean: props in, UI out. Move arrays, option lists, validation messages, and complex constants out of JSX.
- **Inline Tailwind**: Keep Tailwind styles inline inside `className`. Do not abstract utility class strings into external constant files.
- **String Localization**: Keep short strings inline. Only move strings to localization/labels files if they are long descriptions or paragraphs that are longer than their variable references.
- **Shared Types**: Use standard TypeScript types/interfaces for shared content shapes across the application.
- **Meaningful Comments**: Use succinct comments only for non-obvious behavior. Avoid comments that restate the code.

## Backend Code Style

The following rules apply to the FastAPI Python backend (apps/api):

- **Separation of Concerns**: Keep concerns separated by layer (`domain`, `services`, `infrastructure`, `api`, `core`).
- **Single Responsibility Functions**: Keep functions small and named for one job. Extract validation, formatting, mapping, and core logic when a function does more than one thing.
- **Structured Exceptions**: Use structured custom exceptions with machine-readable error codes and details rather than generic errors.
- **Rate Limiting**: Apply IP-based rate limiting on sensitive or computationally expensive endpoints.
- **Structured Telemetry**: Emit structured JSON telemetry logs for operational observability.
- **Shared Types**: Use standard types/models (e.g., Pydantic models) for shared data shapes across the application.
- **Meaningful Comments**: Use succinct comments only for non-obvious behavior. Avoid comments that restate the code.
