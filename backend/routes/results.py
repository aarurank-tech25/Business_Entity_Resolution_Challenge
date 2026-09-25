from fastapi import APIRouter, Query
from fastapi.responses import FileResponse

from services.result_service import (
    get_matching_results_info,
    get_candidate_pairs_info,
    get_download_path,
)

router = APIRouter(tags=["Results & Candidates"])


@router.get("/results", summary="Inspect matching_results.tsv status and preview")
def get_results(
    limit: int = Query(10, ge=1, le=100, description="Number of preview rows (1-100)"),
):
    """
    Check if matching_results.tsv exists.
    If it exists, returns:
    - total result rows (counted without loading entire file)
    - a small row preview
    - output file metadata
    """
    return get_matching_results_info(limit=limit)


@router.get("/results/download", summary="Download matching_results.tsv")
def download_results():
    """
    Download the generated matching_results.tsv file.
    Raises 404 if the results have not been generated yet.
    """
    file_path = get_download_path("matching")
    return FileResponse(
        path=str(file_path),
        filename="matching_results.tsv",
        media_type="text/tab-separated-values",
    )


@router.get("/candidates", summary="Inspect candidate_pairs.tsv status and preview")
def get_candidates(
    limit: int = Query(10, ge=1, le=100, description="Number of preview rows (1-100)"),
):
    """
    Check if candidate_pairs.tsv exists.
    If it exists, returns metadata and a small row preview.
    """
    return get_candidate_pairs_info(limit=limit)


@router.get("/candidates/download", summary="Download candidate_pairs.tsv")
def download_candidates():
    """
    Download the generated candidate_pairs.tsv file.
    Raises 404 if the candidate pairs file has not been generated yet.
    """
    file_path = get_download_path("candidates")
    return FileResponse(
        path=str(file_path),
        filename="candidate_pairs.tsv",
        media_type="text/tab-separated-values",
    )
