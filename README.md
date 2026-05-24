# Document OCR Engine

Document OCR Engine is a document operations platform. It gives operations teams a structured way to define document workflows, extract critical data, resolve exceptions with human review, and deliver clean records into the business systems that need them.

Supported document types include invoices, contracts, admission forms, bills of lading, HR documents, and any structured business document.

## Stack

- **API** — FastAPI (Python)
- **Database** — SQLite (configurable)
- **Web** — React + TypeScript (Vite)

## Run The API

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

## Run The Web App

```bash
cd apps/web
npm install
npm run dev
```

The web app expects the API at `http://localhost:8000`. Override with:

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

## Document Workflow

```
Define Document Type → Configure Fields → Set Review Rules → Choose Delivery → Run Documents
```

Core capabilities:

- Invoice intake and contract intake
- Configurable field extraction
- Human review queue with confidence scoring
- Structured records table
- CSV export, webhook delivery, and REST API

## Repo Layout

```
document-ocr-engine/
  apps/
    api/          # FastAPI backend
    web/          # React + TypeScript frontend
  data/
    uploads/      # uploaded PDFs and images
    processed/    # OCR outputs and parsed documents
    demo/         # sample demo inputs
  docs/
    milestones.md
  CONTEXT.md
```

## Design Standard

Document OCR Engine should look and feel like serious business operations software. The visual direction is premium utilitarian minimalism:

- Warm off-white canvas, charcoal text
- Disciplined spacing and subtle borders
- Document evidence shown alongside extracted fields
- Clear statuses: `Ready`, `Needs review`, `Missing field`, `Approved`, `Sent`
- No neon gradients or cluttered node canvases

## Source Context

Authoritative project context:

`/Users/johnsonafuye/Desktop/Second Brain/Projects/document-ocr-engine.md`
