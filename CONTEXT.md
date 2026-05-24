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
- Database: SQLite (configurable)
- Storage: filesystem under `data/` (configurable)
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

The next build step is to reconcile the existing frontend draft with the Document OCR Engine direction.

Focus on:

- professional product shell
- workflow builder
- demo mode for invoice and contract examples
- review queue
- records table
- integration panel

Avoid continuing the old school-only grading UI.
