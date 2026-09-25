from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

import config
from config import (
    DATASET_FILES,
    MATCHING_RESULTS_FILE,
    CANDIDATE_PAIRS_FILE,
    DATASET_TEST_DIR,
    VALIDATION_SCRIPT_PATH,
)
from services.matching_service import (
    run_matching,
    execute_validation,
    is_pipeline_connected,
)

router = APIRouter(tags=["Matching & Validation"])


class ValidationRequest(BaseModel):
    """Optional payload to override default test directory or script path."""
    matching_path: Optional[str] = None
    candidate_path: Optional[str] = None
    test_dir: Optional[str] = None
    script_path: Optional[str] = None


@router.post(
    "/run-matching",
    summary="Execute entity resolution matching pipeline",
    response_description="Matching execution status and result summary",
)
def run_matching_endpoint():
    """
    Trigger the entity resolution matching pipeline.
    Validates that source1, source2, and source3 have been uploaded.
    If the real ML pipeline from Member 2 is not yet connected,
    returns a clear error without generating fake matches or dummy files.
    """
    # 1. Verify datasets exist
    for source_name, file_path in config.DATASET_FILES.items():
        if not file_path.exists():
            raise HTTPException(
                status_code=400,
                detail=f"Required dataset '{source_name}' ({file_path.name}) not found. Please upload all 3 source datasets first."
            )

    # 2. Check if Member 2's ML pipeline is connected
    if not is_pipeline_connected():
        raise HTTPException(
            status_code=503,
            detail="Matching pipeline is not connected yet"
        )

    # 3. Run connected pipeline
    result = run_matching(
        config.DATASET_FILES["source1"],
        config.DATASET_FILES["source2"],
        config.DATASET_FILES["source3"],
    )
    return result


@router.post(
    "/validate",
    summary="Run official submission validation script",
    response_description="Validation script execution output and exit code",
)
def validate_submission_endpoint(payload: Optional[ValidationRequest] = None):
    """
    Execute the official challenge validation script:
    python3 utils/validate_submission.py \\
      --matching output/matching_results.tsv \\
      --candidate output/candidate_pairs.tsv \\
      --test-dir dataset/test

    Verifies required files exist before executing.
    Test directory path is configurable via DATASET_TEST_DIR or request body.
    """
    from pathlib import Path

    matching_p = Path(payload.matching_path).resolve() if payload and payload.matching_path else MATCHING_RESULTS_FILE
    candidate_p = Path(payload.candidate_path).resolve() if payload and payload.candidate_path else CANDIDATE_PAIRS_FILE
    test_d = Path(payload.test_dir).resolve() if payload and payload.test_dir else DATASET_TEST_DIR
    script_p = Path(payload.script_path).resolve() if payload and payload.script_path else VALIDATION_SCRIPT_PATH

    return execute_validation(
        matching_path=matching_p,
        candidate_path=candidate_p,
        test_dir=test_d,
        script_path=script_p,
    )
