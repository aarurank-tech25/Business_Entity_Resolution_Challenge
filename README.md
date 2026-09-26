# Amazon Business Entity Resolution Challenge

Repository for the **Amazon Business Entity Resolution Challenge**.

## Project Architecture
- `backend/`: FastAPI backend service handling dataset ingestion, streaming preview, challenge submission validation, and clean integration hooks for the entity matching pipeline.
- `utils/`: Challenge evaluation and submission verification utilities (e.g. `validate_submission.py`).
- `dataset/`: Challenge datasets (kept strictly local, excluded from Git).

## Backend Quickstart
For setup, API endpoints, and development instructions, see the [Backend README](backend/README.md).

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload
```
API Documentation will be available at: `http://localhost:8000/docs`.
