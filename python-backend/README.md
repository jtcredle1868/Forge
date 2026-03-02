# The Forge - Python Backend Service

FastAPI service for document export and text analysis.

## Setup

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Endpoints

- `GET /health` — Health check
- `POST /export/docx` — Export manuscript as .docx
- `POST /export/pdf` — Export manuscript as .pdf
- `POST /analyze/text` — Statistical text analysis

## Integration

Set `PYTHON_BACKEND_URL=http://localhost:8001` in your `.env` to enable Python-powered exports.
