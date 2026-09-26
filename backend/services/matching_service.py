import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, TypedDict, Union
from fastapi import HTTPException

from config import (
    MATCHING_RESULTS_FILE,
    CANDIDATE_PAIRS_FILE,
    METRICS_FILE,
    DATASET_TEST_DIR,
    VALIDATION_SCRIPT_PATH,
    DATASET_FILES,
)

# ============================================================================
# INTEGRATION CONTRACT FOR MEMBER 2 (ML / Entity Resolution Pipeline)
# ============================================================================

class MatchRecord(TypedDict):
    source1_entity_id: str
    matched_entity_ids: Union[List[str], str]


class CandidateRecord(TypedDict):
    source1_entity_id: str
    candidate_entity_ids: Union[List[str], str]


class EvaluationMetrics(TypedDict, total=False):
    f0_5: float
    precision: float
    recall: float
    total_source1: int
    matched_source1: int
    singleton_source1: int


class MatchingPipelineResult(TypedDict):
    """
    Contract returned by Member 2's entity resolution pipeline:
    {
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
            "f0_5": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "total_source1": ...,
            "matched_source1": ...,
            "singleton_source1": ...
        }
    }
    """
    matches: List[MatchRecord]
    candidates: List[CandidateRecord]
    metrics: Optional[EvaluationMetrics]


# Signature of Member 2's pipeline function:
# fn(source1_path: Path, source2_path: Path, source3_path: Path) -> MatchingPipelineResult
PipelineFunctionType = Callable[[Path, Path, Path], MatchingPipelineResult]

# Holds the real pipeline implementation once Member 2 provides it
_PIPELINE_FUNCTION: Optional[PipelineFunctionType] = None


def register_matching_pipeline(pipeline_func: PipelineFunctionType) -> None:
    """
    Plugin entry point for Member 2 to attach their ML / entity matching pipeline.
    """
    global _PIPELINE_FUNCTION
    _PIPELINE_FUNCTION = pipeline_func


def is_pipeline_connected() -> bool:
    """Check if Member 2's pipeline is currently plugged in."""
    return _PIPELINE_FUNCTION is not None


def save_pipeline_outputs(result: MatchingPipelineResult) -> None:
    """
    Save the outputs from the real ML pipeline into the exact challenge files.
    - outputs/matching_results.tsv: source1_entity_id \t matched_entity_ids
    - outputs/candidate_pairs.tsv: source1_entity_id \t candidate_entity_ids
    - outputs/metrics.json: metrics dictionary
    """
    MATCHING_RESULTS_FILE.parent.mkdir(parents=True, exist_ok=True)

    # 1. Write matching_results.tsv
    with open(MATCHING_RESULTS_FILE, "w", encoding="utf-8") as f_match:
        f_match.write("source1_entity_id\tmatched_entity_ids\n")
        for item in result.get("matches", []):
            s1_id = item.get("source1_entity_id", "")
            matched = item.get("matched_entity_ids", "")
            if isinstance(matched, list):
                matched_str = ",".join(str(x) for x in matched)
            else:
                matched_str = str(matched)
            f_match.write(f"{s1_id}\t{matched_str}\n")

    # 2. Write candidate_pairs.tsv
    with open(CANDIDATE_PAIRS_FILE, "w", encoding="utf-8") as f_cand:
        f_cand.write("source1_entity_id\tcandidate_entity_ids\n")
        for item in result.get("candidates", []):
            s1_id = item.get("source1_entity_id", "")
            candidates = item.get("candidate_entity_ids", "")
            if isinstance(candidates, list):
                cand_str = ",".join(str(x) for x in candidates)
            else:
                cand_str = str(candidates)
            f_cand.write(f"{s1_id}\t{cand_str}\n")

    # 3. Write metrics.json if metrics provided
    metrics = result.get("metrics")
    if metrics:
        with open(METRICS_FILE, "w", encoding="utf-8") as f_met:
            json.dump(metrics, f_met, indent=2)


def run_matching(
    source1_path: Path,
    source2_path: Path,
    source3_path: Path,
) -> Dict[str, Any]:
    """
    Executes the entity matching pipeline.
    Validates uploaded dataset existence.
    If the real ML pipeline is not plugged in, returns a clean error without
    generating fake matches or dummy files.
    """
    for name, path in [("source1", source1_path), ("source2", source2_path), ("source3", source3_path)]:
        if not path.exists():
            raise HTTPException(
                status_code=400,
                detail=f"Required dataset '{name}' ({path.name}) is missing. Upload all 3 datasets first."
            )

    if _PIPELINE_FUNCTION is None:
        return {
            "status": "error",
            "message": "Matching pipeline is not connected yet"
        }

    # Execute the connected ML pipeline
    try:
        pipeline_result = _PIPELINE_FUNCTION(source1_path, source2_path, source3_path)
        save_pipeline_outputs(pipeline_result)
        return {
            "status": "success",
            "message": "Matching pipeline executed successfully",
            "total_matches": len(pipeline_result.get("matches", [])),
            "total_candidates": len(pipeline_result.get("candidates", [])),
            "metrics": pipeline_result.get("metrics"),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing matching pipeline: {str(exc)}"
        )


def execute_validation(
    matching_path: Path = MATCHING_RESULTS_FILE,
    candidate_path: Path = CANDIDATE_PAIRS_FILE,
    test_dir: Path = DATASET_TEST_DIR,
    script_path: Path = VALIDATION_SCRIPT_PATH,
) -> Dict[str, Any]:
    """
    Execute the official challenge submission validation script:
    python3 utils/validate_submission.py \
      --matching output/matching_results.tsv \
      --candidate output/candidate_pairs.tsv \
      --test-dir dataset/test
    """
    if not matching_path.exists():
        raise HTTPException(
            status_code=400,
            detail=f"Matching results file '{matching_path.name}' not found. Please run matching first."
        )

    if not candidate_path.exists():
        raise HTTPException(
            status_code=400,
            detail=f"Candidate pairs file '{candidate_path.name}' not found. Please run matching first."
        )

    if not test_dir.exists():
        raise HTTPException(
            status_code=400,
            detail=(
                f"Test dataset directory '{test_dir}' does not exist. "
                "Configure DATASET_TEST_DIR environment variable if located elsewhere."
            )
        )

    if not script_path.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                f"Validation script '{script_path}' not found. "
                "Ensure utils/validate_submission.py exists or configure VALIDATION_SCRIPT_PATH."
            )
        )

    cmd = [
        sys.executable,
        str(script_path),
        "--matching", str(matching_path),
        "--candidate", str(candidate_path),
        "--test-dir", str(test_dir),
    ]

    try:
        process = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
            check=False
        )
        return {
            "status": "success" if process.returncode == 0 else "error",
            "exit_code": process.returncode,
            "stdout": process.stdout,
            "stderr": process.stderr,
            "command": " ".join(cmd),
        }
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="Validation script execution timed out after 120 seconds."
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute validation script: {str(exc)}"
        )
