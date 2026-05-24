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
