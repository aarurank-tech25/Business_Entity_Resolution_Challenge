import json
from pathlib import Path
from typing import Any, Dict, Optional
from fastapi import HTTPException
import pandas as pd

from config import MATCHING_RESULTS_FILE, CANDIDATE_PAIRS_FILE, METRICS_FILE
from services.file_service import count_tsv_rows


def get_tsv_info_and_preview(file_path: Path, filename: str, limit: int = 10) -> Dict[str, Any]:
    """
    Get file status, total line count (streamed), and a small row preview
    using nrows without reading the entire file into RAM.
    """
    if not file_path.exists():
        return {
            "status": "not_found",
            "exists": False,
            "filename": filename,
            "message": f"{filename} does not exist yet",
        }

    size_bytes = file_path.stat().st_size
    total_rows = count_tsv_rows(file_path)
    safe_limit = max(1, min(limit, 100))

    try:
        df = pd.read_csv(
            file_path,
            sep="\t",
            nrows=safe_limit,
            dtype=str,
            on_bad_lines="skip"
        )
        records = df.where(pd.notnull(df), None).to_dict(orient="records")
        columns = list(df.columns)
    except pd.errors.EmptyDataError:
        records = []
        columns = []
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read preview for {filename}: {str(exc)}"
        )

    return {
        "status": "success",
        "exists": True,
        "filename": filename,
        "file_size_bytes": size_bytes,
        "file_size_mb": round(size_bytes / (1024 * 1024), 2),
        "total_rows": total_rows,
        "preview_rows": len(records),
        "columns": columns,
        "preview": records,
    }


def get_matching_results_info(limit: int = 10) -> Dict[str, Any]:
    """Get metadata and small preview of matching_results.tsv."""
    return get_tsv_info_and_preview(MATCHING_RESULTS_FILE, "matching_results.tsv", limit)


def get_candidate_pairs_info(limit: int = 10) -> Dict[str, Any]:
    """Get metadata and small preview of candidate_pairs.tsv."""
    return get_tsv_info_and_preview(CANDIDATE_PAIRS_FILE, "candidate_pairs.tsv", limit)


def get_download_path(kind: str) -> Path:
    """
    Verify and return the path for downloading matching results or candidates.
    Raises 404 if the file does not exist yet.
    """
    if kind == "matching":
        file_path = MATCHING_RESULTS_FILE
    elif kind == "candidates":
        file_path = CANDIDATE_PAIRS_FILE
    else:
        raise HTTPException(status_code=400, detail=f"Invalid download kind '{kind}'")

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Output file '{file_path.name}' does not exist yet. Please run the matching pipeline first."
        )

    return file_path


def get_real_metrics() -> Dict[str, Any]:
    """
    Return real evaluation metrics if available.
    Returns status 'not_available' when metrics have not been generated yet.
    NEVER returns fake or hardcoded scores.
    """
    if not METRICS_FILE.exists():
        return {
            "status": "not_available",
            "message": "Metrics are not available until the matching pipeline is executed"
        }

    try:
        with open(METRICS_FILE, "r", encoding="utf-8") as f:
            metrics_data = json.load(f)
        return {
            "status": "success",
            "metrics": metrics_data,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading metrics file: {str(exc)}"
        )
