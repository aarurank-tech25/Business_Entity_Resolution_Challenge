from pathlib import Path
from typing import Optional
from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from config import DATASET_FILES, ALLOWED_SOURCES
from services.file_service import (
    save_uploaded_tsv,
    get_all_datasets_info,
    get_dataset_preview,
)

router = APIRouter(tags=["Datasets & Upload"])


@router.post("/upload/", summary="Upload source datasets")
@router.post("/upload", include_in_schema=False)
async def upload_files(
    source1: UploadFile = File(..., description="Source 1 TSV dataset"),
    source2: UploadFile = File(..., description="Source 2 TSV dataset"),
    source3: UploadFile = File(..., description="Source 3 TSV dataset"),
):
    """
    Upload source1, source2, and source3 TSV datasets.
    Validates file extensions and prevents saving empty files.
    Streams files in chunks to disk safely without high RAM usage.
    """
    uploads = {
        "source1": source1,
        "source2": source2,
        "source3": source3,
    }

    saved_files = {}

    for source_name, file in uploads.items():
        saved_path = await save_uploaded_tsv(file, source_name)
        saved_files[source_name] = str(saved_path)

    return {
        "status": "success",
        "message": "All three datasets uploaded successfully",
        "files": saved_files,
    }


@router.get("/datasets", summary="List uploaded dataset status")
def list_datasets():
    """
    Return existence, filename, and size information for all three source datasets.
    """
    return get_all_datasets_info()


@router.get("/datasets/{source_name}/preview", summary="Preview rows from a dataset")
def preview_dataset(
    source_name: str,
    limit: int = Query(10, ge=1, le=100, description="Number of rows to preview (1-100)"),
):
    """
    Preview the first few rows of an uploaded TSV dataset (source1, source2, or source3).
    Does NOT load the entire multi-hundred-MB dataset into memory.
    """
    if source_name not in ALLOWED_SOURCES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid dataset '{source_name}'. Must be one of: {list(ALLOWED_SOURCES)}"
        )

    return get_dataset_preview(source_name, limit=limit)