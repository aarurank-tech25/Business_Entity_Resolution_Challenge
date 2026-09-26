# Business Entity Resolution Backend

Production-ready FastAPI backend for the **Amazon Business Entity Resolution Challenge**.
The backend handles memory-efficient dataset ingestion, previewing, challenge artifact generation, submission validation, and clean integration for the ML / entity resolution pipeline.

---

## 1. Setup & Installation

### Prerequisites
- Python 3.10+ (tested on Python 3.11)

### Create Virtual Environment
Open PowerShell inside `backend/`:
```powershell
python -m venv .venv
```

### Activate Virtual Environment on Windows
**PowerShell:**
```powershell
.\.venv\Scripts\Activate.ps1
```
*(If PowerShell restricts script execution, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

**Command Prompt (cmd):**
```cmd
.\.venv\Scripts\activate.bat
```

### Install Requirements
```powershell
python -m pip install -r requirements.txt
```

---

## 2. Running the Backend

Start the FastAPI application with Uvicorn:
```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Once started:
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc UI: `http://localhost:8000/redoc`

---

## 3. Configuration & Environment Variables

The backend supports configurable environment variables with local defaults:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `UPLOAD_DIR` | `backend/uploads/` | Directory where uploaded source TSVs are stored |
| `OUTPUT_DIR` | `backend/outputs/` | Directory where matching outputs and metrics are saved |
| `DATASET_TEST_DIR` | `../dataset/test` | Path to the challenge test evaluation directory |
| `VALIDATION_SCRIPT_PATH` | `../utils/validate_submission.py` | Path to the official submission validation script |

---

## 4. API Endpoints

### System
- `GET /health` - Health status of the API service.

### Datasets & Ingestion
- `POST /upload/` - Upload `source1`, `source2`, and `source3` TSV datasets. Streams files directly to disk to prevent out-of-memory errors on multi-hundred-MB files.
- `GET /datasets` - Lists existence, filename, and file size of all 3 source datasets.
- `GET /datasets/{source_name}/preview?limit=10` - Reads only the first `limit` rows of a dataset using `pandas.read_csv(nrows=limit)` without loading the entire file into RAM.

### Matching & Validation
- `POST /run-matching` - Triggers the entity matching pipeline. Returns a clean error if the ML pipeline has not been plugged in yet.
- `POST /validate` - Executes the official submission validation script (`utils/validate_submission.py`) when outputs exist.

### Results & Metrics
- `GET /results` - Inspects status, line count, and preview of `outputs/matching_results.tsv`.
- `GET /results/download` - Downloads `matching_results.tsv`.
- `GET /candidates` - Inspects status, line count, and preview of `outputs/candidate_pairs.tsv`.
- `GET /candidates/download` - Downloads `candidate_pairs.tsv`.
- `GET /metrics` - Returns REAL evaluation metrics (F0.5, precision, recall). If the pipeline has not run, returns `{"status": "not_available", "message": "..."}`. Hardcoded/fake scores are NEVER returned.

---

## 5. Dataset Upload Example

### Using cURL:
```bash
curl -X POST "http://localhost:8000/upload/" \
  -F "source1=@/path/to/source1.tsv" \
  -F "source2=@/path/to/source2.tsv" \
  -F "source3=@/path/to/source3.tsv"
```

### Using Python (`requests`):
```python
import requests

files = {
    "source1": open("dataset/source1.tsv", "rb"),
    "source2": open("dataset/source2.tsv", "rb"),
    "source3": open("dataset/source3.tsv", "rb"),
}

response = requests.post("http://localhost:8000/upload/", files=files)
print(response.json())
```

---

## 6. Integration Contract for Member 2 (ML Pipeline)

The ML / entity matching pipeline is decoupled from the backend and will be provided by **Member 2**.

To plug in the pipeline, Member 2 can call `register_matching_pipeline` in `services/matching_service.py`:

```python
from services.matching_service import register_matching_pipeline

def member2_pipeline(source1_path, source2_path, source3_path):
    """
    Executes actual entity resolution model.
    Must return a dictionary conforming to the contract below.
    """
    return {
        "matches": [
            {
                "source1_entity_id": "S1-xxxx",
                "matched_entity_ids": ["S2-xxxx", "S3-xxxx"]
            }
        ],
        "candidates": [
            {
                "source1_entity_id": "S1-xxxx",
                "candidate_entity_ids": ["S2-xxxx", "S3-xxxx"]
            }
        ],
        "metrics": {
            "f0_5": 0.88,
            "precision": 0.92,
            "recall": 0.85,
            "total_source1": 1000,
            "matched_source1": 950,
            "singleton_source1": 50
        }
    }

# Register the pipeline function:
register_matching_pipeline(member2_pipeline)
```

Once registered:
- Outputs are saved to `outputs/matching_results.tsv` (`source1_entity_id\tmatched_entity_ids`).
- Candidate pairs are saved to `outputs/candidate_pairs.tsv` (`source1_entity_id\tcandidate_entity_ids`).
- Metrics are saved to `outputs/metrics.json` and served via `GET /metrics`.

---

## 7. Git & Dataset Safety Rules

> [!IMPORTANT]
> **DO NOT COMMIT DATASETS OR VIRTUAL ENVIRONMENTS**
> - The challenge dataset files can be multi-hundred megabytes to gigabytes in size.
> - `.venv/`, `uploads/`, `outputs/`, and `dataset/` directories are explicitly ignored by `.gitignore`.
> - Never add raw challenge TSVs or output TSVs to Git commits.

---

## 8. Running Tests

Run the test suite using Python's built-in `unittest`:
```powershell
python -m unittest tests/test_backend.py
```
