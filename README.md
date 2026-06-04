# Document OCR Engine

Document OCR Engine is a document operations platform. It gives operations teams a structured way to define document workflows, extract critical data, resolve exceptions with human review, and deliver clean records into the business systems that need them.

Supported document types include invoices, contracts, admission forms, bills of lading, HR documents, and any structured business document.

## Stack

- **API** — FastAPI (Python)
- **Metadata store** — MongoDB for workflows, document runs, records, review state, integration logs, and action history
- **Document store** — MinIO or another S3-compatible object store for originals and processed artifacts
- **Web** — React + TypeScript (Vite)

## Run The API

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
python -m uvicorn app.main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

Storage configuration:

```bash
export DOCFLOW_MONGODB_URI=mongodb://localhost:27017
export DOCFLOW_MONGODB_DATABASE=docflow

export DOCFLOW_S3_ENDPOINT_URL=http://localhost:9000
export DOCFLOW_S3_ACCESS_KEY_ID=minioadmin
export DOCFLOW_S3_SECRET_ACCESS_KEY=minioadmin
export DOCFLOW_DOCUMENT_BUCKET=docflow-documents

export DOCFLOW_OCR_PROVIDER=google_vision
export DOCFLOW_GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account", "...":"..."}'
export DOCFLOW_TESSERACT_COMMAND=tesseract
export DOCFLOW_OLLAMA_BASE_URL=http://localhost:11434
export DOCFLOW_OLLAMA_MODEL=llama3.1:8b
```

MongoDB and MinIO are required runtime services. Tests can mock these
boundaries, but the application does not use JSON or filesystem storage as a
runtime fallback.

OCR and extraction use a provider boundary:

- text uploads are processed directly
- PDFs and images can use Google Vision OCR by setting
  `DOCFLOW_OCR_PROVIDER=google_vision`
- Google Vision credentials can be supplied with
  `DOCFLOW_GOOGLE_APPLICATION_CREDENTIALS_JSON` or the standard
  `GOOGLE_APPLICATION_CREDENTIALS` file path
- Tesseract remains installed as the local/dev fallback when system
  dependencies are available
- extracted OCR text is sent to Ollama for structured field extraction
- if Ollama is unavailable, the API falls back to the rule-based extractor and
  records a review issue

Local MongoDB, MinIO, and Redis can be started with:

```bash
docker compose up -d mongodb minio redis
```

MinIO console: `http://localhost:9001` with `minioadmin` / `minioadmin`.

## Run the Celery Worker
Background document processing is handled by Celery. Open a new terminal:
```bash
cd apps/api
source .venv/bin/activate
celery -A app.worker.celery_app worker --loglevel=info
```

MinIO console: `http://localhost:9001` with `minioadmin` / `minioadmin`.

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

## Run Everything With Docker

This is the simplest way to run the whole stack without keeping multiple local
processes open:

```bash
docker compose up --build
```

That single command starts:

- MongoDB on `localhost:27017`
- MinIO on `localhost:9000` and the console on `localhost:9001`
- Redis on `localhost:6379`
- API on `localhost:8000`
- Celery worker
- Web app on `localhost:5173`

Keep that terminal open to watch the combined logs for every service.

Stop everything with:

```bash
docker compose down
```

If the stack is already running and you only want the logs:

```bash
docker compose logs -f
```

## Cloud Deployment Notes

When you deploy the API to a hosted environment, make sure these pieces travel together:

- the API service
- a Celery worker service
- Redis as the broker
- Google Vision credentials when `DOCFLOW_OCR_PROVIDER=google_vision`
- Tesseract and Poppler installed in the runtime image as a fallback

The OCR pipeline now uses the queue for real instead of silently falling back to direct execution. If Redis or the worker is missing, uploads should fail loudly rather than pretending to be queued.

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
    uploads/      # local scratch space before object-store write, if needed
    processed/    # local scratch space during processing, if needed
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

`/Users/johnsonafuye/Desktop/Second Brain/Projects/Document OCR Engine/docflow.md`
