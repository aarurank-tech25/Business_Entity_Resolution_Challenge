import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, UploadFile
import pandas as pd

from config import DATASET_FILES, ALLOWED_SOURCES, UPLOAD_DIR

CHUNK_SIZE = 1024 * 1024  # 1MB chunk size for streaming


async def save_uploaded_tsv(file: UploadFile, source_name: str) -> Path:
    """
    Stream an uploaded TSV file directly to disk in chunks to avoid high RAM usage.
    Validates extension and ensures file is not empty.
    """
    if source_name not in ALLOWED_SOURCES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid source name '{source_name}'. Allowed: {list(ALLOWED_SOURCES)}"
        )

    filename = file.filename or ""
    extension = Path(filename).suffix.lower()
    if extension != ".tsv":
        raise HTTPException(
            status_code=400,
            detail=f"{source_name} must be a TSV file (.tsv)"
        )

    target_path = UPLOAD_DIR / f"{source_name}.tsv"

    # Stream write in chunks
    total_bytes = 0
    try:
        with open(target_path, "wb") as f_out:
            while chunk := await file.read(CHUNK_SIZE):
                f_out.write(chunk)
                total_bytes += len(chunk)
    except Exception as exc:
        if target_path.exists():
            target_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save upload for {source_name}: {str(exc)}"
        )

    if total_bytes == 0:
        if target_path.exists():
            target_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail=f"{source_name} file is empty. Empty files are not allowed."
        )

    return target_path


def get_dataset_info(source_name: str) -> Dict[str, Any]:
    """
    Get file status, existence, and size for an uploaded dataset.
    """
    if source_name not in ALLOWED_SOURCES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid source name '{source_name}'. Allowed: {list(ALLOWED_SOURCES)}"
        )

    file_path = DATASET_FILES[source_name]
    exists = file_path.exists()
    size_bytes = file_path.stat().st_size if exists else 0

    return {
        "source": source_name,
        "filename": f"{source_name}.tsv",
        "exists": exists,
        "file_size_bytes": size_bytes,
        "file_size_mb": round(size_bytes / (1024 * 1024), 2) if exists else 0.0,
    }


def get_all_datasets_info() -> Dict[str, Any]:
    """
    Return summary information for all uploaded source datasets.
    """
    datasets = {source: get_dataset_info(source) for source in ALLOWED_SOURCES}
    all_uploaded = all(d["exists"] for d in datasets.values())
    return {
        "status": "success",
        "all_uploaded": all_uploaded,
        "datasets": datasets,
    }


def count_tsv_rows(file_path: Path) -> int:
    """
    Count total data rows in a TSV file in a streaming manner without loading into memory.
    Subtracts the header line.
    """
    if not file_path.exists():
        return 0

    lines = 0
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(CHUNK_SIZE), b""):
            lines += chunk.count(b"\n")

    # If file is non-empty and has at least header line, data rows = lines - 1
    return max(0, lines - 1) if file_path.stat().st_size > 0 else 0


def get_dataset_preview(source_name: str, limit: int = 10) -> Dict[str, Any]:
    """
    Read only the first `limit` rows of a TSV dataset for preview.
    Does NOT load the entire multi-hundred-MB dataset into memory.
    """
    if source_name not in ALLOWED_SOURCES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid source name '{source_name}'. Allowed sources: {list(ALLOWED_SOURCES)}"
        )

    file_path = DATASET_FILES[source_name]
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Dataset '{source_name}' does not exist. Please upload {source_name}.tsv first."
        )

    # Bound the preview limit safely
    safe_limit = max(1, min(limit, 100))

    try:
        # Memory-efficient read with nrows
        df = pd.read_csv(
            file_path,
            sep="\t",
            nrows=safe_limit,
            dtype=str,
            on_bad_lines="skip"
        )
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=400,
            detail=f"Dataset '{source_name}' is empty or contains no valid rows."
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Error reading TSV preview for '{source_name}': {str(exc)}"
        )

    # Convert NaN to None for clean JSON serialization
    records = df.where(pd.notnull(df), None).to_dict(orient="records")

    return {
        "status": "success",
        "source": source_name,
        "filename": f"{source_name}.tsv",
        "preview_rows": len(records),
        "columns": list(df.columns),
        "data": records,
    }
